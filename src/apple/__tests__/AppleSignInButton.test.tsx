import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import { AppleSignInButton } from '../AppleSignInButton';

// Render the native component as a plain View so we can inspect the props the
// wrapper maps onto it without a real Fabric host component.
jest.mock('../AppleSignInButtonNativeComponent', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, props),
  };
});

const TEST_ID = 'apple-button';

afterEach(() => {
  (Platform as { OS: string }).OS = 'ios';
});

describe('AppleSignInButton', () => {
  it('renders with mapped default props on iOS', () => {
    const { getByTestId } = render(<AppleSignInButton testID={TEST_ID} />);
    const node = getByTestId(TEST_ID);
    expect(node.props.buttonType).toBe(0); // signIn
    expect(node.props.buttonStyle).toBe(2); // black
    expect(node.props.cornerRadius).toBe(-1); // Apple default
  });

  describe('type mapping', () => {
    it.each([
      ['signIn' as const, 0],
      ['continue' as const, 1],
      ['signUp' as const, 2],
    ])('type="%s" → buttonType %d', (type, expected) => {
      const { getByTestId } = render(
        <AppleSignInButton type={type} testID={TEST_ID} />
      );
      expect(getByTestId(TEST_ID).props.buttonType).toBe(expected);
    });
  });

  describe('style mapping', () => {
    it.each([
      ['white' as const, 0],
      ['whiteOutline' as const, 1],
      ['black' as const, 2],
    ])('buttonStyle="%s" → %d', (buttonStyle, expected) => {
      const { getByTestId } = render(
        <AppleSignInButton buttonStyle={buttonStyle} testID={TEST_ID} />
      );
      expect(getByTestId(TEST_ID).props.buttonStyle).toBe(expected);
    });
  });

  it('passes an explicit cornerRadius through', () => {
    const { getByTestId } = render(
      <AppleSignInButton cornerRadius={12} testID={TEST_ID} />
    );
    expect(getByTestId(TEST_ID).props.cornerRadius).toBe(12);
  });

  it('wires onPress to the native onButtonPress event', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AppleSignInButton onPress={onPress} testID={TEST_ID} />
    );
    getByTestId(TEST_ID).props.onButtonPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders null on Android', () => {
    (Platform as { OS: string }).OS = 'android';
    const { queryByTestId } = render(<AppleSignInButton testID={TEST_ID} />);
    expect(queryByTestId(TEST_ID)).toBeNull();
  });
});
