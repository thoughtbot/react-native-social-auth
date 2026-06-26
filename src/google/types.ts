/**
 * Configuration accepted by {@link GoogleSignIn.configure}.
 *
 * @remarks
 * `webClientId` is required on every platform — it sets the audience (`aud`)
 * of the issued ID token so a single backend verification path works across
 * iOS, Android, and web.
 */
export interface GoogleSignInConfig {
  /**
   * The OAuth 2.0 **Web application** client ID from Google Cloud Console.
   * Used as the `serverClientID` on iOS and the `serverClientId` on Android,
   * which becomes the `aud` claim of the issued ID token.
   */
  webClientId: string;

  /**
   * The OAuth 2.0 **iOS application** client ID. Required when running on iOS;
   * ignored on Android.
   */
  iosClientId?: string;

  /**
   * When `true`, request a server auth code in addition to the ID token so a
   * backend can exchange it for refresh tokens. Not yet exposed end-to-end.
   *
   * @defaultValue false
   */
  offlineAccess?: boolean;

  /**
   * Additional OAuth scopes to request beyond the default `openid email profile`.
   */
  scopes?: string[];

  /**
   * Restrict sign-in to accounts on a specific Google Workspace domain (e.g.
   * `"example.com"`).
   */
  hostedDomain?: string;

  /**
   * When `true`, returning users sign in silently with the most recently used
   * account without showing the bottom sheet.
   *
   * @defaultValue false
   */
  autoSelect?: boolean;

  /**
   * A unique value bound into the ID token. Recommended when verifying tokens
   * server-side to prevent replay attacks.
   *
   * @remarks
   * Honored on Android. On iOS the GoogleSignIn 7.x public API does not expose
   * a nonce parameter; nonce verification must be enforced server-side instead.
   */
  nonce?: string;
}

/**
 * The authenticated Google account's profile, returned by
 * {@link GoogleSignIn.signIn} and {@link GoogleSignIn.getCurrentUser}.
 */
export interface GoogleUser {
  /** The user's stable Google account ID (`sub` claim in the ID token). */
  id: string;
  /** The user's primary email address. */
  email: string;
  /** The user's full display name, if provided. */
  displayName: string | null;
  /** The user's given (first) name, if provided. */
  givenName: string | null;
  /** The user's family (last) name, if provided. */
  familyName: string | null;
  /** A URL to the user's profile photo (200×200), if provided. */
  photoUrl: string | null;
}

/**
 * The result of a successful {@link GoogleSignIn.signIn} call.
 *
 * @remarks
 * Pass `idToken` to your backend and verify it with Google's public keys. The
 * `aud` claim will equal the {@link GoogleSignInConfig.webClientId} you passed
 * to {@link GoogleSignIn.configure}.
 */
export interface GoogleAuthCredential {
  /** The Google-issued ID token. JWT format; verify on your backend. */
  idToken: string;
  /** OAuth access token for calling Google APIs; `null` when not requested. */
  accessToken: string | null;
  /**
   * One-time code your backend can exchange for refresh tokens. `null` unless
   * {@link GoogleSignInConfig.offlineAccess} was set.
   */
  serverAuthCode: string | null;
  /** The authenticated user's profile. */
  user: GoogleUser;
}
