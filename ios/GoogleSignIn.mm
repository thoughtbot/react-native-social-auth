#import "GoogleSignIn.h"

@implementation GoogleSignIn

- (void)configure:(NSDictionary *)config {
  // TODO: Phase 4 — Store configuration for GoogleSignIn-iOS SDK
}

- (void)signIn:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  reject(@"ERR_NOT_IMPLEMENTED", @"Google Sign-In is not yet implemented on iOS", nil);
}

- (void)signOut:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  reject(@"ERR_NOT_IMPLEMENTED", @"Google Sign-In is not yet implemented on iOS", nil);
}

- (void)getCurrentUser:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  reject(@"ERR_NOT_IMPLEMENTED", @"Google Sign-In is not yet implemented on iOS", nil);
}

- (void)revokeAccess:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  reject(@"ERR_NOT_IMPLEMENTED", @"Google Sign-In is not yet implemented on iOS", nil);
}

- (NSNumber *)isSignedIn {
  return @(NO);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeGoogleSignInSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"GoogleSignIn";
}

@end
