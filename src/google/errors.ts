export enum GoogleSignInErrorCode {
  SIGN_IN_CANCELLED = 'SIGN_IN_CANCELLED',
  SIGN_IN_FAILED = 'SIGN_IN_FAILED',
  NO_CREDENTIALS = 'NO_CREDENTIALS',
  PLAY_SERVICES_NOT_AVAILABLE = 'PLAY_SERVICES_NOT_AVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
}

export class GoogleSignInError extends Error {
  readonly code: GoogleSignInErrorCode;
  readonly nativeErrorCode: string | undefined;

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

export function isGoogleSignInError(
  error: unknown
): error is GoogleSignInError {
  return error instanceof GoogleSignInError;
}
