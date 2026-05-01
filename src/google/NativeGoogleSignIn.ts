import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  configure(config: Object): void;
  signIn(): Promise<Object>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<Object | null>;
  revokeAccess(): Promise<void>;
  isSignedIn(): boolean;
}

export default TurboModuleRegistry.getEnforcing<Spec>('GoogleSignIn');
