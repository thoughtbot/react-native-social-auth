#import <ReactNativeSocialAuthSpec/ReactNativeSocialAuthSpec.h>

@interface GoogleSignIn : NSObject <NativeGoogleSignInSpec>

+ (BOOL)handleURL:(NSURL *)url;

@end
