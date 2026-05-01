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

function configure(config: GoogleSignInConfig): void {
  NativeGoogleSignIn.configure(config);
  _configured = true;
}

async function signIn(): Promise<GoogleAuthCredential> {
  ensureConfigured();
  const result = await NativeGoogleSignIn.signIn();
  return result as unknown as GoogleAuthCredential;
}

async function signOut(): Promise<void> {
  ensureConfigured();
  await NativeGoogleSignIn.signOut();
}

async function getCurrentUser(): Promise<GoogleUser | null> {
  ensureConfigured();
  const result = await NativeGoogleSignIn.getCurrentUser();
  return result as unknown as GoogleUser | null;
}

async function revokeAccess(): Promise<void> {
  ensureConfigured();
  await NativeGoogleSignIn.revokeAccess();
}

function isSignedIn(): boolean {
  ensureConfigured();
  return NativeGoogleSignIn.isSignedIn();
}

export const GoogleSignIn = {
  configure,
  signIn,
  signOut,
  getCurrentUser,
  revokeAccess,
  isSignedIn,
} as const;
