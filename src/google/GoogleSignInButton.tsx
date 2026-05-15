import {
  Pressable,
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GoogleLogo } from './GoogleLogo';

export type GoogleSignInButtonTheme = 'light' | 'dark' | 'neutral';

export type GoogleSignInButtonShape = 'rounded' | 'square';

export type GoogleSignInButtonText = 'signin' | 'signup' | 'continue';

export type GoogleSignInButtonSize = 'standard' | 'icon';

export interface GoogleSignInButtonProps {
  theme?: GoogleSignInButtonTheme;
  shape?: GoogleSignInButtonShape;
  text?: GoogleSignInButtonText;
  size?: GoogleSignInButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
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
