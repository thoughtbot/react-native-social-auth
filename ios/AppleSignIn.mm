#import "AppleSignIn.h"
#import <React/RCTUtils.h>

static NSString *const kErrCancelled   = @"SIGN_IN_CANCELLED";
static NSString *const kErrFailed      = @"SIGN_IN_FAILED";
static NSString *const kErrInvalidResp = @"INVALID_RESPONSE";
static NSString *const kErrNotHandled  = @"NOT_HANDLED";

@implementation AppleSignIn {
  NSArray<ASAuthorizationScope> *_requestedScopes;
  NSString *_nonce;
  NSString *_state;

  // Retained for the lifetime of an in-flight authorization request; the
  // controller holds only a weak delegate reference, so we keep strong refs
  // here until the delegate callback fires.
  ASAuthorizationController *_controller;
  RCTPromiseResolveBlock _pendingResolve;
  RCTPromiseRejectBlock _pendingReject;
}

#pragma mark - NativeAppleSignInSpec

- (void)configure:(NSDictionary *)config {
  _nonce = [self stringOrNil:config[@"nonce"]];
  _state = [self stringOrNil:config[@"state"]];

  id rawScopes = config[@"requestedScopes"];
  NSArray *scopes =
      [rawScopes isKindOfClass:[NSArray class]] ? rawScopes : @[ @"email", @"fullName" ];

  NSMutableArray<ASAuthorizationScope> *mapped = [NSMutableArray array];
  for (id scope in scopes) {
    if ([scope isEqual:@"email"]) {
      [mapped addObject:ASAuthorizationScopeEmail];
    } else if ([scope isEqual:@"fullName"]) {
      [mapped addObject:ASAuthorizationScopeFullName];
    }
  }
  _requestedScopes = mapped;
}

- (void)signIn:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  if (_pendingResolve != nil) {
    reject(kErrFailed, @"A sign-in request is already in progress", nil);
    return;
  }

  _pendingResolve = [resolve copy];
  _pendingReject = [reject copy];

  dispatch_async(dispatch_get_main_queue(), ^{
    ASAuthorizationAppleIDProvider *provider =
        [[ASAuthorizationAppleIDProvider alloc] init];
    ASAuthorizationAppleIDRequest *request = [provider createRequest];
    request.requestedScopes = self->_requestedScopes;
    if (self->_nonce != nil) {
      request.nonce = self->_nonce;
    }
    if (self->_state != nil) {
      request.state = self->_state;
    }

    self->_controller = [[ASAuthorizationController alloc]
        initWithAuthorizationRequests:@[ request ]];
    self->_controller.delegate = self;
    self->_controller.presentationContextProvider = self;
    [self->_controller performRequests];
  });
}

- (void)getCredentialState:(NSString *)userId
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  ASAuthorizationAppleIDProvider *provider =
      [[ASAuthorizationAppleIDProvider alloc] init];
  [provider getCredentialStateForUserID:userId
                             completion:^(ASAuthorizationAppleIDProviderCredentialState state,
                                          NSError *_Nullable error) {
    if (error != nil) {
      reject(kErrFailed, error.localizedDescription, error);
      return;
    }
    resolve([self credentialStateToString:state]);
  }];
}

- (NSNumber *)isAvailable {
  return @YES; // Minimum deployment target is iOS 15.1 (>= 13).
}

#pragma mark - ASAuthorizationControllerDelegate

- (void)authorizationController:(ASAuthorizationController *)controller
    didCompleteWithAuthorization:(ASAuthorization *)authorization {
  RCTPromiseResolveBlock resolve = _pendingResolve;
  RCTPromiseRejectBlock reject = _pendingReject;
  [self clearPendingRequest];

  if (![authorization.credential
          isKindOfClass:[ASAuthorizationAppleIDCredential class]]) {
    if (reject != nil) {
      reject(kErrInvalidResp, @"Unexpected credential type returned by Apple", nil);
    }
    return;
  }

  ASAuthorizationAppleIDCredential *credential =
      (ASAuthorizationAppleIDCredential *)authorization.credential;
  if (resolve != nil) {
    resolve([self credentialToDict:credential]);
  }
}

- (void)authorizationController:(ASAuthorizationController *)controller
           didCompleteWithError:(NSError *)error {
  RCTPromiseRejectBlock reject = _pendingReject;
  [self clearPendingRequest];

  if (reject != nil) {
    [self rejectWithError:error reject:reject];
  }
}

#pragma mark - ASAuthorizationControllerPresentationContextProviding

- (ASPresentationAnchor)presentationAnchorForAuthorizationController:
    (ASAuthorizationController *)controller {
  return RCTKeyWindow();
}

#pragma mark - TurboModule plumbing

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeAppleSignInSpecJSI>(params);
}

+ (NSString *)moduleName {
  return @"AppleSignIn";
}

#pragma mark - Marshalling helpers

- (NSDictionary *)credentialToDict:(ASAuthorizationAppleIDCredential *)credential {
  return @{
    @"identityToken":     [self dataToString:credential.identityToken]     ?: (id)kCFNull,
    @"authorizationCode": [self dataToString:credential.authorizationCode] ?: (id)kCFNull,
    @"state":             credential.state                                 ?: (id)kCFNull,
    @"user":              [self userToDict:credential],
  };
}

- (NSDictionary *)userToDict:(ASAuthorizationAppleIDCredential *)credential {
  NSPersonNameComponents *name = credential.fullName;
  id fullName = (id)kCFNull;
  if (name != nil) {
    fullName = @{
      @"givenName":  name.givenName  ?: (id)kCFNull,
      @"familyName": name.familyName ?: (id)kCFNull,
      @"nickname":   name.nickname   ?: (id)kCFNull,
    };
  }
  return @{
    @"id":             credential.user ?: (id)kCFNull,
    @"email":          credential.email ?: (id)kCFNull,
    @"fullName":       fullName,
    @"realUserStatus": [self realUserStatusToString:credential.realUserStatus],
  };
}

- (NSString *)realUserStatusToString:(ASUserDetectionStatus)status {
  switch (status) {
    case ASUserDetectionStatusLikelyReal:
      return @"likelyReal";
    case ASUserDetectionStatusUnknown:
      return @"unknown";
    case ASUserDetectionStatusUnsupported:
    default:
      return @"unsupported";
  }
}

- (NSString *)credentialStateToString:(ASAuthorizationAppleIDProviderCredentialState)state {
  switch (state) {
    case ASAuthorizationAppleIDProviderCredentialAuthorized:
      return @"authorized";
    case ASAuthorizationAppleIDProviderCredentialRevoked:
      return @"revoked";
    case ASAuthorizationAppleIDProviderCredentialTransferred:
      return @"transferred";
    case ASAuthorizationAppleIDProviderCredentialNotFound:
    default:
      return @"notFound";
  }
}

#pragma mark - Error mapping

- (void)rejectWithError:(NSError *)error reject:(RCTPromiseRejectBlock)reject {
  NSString *code = kErrFailed;

  if ([error.domain isEqualToString:ASAuthorizationErrorDomain]) {
    switch (error.code) {
      case ASAuthorizationErrorCanceled:
        code = kErrCancelled;
        break;
      case ASAuthorizationErrorInvalidResponse:
        code = kErrInvalidResp;
        break;
      case ASAuthorizationErrorNotHandled:
        code = kErrNotHandled;
        break;
      case ASAuthorizationErrorFailed:
      case ASAuthorizationErrorNotInteractive:
      case ASAuthorizationErrorUnknown:
      default:
        code = kErrFailed;
        break;
    }
  }

  reject(code, error.localizedDescription, error);
}

#pragma mark - Utilities

- (void)clearPendingRequest {
  _pendingResolve = nil;
  _pendingReject = nil;
  _controller = nil;
}

- (NSString *)dataToString:(NSData *)data {
  if (data == nil) {
    return nil;
  }
  return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

- (NSString *)stringOrNil:(id)value {
  if ([value isKindOfClass:[NSString class]] && ((NSString *)value).length > 0) {
    return (NSString *)value;
  }
  return nil;
}

@end
