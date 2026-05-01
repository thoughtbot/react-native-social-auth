# Roadmap: `@thoughtbot/react-native-social-auth` — Google Provider (Credential Manager API)

## Phase 1: Foundation & Project Setup

- [ ] Confirm npm scope access for `@thoughtbot` and reserve the package name
- [x] Scaffold the library with `create-react-native-library` using the `turbo-module` template with backward compatibility enabled
- [x] Set up monorepo structure with `/src`, `/android`, `/ios`, `/example`, `/docs`
- [ ] Configure TypeScript (strict mode), ESLint, Prettier — align with thoughtbot's existing JS/TS style guide
- [x] Set up `react-native-builder-bob` for building the package
- [ ] Configure Jest + React Native Testing Library
- [ ] Set up GitHub Actions CI (lint, typecheck, test, build, example app build)
- [ ] Add MIT license, CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue/PR templates
- [x] Set up changesets (or semantic-release) for versioning
- [x] Create example app demonstrating the package

## Phase 2: API Design & Codegen Spec

- [x] Draft the public JS API (provider-agnostic from day one, even if only Google ships first)
- [ ] Define core types: `AuthCredential`, `AuthUser`, `AuthError`, `SignInOptions`
- [x] Write the Turbo Module codegen spec in TypeScript for the Google module
- [x] Define methods: `configure()`, `signIn()`, `signOut()`, `getCurrentUser()`, `revokeAccess()`, `isSignedIn()`
- [x] Design error handling strategy (typed errors, platform-specific error codes mapped to common codes)
- [ ] Document the provider interface so future providers (Apple, GitHub) follow the same shape
- [ ] Review API design with thoughtbot team / gather feedback before implementation

## Phase 3: Android Implementation (Credential Manager API)

- [x] Add Credential Manager dependencies (`androidx.credentials:credentials`, `androidx.credentials:credentials-play-services-auth`, `com.google.android.libraries.identity.googleid:googleid`)
- [x] Set minimum SDK version (Credential Manager requires API 19+, but Google ID helper needs higher)
- [ ] Implement `configure()` — store web client ID, nonce settings, auto-select preferences
- [ ] Implement `signIn()` using `CredentialManager.getCredential()` with `GetSignInWithGoogleOption` (button flow) and `GetGoogleIdOption` (bottom sheet flow)
- [ ] Handle `GoogleIdTokenCredential` parsing and return ID token + profile info to JS
- [ ] Implement `signOut()` via `CredentialManager.clearCredentialState()`
- [ ] Implement nonce generation and validation helpers
- [ ] Map Android exceptions (`GetCredentialException`, `NoCredentialException`, user cancellation) to typed JS errors
- [ ] Handle both bottom-sheet (One Tap replacement) and button-triggered flows
- [ ] Test on physical Android device with and without Google account configured

## Phase 4: iOS Implementation (GoogleSignIn-iOS SDK)

- [ ] Add `GoogleSignIn` via CocoaPods in the podspec
- [ ] Configure `Info.plist` URL schemes (document this for package consumers)
- [ ] Implement `configure()` — store iOS client ID, server client ID (for ID token audience)
- [ ] Implement `signIn()` using `GIDSignIn.sharedInstance.signIn(withPresenting:)` — get the root view controller from RN
- [ ] Return ID token, access token, and user profile to JS in the same shape as Android
- [ ] Implement `signOut()` and `disconnect()` (revoke)
- [ ] Implement `getCurrentUser()` via `GIDSignIn.sharedInstance.currentUser`
- [ ] Handle `restorePreviousSignIn` for silent re-authentication
- [ ] Map `GIDSignInError` codes to typed JS errors matching Android's error shape
- [ ] Handle the URL callback in AppDelegate (document the required `application(_:open:options:)` integration)
- [ ] Test on physical iOS device and simulator

## Phase 5: JS Layer & Button Components

- [ ] Implement the provider abstraction layer that dispatches to platform modules
- [ ] Build `GoogleSignInButton` as a styled React component (not native) per Google's 2025 branding guidelines
- [ ] Support light/dark/neutral theme variants
- [ ] Support icon-only, standard, and wide button shapes
- [ ] Support localization (button text in multiple languages per Google's assets)
- [ ] Ensure accessibility labels and roles are correct
- [ ] Build generic `<SignInButton provider="google" />` wrapper for future extensibility
- [ ] Export all types from the package root

## Phase 6: Expo Support

- [ ] Write an Expo config plugin that handles `Info.plist` URL schemes (iOS) and any Android manifest needs
- [ ] Test in Expo prebuild / development build workflow
- [ ] Document Expo managed workflow limitations (if any) and EAS build setup
- [ ] Add the config plugin to the package's `app.plugin.js` entry

## Phase 7: Documentation

- [ ] Write comprehensive README: install, platform setup, quickstart, API reference
- [ ] Document Google Cloud Console setup (creating OAuth client IDs for Android, iOS, web)
- [ ] Document SHA-1 fingerprint setup for Android
- [ ] Document `Info.plist` configuration for iOS
- [ ] Provide migration guide from `@react-native-google-signin/google-signin`
- [ ] Document ID token verification on the backend (link to Google's guides)
- [ ] Add troubleshooting section (common errors, simulator limitations, Play Services requirements)
- [ ] Build a docs site (Docusaurus, or thoughtbot's preferred tool) if scope warrants it

## Phase 8: Testing & Quality

- [ ] Unit tests for JS layer with mocked native modules
- [ ] Integration tests in the example app (Detox or Maestro)
- [ ] Manual test matrix: Android (Play Services present/absent, multiple accounts, no accounts, cancelled flow), iOS (signed in/out, cancelled, restore previous)
- [ ] Test on both new architecture (Fabric/Turbo) and old architecture
- [ ] Test with RN 0.76+ (current versions in 2026)
- [ ] Verify bundle size impact is minimal
- [ ] Run on low-end devices to catch performance issues

## Phase 9: Release

- [ ] Publish `0.1.0-beta` to npm under `@thoughtbot` scope with `beta` tag
- [ ] Gather feedback from internal thoughtbot projects using the package
- [ ] Iterate based on real-world usage
- [ ] Publish `1.0.0` stable release
- [ ] Announce via thoughtbot blog post, social, and relevant RN community channels (Reactiflux, r/reactnative)
- [ ] Submit to awesome-react-native lists

## Phase 10: Post-Launch & Extensibility

- [ ] Monitor GitHub issues and respond to community feedback
- [ ] Add Apple Sign-In provider (required for App Store if offering Google on iOS)
- [ ] Add Facebook, GitHub, and other providers behind the same interface
- [ ] Keep Credential Manager and GoogleSignIn-iOS SDK versions up to date
- [ ] Plan for passkey support (Credential Manager already exposes this on Android)
