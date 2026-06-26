import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { GoogleSignInErrorCode } from '../errors';
import type { GoogleSignInConfig } from '../types';

type Wrapper = typeof import('../GoogleSignIn').GoogleSignIn;
type NativeSpec = typeof import('../NativeGoogleSignIn').default;
type NativeMock = {
  [K in keyof NativeSpec]: jest.Mock;
};

function loadFreshModule(): { GoogleSignIn: Wrapper; native: NativeMock } {
  let GoogleSignIn!: Wrapper;
  let native!: NativeMock;

  jest.isolateModules(() => {
    const nativeMock: NativeMock = {
      configure: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentUser: jest.fn(),
      revokeAccess: jest.fn(),
      isSignedIn: jest.fn(),
    };
    jest.doMock('../NativeGoogleSignIn', () => ({
      __esModule: true,
      default: nativeMock,
    }));
    GoogleSignIn = require('../GoogleSignIn').GoogleSignIn;
    native = nativeMock;
  });

  return { GoogleSignIn, native };
}

const config: GoogleSignInConfig = {
  webClientId: 'web-client-id.apps.googleusercontent.com',
};

describe('GoogleSignIn — before configure()', () => {
  let GoogleSignIn: Wrapper;

  beforeEach(() => {
    ({ GoogleSignIn } = loadFreshModule());
  });

  it('signIn() rejects with NOT_CONFIGURED', async () => {
    await expect(GoogleSignIn.signIn()).rejects.toMatchObject({
      code: GoogleSignInErrorCode.NOT_CONFIGURED,
    });
  });

  it('signOut() rejects with NOT_CONFIGURED', async () => {
    await expect(GoogleSignIn.signOut()).rejects.toMatchObject({
      code: GoogleSignInErrorCode.NOT_CONFIGURED,
    });
  });

  it('getCurrentUser() rejects with NOT_CONFIGURED', async () => {
    await expect(GoogleSignIn.getCurrentUser()).rejects.toMatchObject({
      code: GoogleSignInErrorCode.NOT_CONFIGURED,
    });
  });

  it('revokeAccess() rejects with NOT_CONFIGURED', async () => {
    await expect(GoogleSignIn.revokeAccess()).rejects.toMatchObject({
      code: GoogleSignInErrorCode.NOT_CONFIGURED,
    });
  });

  it('isSignedIn() throws NOT_CONFIGURED', () => {
    expect(() => GoogleSignIn.isSignedIn()).toThrow(
      expect.objectContaining({
        code: GoogleSignInErrorCode.NOT_CONFIGURED,
        name: 'GoogleSignInError',
      })
    );
  });
});

describe('GoogleSignIn — after configure()', () => {
  let GoogleSignIn: Wrapper;
  let native: NativeMock;

  beforeEach(() => {
    ({ GoogleSignIn, native } = loadFreshModule());
    GoogleSignIn.configure(config);
  });

  it('configure() forwards the config to the native module', () => {
    expect(native.configure).toHaveBeenCalledWith(config);
    expect(native.configure).toHaveBeenCalledTimes(1);
  });

  it('signIn() resolves with the native return value', async () => {
    const credential = {
      idToken: 'token',
      accessToken: null,
      serverAuthCode: null,
      user: {
        id: '123',
        email: 'user@example.com',
        displayName: 'A User',
        givenName: 'A',
        familyName: 'User',
        photoUrl: null,
      },
    };
    native.signIn.mockResolvedValueOnce(credential as never);

    await expect(GoogleSignIn.signIn()).resolves.toEqual(credential);
    expect(native.signIn).toHaveBeenCalledTimes(1);
  });

  it('signIn() propagates native rejections unchanged', async () => {
    const nativeError = new Error('SIGN_IN_CANCELLED');
    native.signIn.mockRejectedValueOnce(nativeError as never);

    await expect(GoogleSignIn.signIn()).rejects.toBe(nativeError);
  });

  it('signOut() resolves and calls the native module once', async () => {
    native.signOut.mockResolvedValueOnce(undefined as never);

    await expect(GoogleSignIn.signOut()).resolves.toBeUndefined();
    expect(native.signOut).toHaveBeenCalledTimes(1);
  });

  it('getCurrentUser() resolves with the native user', async () => {
    const user = {
      id: '123',
      email: 'user@example.com',
      displayName: null,
      givenName: null,
      familyName: null,
      photoUrl: null,
    };
    native.getCurrentUser.mockResolvedValueOnce(user as never);

    await expect(GoogleSignIn.getCurrentUser()).resolves.toEqual(user);
  });

  it('getCurrentUser() resolves with null when nobody is signed in', async () => {
    native.getCurrentUser.mockResolvedValueOnce(null as never);

    await expect(GoogleSignIn.getCurrentUser()).resolves.toBeNull();
  });

  it('revokeAccess() resolves and calls the native module once', async () => {
    native.revokeAccess.mockResolvedValueOnce(undefined as never);

    await expect(GoogleSignIn.revokeAccess()).resolves.toBeUndefined();
    expect(native.revokeAccess).toHaveBeenCalledTimes(1);
  });

  it('isSignedIn() returns the native boolean', () => {
    native.isSignedIn.mockReturnValueOnce(true);
    expect(GoogleSignIn.isSignedIn()).toBe(true);

    native.isSignedIn.mockReturnValueOnce(false);
    expect(GoogleSignIn.isSignedIn()).toBe(false);
  });
});
