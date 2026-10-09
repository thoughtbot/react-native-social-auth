/**
 * Discriminator for {@link AppleSignInError.code}.
 *
 * @remarks
 * Sign in with Apple is iOS-only in this library; `NOT_SUPPORTED` is returned
 * on Android and on iOS versions older than 13.
 */
export enum AppleSignInErrorCode {
  /** The user dismissed the sign-in sheet. Don't surface an error. */
  SIGN_IN_CANCELLED = 'SIGN_IN_CANCELLED',
  /** A generic native failure; inspect `message` and `nativeErrorCode` for details. */
  SIGN_IN_FAILED = 'SIGN_IN_FAILED',
  /** Apple returned a malformed or empty authorization response. */
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  /** The request could not be handled (e.g. no account on device). */
  NOT_HANDLED = 'NOT_HANDLED',
  /** A method was called before {@link AppleSignIn.configure}. */
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  /** Sign in with Apple is unavailable (Android, or iOS older than 13). */
  NOT_SUPPORTED = 'NOT_SUPPORTED',
}

/**
 * Typed error thrown / rejected by every {@link AppleSignIn} method.
 *
 * @example
 * ```ts
 * try {
 *   await AppleSignIn.signIn();
 * } catch (error) {
 *   if (isAppleSignInError(error) && error.code === AppleSignInErrorCode.SIGN_IN_CANCELLED) {
 *     return;
 *   }
 *   throw error;
 * }
 * ```
 */
export class AppleSignInError extends Error {
  /** The platform-agnostic error code. */
  readonly code: AppleSignInErrorCode;
  /**
   * The underlying native error code (e.g. an `ASAuthorizationError` raw
   * value). Useful for telemetry; do not branch on it from application code —
   * branch on {@link code} instead.
   */
  readonly nativeErrorCode: string | undefined;

  /**
   * @param code - An {@link AppleSignInErrorCode} value.
   * @param message - Human-readable description, suitable for logs.
   * @param nativeErrorCode - Optional native-side code for diagnostics.
   */
  constructor(
    code: AppleSignInErrorCode,
    message: string,
    nativeErrorCode?: string
  ) {
    super(message);
    this.name = 'AppleSignInError';
    this.code = code;
    this.nativeErrorCode = nativeErrorCode;
  }
}

/**
 * Type guard that narrows `unknown` to {@link AppleSignInError}.
 *
 * @param error - Any caught value.
 * @returns `true` when `error` is an {@link AppleSignInError} instance.
 */
export function isAppleSignInError(error: unknown): error is AppleSignInError {
  return error instanceof AppleSignInError;
}
