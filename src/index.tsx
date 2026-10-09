// Convenience aggregate. Each provider is also available on its own entry point
// (`@thoughtbot/react-native-social-auth/google` and `/apple`), with the buttons
// on `/google-button` and `/apple-button`. Re-export the per-provider barrels so
// the root never drifts from them.
export * from './google';
export * from './apple';
