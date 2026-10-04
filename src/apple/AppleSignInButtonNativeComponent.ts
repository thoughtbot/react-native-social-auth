import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

/**
 * Codegen spec for the native `ASAuthorizationAppleIDButton` wrapper. Props are
 * low-level integers/floats that map directly onto Apple's enums; the friendly
 * string API lives in {@link AppleSignInButton}.
 *
 * @internal
 */
export interface NativeProps extends ViewProps {
  /** `ASAuthorizationAppleIDButtonType` raw value (signIn=0, continue=1, signUp=2). */
  buttonType?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>;
  /** `ASAuthorizationAppleIDButtonStyle` raw value (white=0, whiteOutline=1, black=2). */
  buttonStyle?: CodegenTypes.WithDefault<CodegenTypes.Int32, 2>;
  /** Corner radius in points. A negative value keeps Apple's default. */
  cornerRadius?: CodegenTypes.WithDefault<CodegenTypes.Float, -1>;
  /** Fired when the native button is tapped. */
  onButtonPress?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('AppleSignInButton');
