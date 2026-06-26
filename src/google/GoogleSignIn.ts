import type {
  GoogleAuthCredential,
  GoogleSignInConfig,
  GoogleUser,
} from './types';
import { GoogleSignInError, GoogleSignInErrorCode } from './errors';
import NativeGoogleSignIn from './NativeGoogleSignIn';

let _configured = false;

function ensureConfigured(): void {
  if (!_configured) {
    throw new GoogleSignInError(
      GoogleSignInErrorCode.NOT_CONFIGURED,
      'GoogleSignIn.configure() must be called before using other methods.'
    );
  }
}

/**
 * Initialize the native Google Sign-In SDK. Must be called once at app startup
 * (or before any other method) — subsequent calls overwrite the prior config.
 *
 * @param config - See {@link GoogleSignInConfig}.
 *
 * @example
 * ```ts
 * GoogleSignIn.configure({
 *   webClientId: 'WEB_CLIENT_ID.apps.googleusercontent.com',
 *   iosClientId: 'IOS_CLIENT_ID.apps.googleusercontent.com',
 * });
 * ```
 */
function configure(config: GoogleSignInConfig): void {
  NativeGoogleSignIn.configure(config);
  _configured = true;
}

/**
 * Trigger the Google sign-in flow.
 *
 * @remarks
 * On both platforms, the SDK attempts silent restore of a previously authorized
 * account first, then falls back to the interactive bottom sheet / system sheet
 * if no authorized account is found.
 *
 * @returns A {@link GoogleAuthCredential} containing the ID token, optional
 * access token, and user profile.
 *
 * @throws A {@link GoogleSignInError} with one of the
 * {@link GoogleSignInErrorCode} values — most commonly `SIGN_IN_CANCELLED`
 * when the user dismisses the sheet, or `NOT_CONFIGURED` when called before
 * {@link configure}.
 */
async function signIn(): Promise<GoogleAuthCredential> {
  ensureConfigured();
  const result = await NativeGoogleSignIn.signIn();
  return result as unknown as GoogleAuthCredential;
}

/**
 * Clear the local credential state so the next {@link signIn} call requires
 * fresh user interaction. The user remains signed into Google itself.
 *
 * @throws A {@link GoogleSignInError} with code `NOT_CONFIGURED` when called
 * before {@link configure}.
 */
async function signOut(): Promise<void> {
  ensureConfigured();
  await NativeGoogleSignIn.signOut();
}

/**
 * Return the in-memory authenticated user, or `null` if nobody has signed in
 * since app launch.
 *
 * @returns The current {@link GoogleUser}, or `null`.
 *
 * @throws A {@link GoogleSignInError} with code `NOT_CONFIGURED` when called
 * before {@link configure}.
 */
async function getCurrentUser(): Promise<GoogleUser | null> {
  ensureConfigured();
  const result = await NativeGoogleSignIn.getCurrentUser();
  return result as unknown as GoogleUser | null;
}

/**
 * Revoke the app's access to the user's Google account. The user will see a
 * fresh consent screen on the next {@link signIn}.
 *
 * @throws A {@link GoogleSignInError} with code `NOT_CONFIGURED` when called
 * before {@link configure}.
 */
async function revokeAccess(): Promise<void> {
  ensureConfigured();
  await NativeGoogleSignIn.revokeAccess();
}

/**
 * Synchronous check for whether a user is currently signed in (in memory).
 *
 * @returns `true` when {@link getCurrentUser} would resolve to a non-null user.
 *
 * @throws A {@link GoogleSignInError} with code `NOT_CONFIGURED` when called
 * before {@link configure}.
 */
function isSignedIn(): boolean {
  ensureConfigured();
  return NativeGoogleSignIn.isSignedIn();
}

/**
 * The Google Sign-In runtime API. Call {@link GoogleSignIn.configure} once at
 * app startup, then drive the flow with the other methods.
 *
 * @example
 * ```ts
 * GoogleSignIn.configure({ webClientId: '...' });
 * const credential = await GoogleSignIn.signIn();
 * console.log(credential.user.email);
 * ```
 */
export const GoogleSignIn = {
  configure,
  signIn,
  signOut,
  getCurrentUser,
  revokeAccess,
  isSignedIn,
} as const;
