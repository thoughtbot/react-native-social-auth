import {
  Pressable,
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GoogleLogo } from './GoogleLogo';

/**
 * One of the three button themes defined by Google's branding guidelines.
 *
 * - `light` — white background, dark text, gray border
 * - `dark` — near-black background, light text, gray border
 * - `neutral` — light gray background, dark text, no border
 */
export type GoogleSignInButtonTheme = 'light' | 'dark' | 'neutral';

/**
 * Button corner radius:
 *
 * - `rounded` — pill shape (`borderRadius: 20`)
 * - `square` — slightly rounded rectangle (`borderRadius: 4`)
 */
export type GoogleSignInButtonShape = 'rounded' | 'square';

/**
 * The call-to-action label. Only these three strings are permitted by Google.
 *
 * - `signin` — "Sign in with Google"
 * - `signup` — "Sign up with Google"
 * - `continue` — "Continue with Google"
 */
export type GoogleSignInButtonText = 'signin' | 'signup' | 'continue';

/**
 * Button size:
 *
 * - `standard` — full button with logo + text
 * - `icon` — 40×40 logo-only button for compact layouts
 */
export type GoogleSignInButtonSize = 'standard' | 'icon';

/** Props for {@link GoogleSignInButton}. */
export interface GoogleSignInButtonProps {
  /** {@inheritDoc GoogleSignInButtonTheme} @defaultValue `'light'` */
  theme?: GoogleSignInButtonTheme;
  /** {@inheritDoc GoogleSignInButtonShape} @defaultValue `'rounded'` */
  shape?: GoogleSignInButtonShape;
  /** {@inheritDoc GoogleSignInButtonText} @defaultValue `'signin'` */
  text?: GoogleSignInButtonText;
  /** {@inheritDoc GoogleSignInButtonSize} @defaultValue `'standard'` */
  size?: GoogleSignInButtonSize;
  /** Tap handler. Typically wired to {@link GoogleSignIn.signIn}. */
  onPress?: () => void;
  /**
   * When `true`, renders at 0.38 opacity and disables taps.
   * @defaultValue false
   */
  disabled?: boolean;
  /** Additional container styles (margin, alignment, etc.). */
  style?: StyleProp<ViewStyle>;
  /** Testing identifier. */
  testID?: string;
}

const BUTTON_LABELS: Record<GoogleSignInButtonText, string> = {
  signin: 'Sign in with Google',
  signup: 'Sign up with Google',
  continue: 'Continue with Google',
};

const THEME_STYLES: Record<
  GoogleSignInButtonTheme,
  {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    textColor: string;
  }
> = {
  light: {
    backgroundColor: '#FFFFFF',
    borderColor: '#747775',
    borderWidth: 1,
    textColor: '#1F1F1F',
  },
  dark: {
    backgroundColor: '#131314',
    borderColor: '#8E918F',
    borderWidth: 1,
    textColor: '#E3E3E3',
  },
  neutral: {
    backgroundColor: '#F2F2F2',
    borderColor: 'transparent',
    borderWidth: 0,
    textColor: '#1F1F1F',
  },
};

/**
 * A pre-built button conforming to Google's official branding guidelines.
 *
 * @remarks
 * The Google "G" is rendered via `react-native-svg` so the button stays crisp
 * at any density without bundled raster assets. Colors, typography, padding,
 * and the permitted CTA strings all follow the official spec — do not
 * restyle the logo or override theme colors, or Google may reject your app
 * during brand review.
 *
 * @example
 * ```tsx
 * <GoogleSignInButton
 *   theme="dark"
 *   text="continue"
 *   onPress={() => GoogleSignIn.signIn()}
 * />
 * ```
 */
export function GoogleSignInButton({
  theme = 'light',
  shape = 'rounded',
  text = 'signin',
  size = 'standard',
  onPress,
  disabled = false,
  style,
  testID,
}: GoogleSignInButtonProps) {
  const themeStyle = THEME_STYLES[theme];
  const isIcon = size === 'icon';
  const borderRadius = shape === 'rounded' ? 20 : 4;
  const label = BUTTON_LABELS[text];

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: themeStyle.backgroundColor,
          borderColor: themeStyle.borderColor,
          borderWidth: themeStyle.borderWidth,
          borderRadius,
        },
        isIcon && styles.iconButton,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
    >
      <View style={isIcon ? styles.iconLogoContainer : styles.logoContainer}>
        <GoogleLogo size={20} />
      </View>
      {!isIcon && (
        <Text
          style={[styles.label, { color: themeStyle.textColor }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    alignSelf: 'flex-start',
  },
  iconButton: {
    width: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    marginLeft: 12,
    marginRight: 10,
  },
  iconLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginRight: 12,
  },
  disabled: {
    opacity: 0.38,
  },
});
