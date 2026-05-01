import {
  Pressable,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type GoogleSignInButtonTheme = 'light' | 'dark' | 'neutral';

export type GoogleSignInButtonSize = 'icon' | 'standard' | 'wide';

export interface GoogleSignInButtonProps {
  theme?: GoogleSignInButtonTheme;
  size?: GoogleSignInButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function GoogleSignInButton({
  theme = 'light',
  size = 'standard',
  onPress,
  disabled = false,
  style,
  testID,
}: GoogleSignInButtonProps) {
  return (
    <Pressable
      style={[
        styles.base,
        theme === 'dark' && styles.dark,
        theme === 'neutral' && styles.neutral,
        size === 'wide' && styles.wide,
        size === 'icon' && styles.iconOnly,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
      testID={testID}
    >
      {size !== 'icon' && (
        <Text style={[styles.text, theme === 'dark' && styles.textDark]}>
          Sign in with Google
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    minHeight: 40,
  },
  dark: {
    backgroundColor: '#131314',
    borderColor: '#8e918f',
  },
  neutral: {
    backgroundColor: '#f2f2f2',
    borderColor: '#f2f2f2',
  },
  wide: {
    paddingHorizontal: 24,
    minWidth: 280,
  },
  iconOnly: {
    paddingHorizontal: 10,
    minWidth: 40,
  },
  disabled: {
    opacity: 0.38,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f1f1f',
    letterSpacing: 0.25,
  },
  textDark: {
    color: '#e3e3e3',
  },
});
