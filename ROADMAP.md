# Roadmap: `@thoughtbot/react-native-social-auth` — Google Provider (Credential Manager API)

## Phase 1: Foundation & Project Setup

- [x] Confirm npm scope access for `@thoughtbot` and reserve the package name (`@thoughtbot/react-native-social-auth@0.1.0` published)
- [x] Scaffold the library with `create-react-native-library` using the `turbo-module` template with backward compatibility enabled
- [x] Set up monorepo structure with `/src`, `/android`, `/ios`, `/example`, `/docs`
- [x] Configure TypeScript (strict mode), ESLint, Prettier — align with thoughtbot's existing JS/TS style guide
- [x] Set up `react-native-builder-bob` for building the package
- [x] Configure Jest + React Native Testing Library
- [x] Set up GitHub Actions CI (lint, typecheck, test, build, example app build)
- [x] Add MIT license, CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue/PR templates
- [x] Set up release-it + conventional-changelog for versioning
- [x] Add `Release` workflow with npm Trusted Publishing (OIDC) — no long-lived `NPM_TOKEN`
- [x] Create example app demonstrating the package

## Phase 2: API Design & Codegen Spec

- [x] Draft the public JS API (provider-agnostic from day one, even if only Google ships first)
- [x] Define core types: `AuthCredential`, `AuthUser`, `AuthError`, `SignInOptions`
- [x] Write the Turbo Module codegen spec in TypeScript for the Google module
- [x] Define methods: `configure()`, `signIn()`, `signOut()`, `getCurrentUser()`, `revokeAccess()`, `isSignedIn()`
- [x] Design error handling strategy (typed errors, platform-specific error codes mapped to common codes)
- [ ] Document the provider interface so future providers (Apple, GitHub) follow the same shape
- [ ] Review API design with thoughtbot team / gather feedback before implementation

## Phase 3: Android Implementation (Credential Manager API)

- [x] Add Credential Manager dependencies (`androidx.credentials:credentials`, `androidx.credentials:credentials-play-services-auth`, `com.google.android.libraries.identity.googleid:googleid`)
- [x] Set minimum SDK version (Credential Manager requires API 19+, but Google ID helper needs higher)
- [x] Implement `configure()` — store web client ID, nonce settings, auto-select preferences
- [x] Implement `signIn()` using `CredentialManager.getCredential()` with `GetSignInWithGoogleOption` (button flow) and `GetGoogleIdOption` (bottom sheet flow)
- [x] Handle `GoogleIdTokenCredential` parsing and return ID token + profile info to JS
- [x] Implement `signOut()` via `CredentialManager.clearCredentialState()`
- [x] Implement nonce generation and validation helpers
- [x] Map Android exceptions (`GetCredentialException`, `NoCredentialException`, user cancellation) to typed JS errors
- [x] Handle both bottom-sheet (One Tap replacement) and button-triggered flows
- [x] Test on physical Android device with and without Google account configured

## Phase 4: iOS Implementation (GoogleSignIn-iOS SDK)

- [x] Add `GoogleSignIn` via CocoaPods in the podspec
- [x] Configure `Info.plist` URL schemes (documented in README under iOS setup)
- [x] Implement `configure()` — store iOS client ID, server client ID (for ID token audience)
- [x] Implement `signIn()` using `GIDSignIn.sharedInstance.signIn(withPresenting:)` — get the root view controller from RN
- [x] Return ID token, access token, and user profile to JS in the same shape as Android
- [x] Implement `signOut()` and `disconnect()` (revoke)
- [x] Implement `getCurrentUser()` via `GIDSignIn.sharedInstance.currentUser`
- [x] Handle `restorePreviousSignIn` for silent re-authentication
- [x] Map `GIDSignInError` codes to typed JS errors matching Android's error shape
- [x] Handle the URL callback in AppDelegate (document the required `application(_:open:options:)` integration)
- [x] Test on physical iOS device and simulator

## Phase 5: JS Layer & Button Components

- [ ] Implement the provider abstraction layer that dispatches to platform modules
- [x] Build `GoogleSignInButton` as a styled React component (not native) per Google's 2025 branding guidelines
- [x] Support light/dark/neutral theme variants
- [x] Support icon-only and standard button shapes (rounded + square)
- [ ] Support localization (button text in multiple languages per Google's assets)
- [x] Ensure accessibility labels and roles are correct (covered by RNTL tests)
- [ ] Build generic `<SignInButton provider="google" />` wrapper for future extensibility
- [x] Export all types from the package root

## Phase 6: Expo Support

- [ ] Write an Expo config plugin that handles `Info.plist` URL schemes (iOS) and any Android manifest needs
- [ ] Test in Expo prebuild / development build workflow
- [ ] Document Expo managed workflow limitations (if any) and EAS build setup
- [ ] Add the config plugin to the package's `app.plugin.js` entry

## Phase 7: Documentation

- [x] Write comprehensive README: install, platform setup, quickstart, API reference
- [x] Document Google Cloud Console setup (creating OAuth client IDs for Android, iOS, web)
- [x] Document SHA-1 fingerprint setup for Android (including Play App Signing for release builds)
- [x] Document `Info.plist` configuration for iOS (URL schemes + AppDelegate forwarding)
- [x] Add TSDoc comments to every public-API symbol so consumers get hover-docs in their IDE
- [ ] Provide migration guide from `@react-native-google-signin/google-signin`
- [ ] Document ID token verification on the backend (link to Google's guides)
- [x] Add troubleshooting context (the `28444` developer-console error, simulator limitations, Play Services requirement) inline in setup sections
- [ ] Build a docs site (Docusaurus, or thoughtbot's preferred tool) if scope warrants it

## Phase 8: Testing & Quality

- [x] Unit tests for JS layer with mocked native modules (Jest, 16 tests in `GoogleSignIn.test.ts`)
- [x] Component tests for the button (React Native Testing Library, 13 tests in `GoogleSignInButton.test.tsx`)
- [x] Error / type-guard tests (11 tests in `errors.test.ts`)
- [ ] Integration tests in the example app (Detox or Maestro)
- [ ] Manual test matrix: Android (Play Services present/absent, multiple accounts, no accounts, cancelled flow), iOS (signed in/out, cancelled, restore previous)
- [x] Test on new architecture (Fabric/Turbo) — verified on iOS simulator + iPhone 12 Pro and Android emulator
- [x] Test with RN 0.83 (current as of 2026)
- [ ] Verify bundle size impact is minimal
- [ ] Run on low-end devices to catch performance issues

## Phase 9: Release

- [x] Publish `0.1.0` to npm under `@thoughtbot` scope
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
