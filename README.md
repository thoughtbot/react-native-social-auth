<img src="https://thoughtbot.com/thoughtbot-logo-for-readmes.svg" width="375" />

# @thoughtbot/react-native-social-auth

[![npm version](https://img.shields.io/npm/v/@thoughtbot/react-native-social-auth.svg)](https://www.npmjs.com/package/@thoughtbot/react-native-social-auth)
[![npm downloads](https://img.shields.io/npm/dm/@thoughtbot/react-native-social-auth.svg)](https://www.npmjs.com/package/@thoughtbot/react-native-social-auth)
[![license](https://img.shields.io/npm/l/@thoughtbot/react-native-social-auth.svg)](https://github.com/thoughtbot/react-native-social-auth/blob/main/LICENSE)

Typed, Turbo Module social sign-in for React Native: **Google** (Android Credential Manager + GoogleSignIn-iOS) and **Sign in with Apple** (native AuthenticationServices), with branding-compliant buttons and an Expo config plugin.

**Platforms:** Google — Android · iOS · Expo. &nbsp;Apple — iOS · Expo.

> ⚠️ **Pre-1.0.** The API may change between minor versions without deprecation — pin an exact version and check the [CHANGELOG](CHANGELOG.md) before upgrading.

<img src="https://github.com/thoughtbot/react-native-social-auth/blob/main/example/assets/607211820-e04101f3-30b1-49f9-a249-562496f43061-ezgif.com-video-to-gif-converter.gif" width="375">

https://github.com/user-attachments/assets/cd67750b-d1a4-4737-ae08-860f27c4585c



Requires React Native `>=0.74` (new architecture), Android `minSdkVersion` 24.

## Install

```sh
yarn add @thoughtbot/react-native-social-auth
```

Then rebuild the native app (`yarn android` / `cd ios && pod install && cd .. && yarn ios`). The `<GoogleSignInButton />` needs the optional [`react-native-svg`](https://github.com/software-mansion/react-native-svg) peer dep (`yarn add react-native-svg`); nothing else does.

Each provider is imported from its own entry point — `…/google` and `…/apple` (both are also re-exported from the package root), with the buttons on `…/google-button` and `…/apple-button`.

## Usage

**Google**

```tsx
import {
  GoogleSignIn,
  isGoogleSignInError,
} from '@thoughtbot/react-native-social-auth/google';
import { GoogleSignInButton } from '@thoughtbot/react-native-social-auth/google-button';

GoogleSignIn.configure({ webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com' });

async function signIn() {
  try {
    const { idToken, user } = await GoogleSignIn.signIn();
    // Verify idToken on your backend.
  } catch (error) {
    if (isGoogleSignInError(error)) console.warn(error.code, error.message);
  }
}

// <GoogleSignInButton onPress={signIn} />
```

**Apple** (iOS only — gate with `AppleSignIn.isAvailable()`)

```tsx
import {
  AppleSignIn,
  isAppleSignInError,
  AppleSignInErrorCode,
} from '@thoughtbot/react-native-social-auth/apple';
import { AppleSignInButton } from '@thoughtbot/react-native-social-auth/apple-button';

AppleSignIn.configure({ requestedScopes: ['email', 'fullName'] });

async function signIn() {
  try {
    const { identityToken, user } = await AppleSignIn.signIn();
    // Verify identityToken on your backend. Persist user.email / user.fullName
    // now — Apple only returns them on the FIRST authorization.
  } catch (error) {
    if (isAppleSignInError(error) && error.code === AppleSignInErrorCode.SIGN_IN_CANCELLED) return;
    throw error;
  }
}

// <AppleSignInButton onPress={signIn} />
```

Both providers need native setup (Google Cloud credentials / the Apple entitlement) before a real device will sign in — expand the provider below.

## Providers

<details>
<summary><b>Google</b> — Android · iOS · Expo</summary>

### Google Cloud setup

All OAuth clients must live in the **same** Google Cloud project. Create them under **APIs & Services → Credentials**:

1. **OAuth consent screen** — User type **External**; add your account under **Test users** while in Testing.
2. **Web** client ID → pass as `webClientId` (it's the ID-token audience).
3. **Android** client ID → your `applicationId` + the **debug** SHA-1 (`cd android && ./gradlew signingReport`).
4. **Android (release)** — a second Android client with your **release/upload** SHA-1. With Play App Signing, use the **App signing key** SHA-1 (Play Console → Setup → App integrity). Without it, production hits `[28444] Developer console is not set up correctly`.
5. **iOS** client ID → your Bundle ID; pass as `iosClientId`. Note the reversed-client-ID URL scheme (e.g. `com.googleusercontent.apps.123456-abc`) for the next step.

### iOS setup

Expo users: skip this — the [config plugin](#expo-config-plugin) handles it during `expo prebuild`. Bare React Native:

1. Add the reversed iOS client ID to `Info.plist`:

   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array><string>com.googleusercontent.apps.YOUR-REVERSED-IOS-CLIENT-ID</string></array>
     </dict>
   </array>
   ```

2. Forward incoming URLs in your `AppDelegate`:

   ```swift
   import GoogleSignIn

   @objc
   public func application(
     _ app: UIApplication,
     open url: URL,
     options: [UIApplication.OpenURLOptionsKey: Any] = [:]
   ) -> Bool {
     return GIDSignIn.sharedInstance.handle(url)
   }
   ```

3. GoogleSignIn 8+ needs module maps as a static lib — add `use_modular_headers!` after the platform line in your `ios/Podfile`, then `cd ios && pod install`.

### API

Import from `@thoughtbot/react-native-social-auth/google`. Call `configure()` once before any other method, or it throws `GoogleSignInError` with code `NOT_CONFIGURED`.

**`configure(config)`**

| Field | Type | Description |
| --- | --- | --- |
| `webClientId` | `string` (required) | Web OAuth client ID — the ID-token audience. |
| `iosClientId` | `string` | iOS OAuth client ID. |
| `offlineAccess` | `boolean` | Also request a server auth code. Default `false`. |
| `scopes` | `string[]` | Extra OAuth scopes beyond profile/email. |
| `hostedDomain` | `string` | Restrict to a Google Workspace domain. |
| `autoSelect` | `boolean` | Silently reuse the last account when possible. Default `false`. |
| `nonce` | `string` | Value bound into the ID token for backend verification. |

**`signIn(): Promise<GoogleAuthCredential>`** — tries auto sign-in, then the interactive sheet. Resolves to `{ idToken, accessToken: string | null, serverAuthCode: string | null, user: GoogleUser }`; rejects with `GoogleSignInError`.

**`signOut(): Promise<void>`** — clears local credential state. **`getCurrentUser(): Promise<GoogleUser | null>`** — in-memory user. **`revokeAccess(): Promise<void>`** — revokes app access. **`isSignedIn(): boolean`** — synchronous in-memory check.

`GoogleUser` → `{ id: string; email: string; displayName: string | null; givenName: string | null; familyName: string | null; photoUrl: string | null }`.

### `<GoogleSignInButton />`

From `@thoughtbot/react-native-social-auth/google-button` (needs `react-native-svg`). Conforms to Google's [branding guidelines](https://developers.google.com/identity/branding-guidelines) — don't restyle the logo, text, or theme colors or brand review may reject the app.

| Prop | Type | Default |
| --- | --- | --- |
| `theme` | `'light' \| 'dark' \| 'neutral'` | `'light'` |
| `shape` | `'rounded' \| 'square'` | `'rounded'` |
| `text` | `'signin' \| 'signup' \| 'continue'` | `'signin'` |
| `size` | `'standard' \| 'icon'` | `'standard'` |
| `onPress` | `() => void` | — |
| `disabled` | `boolean` | `false` |
| `style` | `StyleProp<ViewStyle>` | — |
| `testID` | `string` | — |

### Errors

Every rejection is a `GoogleSignInError` with a `code` from `GoogleSignInErrorCode`; narrow with `isGoogleSignInError`.

| Code | Meaning |
| --- | --- |
| `SIGN_IN_CANCELLED` | User dismissed the sheet — don't show an error. |
| `SIGN_IN_FAILED` | Generic Credential Manager failure; see `message`. |
| `NO_CREDENTIALS` | No Google accounts / none authorized for auto sign-in. |
| `PLAY_SERVICES_NOT_AVAILABLE` | Play Services missing or out of date. |
| `NETWORK_ERROR` | Couldn't reach Google's auth servers. |
| `NOT_CONFIGURED` | Called before `configure()`. |

</details>

<details>
<summary><b>Apple</b> — iOS only</summary>

Sign in with Apple uses the native `ASAuthorizationController` (iOS 13+). Apple's [Guideline 4.8](https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple) requires offering it when your iOS app offers Google (or other third-party) sign-in. On Android every method except `isAvailable()` throws `NOT_SUPPORTED` and `<AppleSignInButton />` renders `null`, so gate your Apple UI with `AppleSignIn.isAvailable()`.

### iOS setup

Needs the **`com.apple.developer.applesignin`** entitlement, and nothing else:

- **Expo:** set `enableAppleSignIn: true` on the [config plugin](#expo-config-plugin), then `npx expo prebuild --clean`.
- **Bare React Native:** Xcode → target → **Signing & Capabilities** → **+ Capability** → **Sign in with Apple**, and enable the capability for your App ID in the [Apple Developer portal](https://developer.apple.com/account/resources/identifiers/list). Then `cd ios && pod install`.

### API

Import from `@thoughtbot/react-native-social-auth/apple`.

**`configure(config)`**

| Field | Type | Description |
| --- | --- | --- |
| `requestedScopes` | `('email' \| 'fullName')[]` | Requested on first authorization. Default both. |
| `nonce` | `string` | Bound into the identity token; verify server-side. |
| `state` | `string` | Opaque value echoed back on the credential. |

**`signIn(): Promise<AppleAuthCredential>`** — presents the native sheet. Resolves to `{ identityToken: string | null, authorizationCode: string | null, state: string | null, user: AppleUser }`.

> ⚠️ **First authorization only:** `user.email` and `user.fullName` are returned **only the first time** a user authorizes your app — `null` on every later sign-in. Persist them server-side on first sign-in. `user.id` is always returned.

**`getCredentialState(userId): Promise<'authorized' | 'revoked' | 'notFound' | 'transferred'>`** — check a stored `user.id`, e.g. at launch to detect revocation. No `configure()` needed. **`isAvailable(): boolean`** — `true` on iOS 13+.

There is intentionally no `signOut`/`revokeAccess`: Apple has no client-side sign-out, and revocation is a server-side token call — use `getCredentialState` to detect it.

`AppleUser` → `{ id: string; email: string | null; fullName: { givenName, familyName, nickname } | null; realUserStatus: 'likelyReal' | 'unknown' | 'unsupported' }`.

### `<AppleSignInButton />`

From `@thoughtbot/react-native-social-auth/apple-button` — Apple's native `ASAuthorizationAppleIDButton` (always HIG-compliant and auto-localized; no `react-native-svg`). Renders `null` on Android.

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `'signIn' \| 'continue' \| 'signUp'` | `'signIn'` |
| `buttonStyle` | `'black' \| 'white' \| 'whiteOutline'` | `'black'` |
| `cornerRadius` | `number` | Apple default |
| `onPress` | `() => void` | — |
| `style` | `StyleProp<ViewStyle>` | — |
| `testID` | `string` | — |

### Errors

Every rejection is an `AppleSignInError` with a `code` from `AppleSignInErrorCode`; narrow with `isAppleSignInError`.

| Code | Meaning |
| --- | --- |
| `SIGN_IN_CANCELLED` | User dismissed the sheet — don't show an error. |
| `SIGN_IN_FAILED` | Generic AuthenticationServices failure; see `message`. |
| `INVALID_RESPONSE` | Malformed or empty authorization. |
| `NOT_HANDLED` | Request couldn't be handled (e.g. no Apple account). |
| `NOT_CONFIGURED` | `signIn()` called before `configure()`. |
| `NOT_SUPPORTED` | Unavailable (Android, or iOS older than 13). |

</details>

## Expo config plugin

<details>
<summary>Plugin props &amp; prebuild</summary>

Expo Go can't load third-party native modules — use a [development build](https://docs.expo.dev/develop/development-builds/introduction/). Add the plugin in `app.config.ts` / `app.json`:

```ts
plugins: [
  [
    '@thoughtbot/react-native-social-auth',
    {
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // Google (iOS)
      enableAppleSignIn: true, // Apple
    },
  ],
],
```

| Prop | Type | Description |
| --- | --- | --- |
| `iosClientId` | `string` | iOS OAuth client ID. Registers the reversed-client-ID URL scheme and the `AppDelegate` URL forwarder for Google. |
| `enableAppleSignIn` | `boolean` | Adds the `com.apple.developer.applesignin` entitlement. No effect on Android. |

The props are independent (Google, Apple, or both); omit both and the plugin no-ops on iOS. Then run `npx expo prebuild --clean` — it's idempotent. You still call `configure()` from JS at runtime.

</details>

## Example app

A runnable example lives in [`/example`](example/):

```sh
yarn install
cp example/.env.example example/.env   # set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (+ _IOS_CLIENT_ID for iOS)
yarn workspace @thoughtbot/react-native-social-auth-example start --clear
yarn workspace @thoughtbot/react-native-social-auth-example ios      # or android
```

It showcases every `GoogleSignInButton` variant, the `AppleSignInButton` (iOS), and the full API.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Roadmap](ROADMAP.md)

## License

React Native Social Auth is Copyright © 2026 thoughtbot. It is free software, and may be
redistributed under the terms specified in the [LICENSE](/LICENSE) file.

### About thoughtbot

<img src="https://thoughtbot.com/thoughtbot-logo-for-readmes.svg" width="375" />

React Native Social Auth is maintained by thoughtbot, inc.
The names and logos for thoughtbot are trademarks of thoughtbot, inc.

We love open source software! See [our other projects][community] or
[hire us][hire] to design, develop, and grow your product.

[community]: https://thoughtbot.com/community?utm_source=github
[hire]: https://thoughtbot.com/hire-us?utm_source=github
