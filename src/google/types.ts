export interface GoogleSignInConfig {
  webClientId: string;
  iosClientId?: string;
  offlineAccess?: boolean;
  scopes?: string[];
  hostedDomain?: string;
  autoSelect?: boolean;
  nonce?: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  displayName: string | null;
  givenName: string | null;
  familyName: string | null;
  photoUrl: string | null;
}

export interface GoogleAuthCredential {
  idToken: string;
  accessToken: string | null;
  serverAuthCode: string | null;
  user: GoogleUser;
}
