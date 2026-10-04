import type {
  AppleAuthCredential,
  AppleCredentialState,
  AppleSignInConfig,
} from './types';
import { AppleSignInError, AppleSignInErrorCode } from './errors';
import NativeAppleSignIn from './NativeAppleSignIn';

let _configured = false;

/**
 * Throw unless a native Apple Sign-In module is available (iOS). Guards against
 * calling into a module that doesn't exist on Android.
 */
function ensureSupported(): NonNullable<typeof NativeAppleSignIn> {
  if (NativeAppleSignIn == null) {
    throw new AppleSignInError(
      AppleSignInErrorCode.NOT_SUPPORTED,
      'Sign in with Apple is only available on iOS 13+.'
    );
  }
  return NativeAppleSignIn;
}

function ensureConfigured(): void {
  if (!_configured) {
    throw new AppleSignInError(
      AppleSignInErrorCode.NOT_CONFIGURED,
      'AppleSignIn.configure() must be called before using other methods.'
    );
  }
}

/**
 * Initialize Sign in with Apple. Call once at app startup (or before any other
 * method) — subsequent calls overwrite the prior config.
 *
 * @param config - See {@link AppleSignInConfig}.
 *
 * @throws An {@link AppleSignInError} with code `NOT_SUPPORTED` on Android or
 * iOS older than 13. Gate the call with {@link isAvailable} in cross-platform
 * code.
 *
 * @example
 * ```ts
 * if (AppleSignIn.isAvailable()) {
 *   AppleSignIn.configure({ requestedScopes: ['email', 'fullName'] });
 * }
 * ```
 */
function configure(config: AppleSignInConfig): void {
  ensureSupported().configure(config);
  _configured = true;
}

/**
 * Trigger the Sign in with Apple flow, presenting the native system sheet.
 *
 * @returns An {@link AppleAuthCredential}. Note `user.email` and
 * `user.fullName` are populated **only on the first authorization**.
 *
 * @throws An {@link AppleSignInError} — most commonly `SIGN_IN_CANCELLED` when
 * the user dismisses the sheet, `NOT_CONFIGURED` when called before
 * {@link configure}, or `NOT_SUPPORTED` on unsupported platforms.
 */
async function signIn(): Promise<AppleAuthCredential> {
  const native = ensureSupported();
  ensureConfigured();
  const result = await native.signIn();
  return result as unknown as AppleAuthCredential;
}

/**
 * Query the current authorization state of a previously obtained
 * {@link AppleUser.id}. Does not require {@link configure}; useful at app
 * launch to detect a revoked credential.
 *
 * @param userId - The stable {@link AppleUser.id} from a prior {@link signIn}.
 * @returns The {@link AppleCredentialState}.
 *
 * @throws An {@link AppleSignInError} with code `NOT_SUPPORTED` on unsupported
 * platforms.
 */
async function getCredentialState(
  userId: string
): Promise<AppleCredentialState> {
  const native = ensureSupported();
  const state = await native.getCredentialState(userId);
  return state as AppleCredentialState;
}

/**
 * Whether Sign in with Apple is available on this device. `true` on iOS 13+,
 * `false` on older iOS and on Android. Safe to call before {@link configure}.
 */
function isAvailable(): boolean {
  return NativeAppleSignIn != null && NativeAppleSignIn.isAvailable();
}

/**
 * The Sign in with Apple runtime API. Check {@link AppleSignIn.isAvailable}
 * first in cross-platform apps, then call {@link AppleSignIn.configure} once at
 * startup and drive the flow with {@link AppleSignIn.signIn}.
 *
 * @remarks
 * There is deliberately no `signOut` or `revokeAccess`: Apple has no
 * client-side sign-out, and revocation is a server-side token call. Use
 * {@link AppleSignIn.getCredentialState} to detect revocation.
 */
export const AppleSignIn = {
  configure,
  signIn,
  getCredentialState,
  isAvailable,
} as const;
