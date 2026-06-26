import { describe, expect, it } from '@jest/globals';
import {
  GoogleSignInError,
  GoogleSignInErrorCode,
  isGoogleSignInError,
} from '../errors';

describe('GoogleSignInError', () => {
  it('is an instance of Error', () => {
    const error = new GoogleSignInError(
      GoogleSignInErrorCode.SIGN_IN_FAILED,
      'something went wrong'
    );
    expect(error).toBeInstanceOf(Error);
  });

  it('has the correct name', () => {
    const error = new GoogleSignInError(
      GoogleSignInErrorCode.SIGN_IN_FAILED,
      'something went wrong'
    );
    expect(error.name).toBe('GoogleSignInError');
  });

  it('stores the code and message', () => {
    const error = new GoogleSignInError(
      GoogleSignInErrorCode.NO_CREDENTIALS,
      'no credentials available'
    );
    expect(error.code).toBe(GoogleSignInErrorCode.NO_CREDENTIALS);
    expect(error.message).toBe('no credentials available');
  });

  it('stores an optional nativeErrorCode', () => {
    const error = new GoogleSignInError(
      GoogleSignInErrorCode.SIGN_IN_FAILED,
      'native failure',
      '28444'
    );
    expect(error.nativeErrorCode).toBe('28444');
  });

  it('leaves nativeErrorCode undefined when not provided', () => {
    const error = new GoogleSignInError(
      GoogleSignInErrorCode.SIGN_IN_CANCELLED,
      'user cancelled'
    );
    expect(error.nativeErrorCode).toBeUndefined();
  });
});

describe('isGoogleSignInError', () => {
  it('returns true for a real GoogleSignInError instance', () => {
    const error = new GoogleSignInError(
      GoogleSignInErrorCode.NETWORK_ERROR,
      'offline'
    );
    expect(isGoogleSignInError(error)).toBe(true);
  });

  it('returns false for a plain Error', () => {
    expect(isGoogleSignInError(new Error('plain error'))).toBe(false);
  });

  it('returns false for a plain object with the same shape', () => {
    const fake = {
      name: 'GoogleSignInError',
      code: GoogleSignInErrorCode.SIGN_IN_FAILED,
      message: 'fake',
    };
    expect(isGoogleSignInError(fake)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isGoogleSignInError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isGoogleSignInError(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isGoogleSignInError('something went wrong')).toBe(false);
  });
});
