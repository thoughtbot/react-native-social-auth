import { describe, expect, it } from '@jest/globals';
import {
  AppleSignInError,
  AppleSignInErrorCode,
  isAppleSignInError,
} from '../errors';

describe('AppleSignInError', () => {
  it('is an instance of Error', () => {
    const error = new AppleSignInError(
      AppleSignInErrorCode.SIGN_IN_FAILED,
      'something went wrong'
    );
    expect(error).toBeInstanceOf(Error);
  });

  it('has the correct name', () => {
    const error = new AppleSignInError(
      AppleSignInErrorCode.SIGN_IN_FAILED,
      'something went wrong'
    );
    expect(error.name).toBe('AppleSignInError');
  });

  it('stores the code and message', () => {
    const error = new AppleSignInError(
      AppleSignInErrorCode.NOT_SUPPORTED,
      'not available on android'
    );
    expect(error.code).toBe(AppleSignInErrorCode.NOT_SUPPORTED);
    expect(error.message).toBe('not available on android');
  });

  it('stores an optional nativeErrorCode', () => {
    const error = new AppleSignInError(
      AppleSignInErrorCode.SIGN_IN_FAILED,
      'native failure',
      '1004'
    );
    expect(error.nativeErrorCode).toBe('1004');
  });

  it('leaves nativeErrorCode undefined when not provided', () => {
    const error = new AppleSignInError(
      AppleSignInErrorCode.SIGN_IN_CANCELLED,
      'user cancelled'
    );
    expect(error.nativeErrorCode).toBeUndefined();
  });
});

describe('isAppleSignInError', () => {
  it('returns true for a real AppleSignInError instance', () => {
    const error = new AppleSignInError(
      AppleSignInErrorCode.INVALID_RESPONSE,
      'bad response'
    );
    expect(isAppleSignInError(error)).toBe(true);
  });

  it('returns false for a plain Error', () => {
    expect(isAppleSignInError(new Error('plain error'))).toBe(false);
  });

  it('returns false for a plain object with the same shape', () => {
    const fake = {
      name: 'AppleSignInError',
      code: AppleSignInErrorCode.SIGN_IN_FAILED,
      message: 'fake',
    };
    expect(isAppleSignInError(fake)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAppleSignInError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAppleSignInError(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isAppleSignInError('something went wrong')).toBe(false);
  });
});
