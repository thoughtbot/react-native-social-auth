import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppleSignInErrorCode } from '../errors';
import type { AppleSignInConfig } from '../types';

type Wrapper = typeof import('../AppleSignIn').AppleSignIn;
type NativeSpec = NonNullable<typeof import('../NativeAppleSignIn').default>;
type NativeMock = {
  [K in keyof NativeSpec]: jest.Mock;
};

function makeNativeMock(): NativeMock {
  return {
    configure: jest.fn(),
    signIn: jest.fn(),
    getCredentialState: jest.fn(),
    isAvailable: jest.fn(() => true),
  };
}

/** Load a fresh copy of the wrapper with `NativeAppleSignIn` mocked. Pass
 * `null` to simulate an unsupported platform (Android). */
function loadFreshModule(native: NativeMock | null): {
  AppleSignIn: Wrapper;
  native: NativeMock | null;
} {
  let AppleSignIn!: Wrapper;

  jest.isolateModules(() => {
    jest.doMock('../NativeAppleSignIn', () => ({
      __esModule: true,
      default: native,
    }));
    AppleSignIn = require('../AppleSignIn').AppleSignIn;
  });

  return { AppleSignIn, native };
}

const config: AppleSignInConfig = {
  requestedScopes: ['email', 'fullName'],
};

describe('AppleSignIn — unsupported platform (no native module)', () => {
  let AppleSignIn: Wrapper;

  beforeEach(() => {
    ({ AppleSignIn } = loadFreshModule(null));
  });

  it('configure() throws NOT_SUPPORTED', () => {
    expect(() => AppleSignIn.configure(config)).toThrow(
      expect.objectContaining({
        code: AppleSignInErrorCode.NOT_SUPPORTED,
        name: 'AppleSignInError',
      })
    );
  });

  it('signIn() rejects with NOT_SUPPORTED', async () => {
    await expect(AppleSignIn.signIn()).rejects.toMatchObject({
      code: AppleSignInErrorCode.NOT_SUPPORTED,
    });
  });

  it('getCredentialState() rejects with NOT_SUPPORTED', async () => {
    await expect(
      AppleSignIn.getCredentialState('user-id')
    ).rejects.toMatchObject({ code: AppleSignInErrorCode.NOT_SUPPORTED });
  });

  it('isAvailable() returns false', () => {
    expect(AppleSignIn.isAvailable()).toBe(false);
  });
});

describe('AppleSignIn — before configure()', () => {
  let AppleSignIn: Wrapper;

  beforeEach(() => {
    ({ AppleSignIn } = loadFreshModule(makeNativeMock()));
  });

  it('signIn() rejects with NOT_CONFIGURED', async () => {
    await expect(AppleSignIn.signIn()).rejects.toMatchObject({
      code: AppleSignInErrorCode.NOT_CONFIGURED,
    });
  });

  it('getCredentialState() does not require configure()', async () => {
    const { AppleSignIn: fresh, native } = loadFreshModule(makeNativeMock());
    native!.getCredentialState.mockResolvedValueOnce('authorized' as never);

    await expect(fresh.getCredentialState('user-id')).resolves.toBe(
      'authorized'
    );
    expect(native!.getCredentialState).toHaveBeenCalledWith('user-id');
  });

  it('isAvailable() reflects the native result', () => {
    const { AppleSignIn: fresh, native } = loadFreshModule(makeNativeMock());
    native!.isAvailable.mockReturnValueOnce(true);
    expect(fresh.isAvailable()).toBe(true);
  });
});

describe('AppleSignIn — after configure()', () => {
  let AppleSignIn: Wrapper;
  let native: NativeMock;

  beforeEach(() => {
    const loaded = loadFreshModule(makeNativeMock());
    AppleSignIn = loaded.AppleSignIn;
    native = loaded.native!;
    AppleSignIn.configure(config);
  });

  it('configure() forwards the config to the native module', () => {
    expect(native.configure).toHaveBeenCalledWith(config);
    expect(native.configure).toHaveBeenCalledTimes(1);
  });

  it('signIn() resolves with the native return value', async () => {
    const credential = {
      identityToken: 'jwt',
      authorizationCode: 'code',
      state: null,
      user: {
        id: '000123.abc.0001',
        email: 'user@example.com',
        fullName: { givenName: 'A', familyName: 'User', nickname: null },
        realUserStatus: 'likelyReal',
      },
    };
    native.signIn.mockResolvedValueOnce(credential as never);

    await expect(AppleSignIn.signIn()).resolves.toEqual(credential);
    expect(native.signIn).toHaveBeenCalledTimes(1);
  });

  it('signIn() propagates native rejections unchanged', async () => {
    const nativeError = new Error('SIGN_IN_CANCELLED');
    native.signIn.mockRejectedValueOnce(nativeError as never);

    await expect(AppleSignIn.signIn()).rejects.toBe(nativeError);
  });

  it('getCredentialState() resolves with the native state', async () => {
    native.getCredentialState.mockResolvedValueOnce('revoked' as never);

    await expect(AppleSignIn.getCredentialState('user-id')).resolves.toBe(
      'revoked'
    );
  });
});
