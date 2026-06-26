import {
  Pressable,
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GoogleLogo } from './GoogleLogo';

// Layout dimensions
const BUTTON_HEIGHT = 40;
const ICON_BUTTON_SIZE = 40;
const BORDER_RADIUS_ROUNDED = 20;
const BORDER_RADIUS_SQUARE = 4;
const GOOGLE_LOGO_SIZE = 20;

// Spacing
const LOGO_MARGIN_START = 12;
const LOGO_MARGIN_END = 10;

// Typography
const LABEL_FONT_SIZE = 14;
const LABEL_LINE_HEIGHT = 20;
const LABEL_FONT_WEIGHT = '500';

// Effects
const DISABLED_OPACITY = 0.38;
const BORDER_WIDTH_THEMED = 1;
const BORDER_WIDTH_NEUTRAL = 0;

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
    borderWidth: BORDER_WIDTH_THEMED,
    textColor: '#1F1F1F',
  },
  dark: {
    backgroundColor: '#131314',
    borderColor: '#8E918F',
    borderWidth: BORDER_WIDTH_THEMED,
    textColor: '#E3E3E3',
  },
  neutral: {
    backgroundColor: '#F2F2F2',
    borderColor: 'transparent',
    borderWidth: BORDER_WIDTH_NEUTRAL,
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
  const borderRadius =
    shape === 'rounded' ? BORDER_RADIUS_ROUNDED : BORDER_RADIUS_SQUARE;
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
        <GoogleLogo size={GOOGLE_LOGO_SIZE} />
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
    height: BUTTON_HEIGHT,
    alignSelf: 'flex-start',
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    justifyContent: 'center',
  },
  logoContainer: {
    marginStart: LOGO_MARGIN_START,
    marginEnd: LOGO_MARGIN_END,
  },
  iconLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontFamily: 'Roboto-Medium',
    fontSize: LABEL_FONT_SIZE,
    lineHeight: LABEL_LINE_HEIGHT,
    fontWeight: LABEL_FONT_WEIGHT,
    marginEnd: LOGO_MARGIN_END,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
});
