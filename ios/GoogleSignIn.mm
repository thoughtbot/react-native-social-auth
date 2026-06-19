#import "GoogleSignIn.h"
#import <React/RCTUtils.h>

#import <GoogleSignIn/GoogleSignIn.h>

static NSString *const kErrCancelled    = @"SIGN_IN_CANCELLED";
static NSString *const kErrFailed       = @"SIGN_IN_FAILED";
static NSString *const kErrNoCreds      = @"NO_CREDENTIALS";
static NSString *const kErrNotConfigured = @"NOT_CONFIGURED";
static NSString *const kErrNetwork      = @"NETWORK_ERROR";
static NSString *const kErrSignOut      = @"SIGN_OUT_FAILED";
static NSString *const kErrRevoke       = @"REVOKE_FAILED";

@implementation GoogleSignIn {
  NSString *_webClientId;
  NSString *_iosClientId;
  NSString *_hostedDomain;
  NSString *_nonce;
  NSArray<NSString *> *_scopes;
  BOOL _autoSelect;
}

#pragma mark - Public URL handler (for AppDelegate forwarding)

+ (BOOL)handleURL:(NSURL *)url {
  return [GIDSignIn.sharedInstance handleURL:url];
}

#pragma mark - NativeGoogleSignInSpec

- (void)configure:(NSDictionary *)config {
  _webClientId  = [self stringOrNil:config[@"webClientId"]];
  _iosClientId  = [self stringOrNil:config[@"iosClientId"]];
  _hostedDomain = [self stringOrNil:config[@"hostedDomain"]];
  _nonce        = [self stringOrNil:config[@"nonce"]];
  _autoSelect   = [config[@"autoSelect"] boolValue];

  id rawScopes = config[@"scopes"];
  _scopes = [rawScopes isKindOfClass:[NSArray class]] ? rawScopes : @[];

  if (_iosClientId.length > 0) {
    GIDConfiguration *gidConfig =
        [[GIDConfiguration alloc] initWithClientID:_iosClientId
                                    serverClientID:_webClientId
                                      hostedDomain:_hostedDomain
                                       openIDRealm:nil];
    GIDSignIn.sharedInstance.configuration = gidConfig;
  }
}

- (void)signIn:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  if (_iosClientId.length == 0) {
    reject(kErrNotConfigured,
           @"GoogleSignIn.configure() must be called with an iosClientId before signIn()",
           nil);
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    [GIDSignIn.sharedInstance restorePreviousSignInWithCompletion:^(GIDGoogleUser * _Nullable user, NSError * _Nullable error) {
      if (user != nil && error == nil) {
        resolve([self credentialToDict:user]);
        return;
      }
      [self presentInteractiveSignInResolve:resolve reject:reject];
    }];
  });
}

- (void)presentInteractiveSignInResolve:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject {
  UIViewController *presenter = RCTPresentedViewController();
  if (presenter == nil) {
    reject(kErrFailed, @"No view controller available to present sign-in", nil);
    return;
  }

  __weak GoogleSignIn *weakSelf = self;
  // Note: GoogleSignIn-iOS 7.x does not expose a `nonce` parameter on its public
  // sign-in API; if a nonce is required, it must be enforced server-side when
  // verifying the ID token. `_nonce` is captured here for forward compatibility.
  if (_scopes.count > 0) {
    [GIDSignIn.sharedInstance signInWithPresentingViewController:presenter
                                                            hint:nil
                                                additionalScopes:_scopes
                                                      completion:^(GIDSignInResult *result, NSError *error) {
      [weakSelf handleSignInResult:result error:error resolve:resolve reject:reject];
    }];
  } else {
    [GIDSignIn.sharedInstance signInWithPresentingViewController:presenter
                                                      completion:^(GIDSignInResult *result, NSError *error) {
      [weakSelf handleSignInResult:result error:error resolve:resolve reject:reject];
    }];
  }
}

- (void)handleSignInResult:(GIDSignInResult *)result
                     error:(NSError *)error
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  if (error != nil) {
    [self rejectWithError:error reject:reject];
    return;
  }
  if (result.user == nil) {
    reject(kErrFailed, @"Sign-in returned no user", nil);
    return;
  }
  resolve([self credentialToDict:result.user]);
}

- (void)signOut:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  @try {
    [GIDSignIn.sharedInstance signOut];
    resolve(nil);
  } @catch (NSException *e) {
    reject(kErrSignOut, e.reason, nil);
  }
}

- (void)getCurrentUser:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  GIDGoogleUser *user = GIDSignIn.sharedInstance.currentUser;
  resolve(user != nil ? [self userToDict:user] : (id)kCFNull);
}

- (void)revokeAccess:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [GIDSignIn.sharedInstance disconnectWithCompletion:^(NSError * _Nullable error) {
    if (error != nil) {
      reject(kErrRevoke, error.localizedDescription, error);
      return;
    }
    resolve(nil);
  }];
}

- (NSNumber *)isSignedIn {
  return @(GIDSignIn.sharedInstance.currentUser != nil);
}

#pragma mark - TurboModule plumbing

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeGoogleSignInSpecJSI>(params);
}

+ (NSString *)moduleName {
  return @"GoogleSignIn";
}

#pragma mark - Marshalling helpers

- (NSDictionary *)userToDict:(GIDGoogleUser *)user {
  GIDProfileData *profile = user.profile;
  NSString *photoUrl = nil;
  if (profile.hasImage) {
    NSURL *imageURL = [profile imageURLWithDimension:200];
    photoUrl = imageURL.absoluteString;
  }
  return @{
    @"id":          user.userID         ?: (id)kCFNull,
    @"email":       profile.email       ?: (id)kCFNull,
    @"displayName": profile.name        ?: (id)kCFNull,
    @"givenName":   profile.givenName   ?: (id)kCFNull,
    @"familyName":  profile.familyName  ?: (id)kCFNull,
    @"photoUrl":    photoUrl            ?: (id)kCFNull,
  };
}

- (NSDictionary *)credentialToDict:(GIDGoogleUser *)user {
  return @{
    @"idToken":        user.idToken.tokenString ?: (id)kCFNull,
    @"accessToken":    user.accessToken.tokenString ?: (id)kCFNull,
    @"serverAuthCode": (id)kCFNull,
    @"user":           [self userToDict:user],
  };
}

#pragma mark - Error mapping

- (void)rejectWithError:(NSError *)error reject:(RCTPromiseRejectBlock)reject {
  NSString *code = kErrFailed;

  if ([error.domain isEqualToString:kGIDSignInErrorDomain]) {
    switch (error.code) {
      case kGIDSignInErrorCodeCanceled:
        code = kErrCancelled;
        break;
      case kGIDSignInErrorCodeHasNoAuthInKeychain:
        code = kErrNoCreds;
        break;
      default:
        code = kErrFailed;
        break;
    }
  } else if ([error.domain isEqualToString:NSURLErrorDomain]) {
    code = kErrNetwork;
  }

  reject(code, error.localizedDescription, error);
}

#pragma mark - Utilities

- (NSString *)stringOrNil:(id)value {
  if ([value isKindOfClass:[NSString class]] && ((NSString *)value).length > 0) {
    return (NSString *)value;
  }
  return nil;
}

@end
