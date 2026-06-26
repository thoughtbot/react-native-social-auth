import { describe, expect, it, jest } from '@jest/globals';
import { StyleSheet, type ViewStyle } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { GoogleSignInButton } from '../GoogleSignInButton';

function flattenStyle(style: unknown): ViewStyle {
  return (StyleSheet.flatten(style as ViewStyle) ?? {}) as ViewStyle;
}

describe('GoogleSignInButton', () => {
  it('renders with default props and accessibility label', async () => {
    const { getByRole } = render(<GoogleSignInButton />);
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Sign in with Google');
  });

  describe('accessibility label per text variant', () => {
    it.each([
      ['signin' as const, 'Sign in with Google'],
      ['signup' as const, 'Sign up with Google'],
      ['continue' as const, 'Continue with Google'],
    ])('text="%s" → %s', async (text, expected) => {
      const { getByRole } = render(<GoogleSignInButton text={text} />);
      expect(getByRole('button').props.accessibilityLabel).toBe(expected);
    });
  });

  it('renders the visible text label by default', async () => {
    const { queryByText } = render(<GoogleSignInButton text="signup" />);
    expect(queryByText('Sign up with Google')).not.toBeNull();
  });

  it('hides the visible text label when size="icon" but keeps the a11y label', async () => {
    const { queryByText, getByRole } = render(
      <GoogleSignInButton size="icon" text="signin" />
    );
    expect(queryByText('Sign in with Google')).toBeNull();
    expect(getByRole('button').props.accessibilityLabel).toBe(
      'Sign in with Google'
    );
  });

  it('invokes onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByRole } = render(<GoogleSignInButton onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <GoogleSignInButton onPress={onPress} disabled />
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('marks the rendered Pressable disabled when disabled is true', async () => {
    const { getByRole } = render(<GoogleSignInButton disabled />);
    expect(getByRole('button').props.accessibilityState?.disabled).toBe(true);
  });

  it('propagates testID', async () => {
    const { getByTestId } = render(
      <GoogleSignInButton testID="my-google-button" />
    );
    expect(getByTestId('my-google-button')).toBeTruthy();
  });

  describe('theme', () => {
    it.each([
      ['light' as const, '#FFFFFF'],
      ['dark' as const, '#131314'],
      ['neutral' as const, '#F2F2F2'],
    ])('theme="%s" applies background color %s', async (theme, expectedBg) => {
      const { getByRole } = render(<GoogleSignInButton theme={theme} />);
      const flat = flattenStyle(getByRole('button').props.style);
      expect(flat.backgroundColor).toBe(expectedBg);
    });
  });
});
