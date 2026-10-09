/**
 * Configuration accepted by {@link AppleSignIn.configure}.
 *
 * @remarks
 * Sign in with Apple is an **iOS-only** flow in this library (it uses the
 * native `ASAuthorizationController`). On Android every method except
 * {@link AppleSignIn.isAvailable} throws `NOT_SUPPORTED`.
 */
export interface AppleSignInConfig {
  /**
   * The data the app requests from the user on first authorization.
   *
   * @remarks
   * Apple returns `email` and `fullName` **only the first time** a user
   * authorizes your app — persist them on your backend at that point, because
   * subsequent sign-ins omit them even if you keep requesting them.
   *
   * @defaultValue `['email', 'fullName']`
   */
  requestedScopes?: AppleSignInScope[];

  /**
   * A unique value bound into the returned identity token. Recommended when
   * verifying the token server-side to prevent replay attacks. Hash this value
   * the same way on your backend before comparing.
   */
  nonce?: string;

  /**
   * An opaque value round-tripped through the authorization so your app can
   * correlate the response with the request. Returned verbatim on
   * {@link AppleAuthCredential.state}.
   */
  state?: string;
}

/** A scope passed in {@link AppleSignInConfig.requestedScopes}. */
export type AppleSignInScope = 'email' | 'fullName';

/**
 * The user's name, returned by {@link AppleSignIn.signIn}.
 *
 * @remarks
 * Populated **only on the first authorization**; `null` fields on subsequent
 * sign-ins.
 */
export interface AppleFullName {
  /** The user's given (first) name, if provided. */
  givenName: string | null;
  /** The user's family (last) name, if provided. */
  familyName: string | null;
  /** The user's nickname, if provided. */
  nickname: string | null;
}

/**
 * Apple's assessment of whether the account belongs to a real person.
 *
 * - `likelyReal` — Apple has high confidence the user is a real person.
 * - `unknown` — Apple could not determine (e.g. in the Simulator).
 * - `unsupported` — the check is unavailable on this device/region.
 */
export type AppleRealUserStatus = 'likelyReal' | 'unknown' | 'unsupported';

/**
 * The authenticated Apple account, returned on {@link AppleAuthCredential.user}.
 */
export interface AppleUser {
  /**
   * The stable user identifier, scoped to your Apple Developer team. Use this
   * as the primary key for the account and to query
   * {@link AppleSignIn.getCredentialState}.
   */
  id: string;
  /**
   * The user's email (or an Apple private-relay address). Non-null **only on
   * first authorization** — persist it server-side then.
   */
  email: string | null;
  /**
   * The user's name. Non-null **only on first authorization** — persist it
   * server-side then.
   */
  fullName: AppleFullName | null;
  /** {@inheritDoc AppleRealUserStatus} */
  realUserStatus: AppleRealUserStatus;
}

/**
 * The result of a successful {@link AppleSignIn.signIn} call.
 *
 * @remarks
 * Send `identityToken` to your backend and verify it against Apple's public
 * keys (`https://appleid.apple.com/auth/keys`). Exchange `authorizationCode`
 * server-side for refresh/access tokens if you need long-lived access.
 */
export interface AppleAuthCredential {
  /** Apple-issued identity token (JWT). Verify on your backend. */
  identityToken: string | null;
  /** One-time authorization code your backend exchanges for tokens. */
  authorizationCode: string | null;
  /** The {@link AppleSignInConfig.state} value echoed back, if one was set. */
  state: string | null;
  /** The authenticated user. */
  user: AppleUser;
}

/**
 * The authorization status of a previously obtained {@link AppleUser.id},
 * returned by {@link AppleSignIn.getCredentialState}.
 *
 * - `authorized` — the credential is still valid.
 * - `revoked` — the user revoked access; sign them out locally.
 * - `notFound` — no credential for this user (e.g. never signed in).
 * - `transferred` — the credential was migrated between Apple Developer teams.
 */
export type AppleCredentialState =
  | 'authorized'
  | 'revoked'
  | 'notFound'
  | 'transferred';
