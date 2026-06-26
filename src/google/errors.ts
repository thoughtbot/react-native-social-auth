/**
 * Discriminator for {@link GoogleSignInError.code}. Identical on Android and
 * iOS so error-handling code is platform-agnostic.
 */
export enum GoogleSignInErrorCode {
  /** The user dismissed the sign-in sheet. Don't surface an error. */
  SIGN_IN_CANCELLED = 'SIGN_IN_CANCELLED',
  /** A generic native failure; inspect `message` and `nativeErrorCode` for details. */
  SIGN_IN_FAILED = 'SIGN_IN_FAILED',
  /** No Google accounts are available on the device. */
  NO_CREDENTIALS = 'NO_CREDENTIALS',
  /** Google Play Services is missing or out of date (Android only). */
  PLAY_SERVICES_NOT_AVAILABLE = 'PLAY_SERVICES_NOT_AVAILABLE',
  /** The device could not reach Google's auth servers. */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** A method was called before {@link GoogleSignIn.configure}. */
  NOT_CONFIGURED = 'NOT_CONFIGURED',
}

/**
 * Typed error thrown / rejected by every {@link GoogleSignIn} method.
 *
 * @example
 * ```ts
 * try {
 *   await GoogleSignIn.signIn();
 * } catch (error) {
 *   if (isGoogleSignInError(error) && error.code === GoogleSignInErrorCode.SIGN_IN_CANCELLED) {
 *     return;
 *   }
 *   throw error;
 * }
 * ```
 */
export class GoogleSignInError extends Error {
  /** The platform-agnostic error code. */
  readonly code: GoogleSignInErrorCode;
  /**
   * The underlying native error code (e.g. Android `28444`, iOS
   * `kGIDSignInErrorCode...`). Useful for telemetry; do not branch on it from
   * application code — branch on {@link code} instead.
   */
  readonly nativeErrorCode: string | undefined;

  /**
   * @param code - A {@link GoogleSignInErrorCode} value.
   * @param message - Human-readable description, suitable for logs.
   * @param nativeErrorCode - Optional native-side code for diagnostics.
   */
  constructor(
    code: GoogleSignInErrorCode,
    message: string,
    nativeErrorCode?: string
  ) {
    super(message);
    this.name = 'GoogleSignInError';
    this.code = code;
    this.nativeErrorCode = nativeErrorCode;
  }
}

/**
 * Type guard that narrows `unknown` to {@link GoogleSignInError}.
 *
 * @param error - Any caught value.
 * @returns `true` when `error` is a {@link GoogleSignInError} instance.
 */
export function isGoogleSignInError(
  error: unknown
): error is GoogleSignInError {
  return error instanceof GoogleSignInError;
}
