#import <AuthenticationServices/AuthenticationServices.h>
#import <ReactNativeSocialAuthSpec/ReactNativeSocialAuthSpec.h>

@interface AppleSignIn : NSObject <NativeAppleSignInSpec,
                                   ASAuthorizationControllerDelegate,
                                   ASAuthorizationControllerPresentationContextProviding>

@end
