import {
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import AppleSignInButtonView from './AppleSignInButtonNativeComponent';

// ASAuthorizationAppleIDButton has an intrinsic size but no default height when
// laid out by Yoga, so we give it a sensible one that callers can override.
const BUTTON_HEIGHT = 44;

/**
 * The call-to-action, mapping to `ASAuthorizationAppleIDButton.ButtonType`.
 *
 * - `signIn` — "Sign in with Apple"
 * - `continue` — "Continue with Apple"
 * - `signUp` — "Sign up with Apple"
 */
export type AppleSignInButtonType = 'signIn' | 'continue' | 'signUp';

/**
 * The visual style, mapping to `ASAuthorizationAppleIDButton.Style`.
 *
 * - `black` — black background, white text
 * - `white` — white background, black text
 * - `whiteOutline` — white background, black text, hairline border
 */
export type AppleSignInButtonStyle = 'black' | 'white' | 'whiteOutline';

/** Props for {@link AppleSignInButton}. */
export interface AppleSignInButtonProps {
  /** {@inheritDoc AppleSignInButtonType} @defaultValue `'signIn'` */
  type?: AppleSignInButtonType;
  /** {@inheritDoc AppleSignInButtonStyle} @defaultValue `'black'` */
  buttonStyle?: AppleSignInButtonStyle;
  /** Corner radius in points. Omit to keep Apple's default. */
  cornerRadius?: number;
  /** Tap handler. Typically wired to {@link AppleSignIn.signIn}. */
  onPress?: () => void;
  /** Additional container styles (margin, width, height, alignment, etc.). */
  style?: StyleProp<ViewStyle>;
  /** Testing identifier. */
  testID?: string;
}

const TYPE_TO_NATIVE: Record<AppleSignInButtonType, number> = {
  signIn: 0,
  continue: 1,
  signUp: 2,
};

const STYLE_TO_NATIVE: Record<AppleSignInButtonStyle, number> = {
  white: 0,
  whiteOutline: 1,
  black: 2,
};

/**
 * The official "Sign in with Apple" button, rendered by Apple's native
 * `ASAuthorizationAppleIDButton` so it always matches current Human Interface
 * Guidelines and localizes automatically.
 *
 * @remarks
 * iOS-only — renders `null` on Android (where Sign in with Apple is
 * unavailable in this library). Wire {@link AppleSignInButtonProps.onPress} to
 * {@link AppleSignIn.signIn}.
 *
 * @example
 * ```tsx
 * <AppleSignInButton
 *   type="continue"
 *   buttonStyle="black"
 *   onPress={() => AppleSignIn.signIn()}
 * />
 * ```
 */
export function AppleSignInButton({
  type = 'signIn',
  buttonStyle = 'black',
  cornerRadius,
  onPress,
  style,
  testID,
}: AppleSignInButtonProps) {
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <AppleSignInButtonView
      buttonType={TYPE_TO_NATIVE[type]}
      buttonStyle={STYLE_TO_NATIVE[buttonStyle]}
      cornerRadius={cornerRadius ?? -1}
      onButtonPress={onPress}
      style={[styles.button, style]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    alignSelf: 'flex-start',
  },
});
