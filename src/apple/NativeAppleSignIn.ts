import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  configure(config: Object): void;
  signIn(): Promise<Object>;
  getCredentialState(userId: string): Promise<string>;
  isAvailable(): boolean;
}

// `get` (not `getEnforcing`) so that importing this module never throws on
// platforms where no native `AppleSignIn` module is registered (Android). The
// JS wrapper translates a `null` module into a typed `NOT_SUPPORTED` error.
export default TurboModuleRegistry.get<Spec>('AppleSignIn');
