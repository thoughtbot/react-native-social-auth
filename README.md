<img src="https://thoughtbot.com/thoughtbot-logo-for-readmes.svg" width="375" />

# @thoughtbot/react-native-social-auth

[![npm version](https://img.shields.io/npm/v/@thoughtbot/react-native-social-auth.svg)](https://www.npmjs.com/package/@thoughtbot/react-native-social-auth)
[![npm downloads](https://img.shields.io/npm/dm/@thoughtbot/react-native-social-auth.svg)](https://www.npmjs.com/package/@thoughtbot/react-native-social-auth)
[![license](https://img.shields.io/npm/l/@thoughtbot/react-native-social-auth.svg)](https://github.com/thoughtbot/react-native-social-auth/blob/main/LICENSE)

**Modern social sign-in for React Native.** A typed `signIn()` API for **Google** (backed by Android's **Credential Manager** and the **GoogleSignIn-iOS SDK**) and **Sign in with Apple** (backed by the native **AuthenticationServices** framework on iOS), plus branding-compliant button components and a first-party **Expo config plugin**. TypeScript-first, ships as a **Turbo Module** for the new architecture, and works in both bare React Native CLI projects and Expo dev-client / EAS Build.

**Platform support:** Google — ✅ Android · ✅ iOS · ✅ Expo. Apple — ✅ iOS · ✅ Expo (Android not supported).

> ⚠️ **Early development.** This package is pre-1.0 and under active development. The public API — configuration options, method signatures, button props, and error codes — may change between minor versions without a deprecation cycle. If you need stability, pin the exact version in `package.json` (`"@thoughtbot/react-native-social-auth": "0.x.y"`, not `"^0.x.y"`) and check the [CHANGELOG](CHANGELOG.md) before upgrading. We aim for a stable `1.0.0` once the API has been battle-tested.

## Features

- Android **Credential Manager** and iOS **GoogleSignIn-iOS SDK** integration, both with auto-sign-in + interactive fallback
- **Sign in with Apple** via the native `ASAuthorizationController` (iOS 13+), including a credential-state query and the official native button
- Branding-compliant **`GoogleSignInButton`** (3 themes, 2 shapes, 3 text variants, icon-only) and **`AppleSignInButton`** (Apple's native `ASAuthorizationAppleIDButton`)
- TypeScript-first, ships as a **Turbo Module** (new architecture)
- Typed errors via `GoogleSignInError` / `AppleSignInError` and their error-code enums for clean UX-level handling

<img src="https://github.com/thoughtbot/react-native-social-auth/blob/main/example/assets/607211820-e04101f3-30b1-49f9-a249-562496f43061-ezgif.com-video-to-gif-converter.gif" width="375">

## Requirements

- React Native `>=0.74` with the new architecture enabled
- Android `minSdkVersion` 24
- A Google Cloud project with OAuth 2.0 credentials (see [setup](#google-cloud-console-setup))
- [`react-native-svg`](https://github.com/software-mansion/react-native-svg) `>=13.0.0` — **optional** peer dependency, only required if you use [`<GoogleSignInButton />`](#googlesigninbutton-) (it renders the Google "G" logo)

## Installation

```sh
yarn add @thoughtbot/react-native-social-auth
# or
npm install @thoughtbot/react-native-social-auth
```

> If you use the pre-built [`<GoogleSignInButton />`](#googlesigninbutton-) component, also install `react-native-svg` and import the button from the `/google-button` subpath (see below). The core `GoogleSignIn` API has no SVG dependency.
>
> ```sh
> yarn add react-native-svg
> ```

After installing, rebuild the native app:

```sh
# Android
yarn android

# iOS (when supported)
cd ios && pod install && cd ..
yarn ios
```

## Google Cloud Console setup

Most "sign-in failed" issues come from misconfigured credentials. Follow these steps once per project.

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com/).
2. Configure the **OAuth consent screen**:
   - User type: **External**
   - Publishing status: **Testing** is fine for development
   - Add your Google account under **Test users**
3. Create a **Web application** OAuth client ID under **APIs & Services → Credentials**. Copy the Client ID — this is the value you'll pass as `webClientId`.
4. Create an **Android** OAuth client ID in the **same project**:
   - **Package name**: your app's `applicationId` (e.g. `com.example.myapp`)
   - **SHA-1 certificate fingerprint**: get it with
     ```sh
     cd android && ./gradlew signingReport
     ```
     and copy the `SHA1` line under `Variant: debug`.
5. **Repeat step 4 for production.** The debug client only authorizes your debug-signed APK. Before shipping a signed release build (Play Store, internal testing tracks, or any release-signed APK), create a **second Android OAuth client** in the same GCP project using the same package name and the **release SHA-1** of your upload/signing key. If you use **Play App Signing**, use the **App signing key certificate** SHA-1 from the Play Console (Setup → App integrity), not your upload key. Without this, production users will hit `[28444] Developer console is not set up correctly`.
6. **For iOS**, also create an **iOS** OAuth client ID in the same GCP project with your app's **Bundle Identifier**. Copy the Client ID — pass it as `iosClientId`. Copy the **iOS URL scheme** Google shows you (it's the reversed iOS Client ID, e.g. `com.googleusercontent.apps.123456-abcdef`) — you'll add it to `Info.plist` in the next section.

The Web client ID is what your code references for the ID-token audience; each platform-specific client (Android debug, Android release, iOS) is an invisible passport that authorizes a specific build to use it. **All clients must live in the same GCP project.**

## iOS setup

In addition to the Cloud Console step above, the host app needs two iOS-specific changes.

> **Using Expo?** Skip the manual `Info.plist` and `AppDelegate` edits below — [our config plugin](#expo-config-plugin) handles them during `expo prebuild`. Bare React Native CLI users continue with the manual steps in this section.

### 1. Register the OAuth URL scheme

Google routes the sign-in callback back into your app via a custom URL scheme. Add the reversed iOS Client ID to `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR-REVERSED-IOS-CLIENT-ID</string>
    </array>
  </dict>
</array>
```

If you use **Expo**, declare it in `app.json` under `expo.ios.infoPlist.CFBundleURLTypes` and rerun `npx expo prebuild --platform ios --clean`.

### 2. Forward incoming URLs to the SDK

In your `AppDelegate`, forward `application(_:open:options:)` to `GIDSignIn.sharedInstance.handle(_:)`. Importing `GoogleSignIn` here pulls in the official GoogleSignIn-iOS SDK module (already a transitive dependency of this package).

**Swift:**
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

**Objective-C:**
```objc
#import <GoogleSignIn/GoogleSignIn.h>

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [[GIDSignIn sharedInstance] handleURL:url];
}
```

### 3. Configure with both client IDs

Pass both the Web client ID (token audience) and iOS client ID (caller identity) to `configure`:

```ts
GoogleSignIn.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
});
```

Finally, run `cd ios && pod install` after installing the package.

GoogleSignIn 8 and later includes Swift dependencies that require module maps
when CocoaPods builds them as static libraries. Add this near the top of your
`ios/Podfile`, after the iOS platform declaration:

```ruby
platform :ios, min_ios_version_supported
use_modular_headers!
```

The Expo config plugin adds this declaration automatically.

## Expo config plugin

This package ships an Expo config plugin so you don't have to hand-edit `Info.plist` or `AppDelegate` in Expo projects. **Both React Native CLI and Expo projects are supported** — pick the setup section that matches your project.

> **Heads up:** Expo Go cannot ship third-party native modules. You must use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (via `expo-dev-client` and EAS Build) or the bare workflow.

### Install

```sh
npx expo install @thoughtbot/react-native-social-auth
# add react-native-svg too if you use <GoogleSignInButton />:
npx expo install react-native-svg
```

### Add the plugin

In `app.config.ts` (or `app.json`):

```ts
export default {
  expo: {
    // ...
    plugins: [
      [
        '@thoughtbot/react-native-social-auth',
        {
          iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        },
      ],
    ],
  },
};
```

### Plugin props

| Prop                | Type      | Required for iOS   | Description                                                                                                                       |
| ------------------- | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `iosClientId`       | `string`  | Yes (for Google)   | Your iOS OAuth Client ID (e.g. `123456-abc.apps.googleusercontent.com`). The plugin reverses it and registers the URL scheme.     |
| `enableAppleSignIn` | `boolean` | Yes (for Apple)    | When `true`, adds the `com.apple.developer.applesignin` entitlement required for Sign in with Apple. No effect on Android.         |

Omit both if you only target Android — the plugin becomes a no-op on iOS and logs a warning. The two props are independent: pass `iosClientId` for Google, `enableAppleSignIn` for Apple, or both.

### Regenerate native code

```sh
npx expo prebuild --clean
```

This runs the plugin, which writes the reversed iOS Client ID into `Info.plist`'s `CFBundleURLSchemes` and adds the `application(_:open:options:)` URL forwarder to `AppDelegate`. Subsequent prebuilds are idempotent — the plugin won't re-inject if its marker is already present.

You still call `GoogleSignIn.configure({ webClientId, iosClientId })` from JS at runtime (the plugin handles the native bits; it doesn't replace `configure()`).

## Quick start

```tsx
import { useState } from 'react';
import {
  GoogleSignIn,
  isGoogleSignInError,
  type GoogleUser,
} from '@thoughtbot/react-native-social-auth';
import { GoogleSignInButton } from '@thoughtbot/react-native-social-auth/google-button';

GoogleSignIn.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});

export function SignInScreen() {
  const [user, setUser] = useState<GoogleUser | null>(null);

  const handleSignIn = async () => {
    try {
      const credential = await GoogleSignIn.signIn();
      setUser(credential.user);
      // Send credential.idToken to your backend for verification.
    } catch (error) {
      if (isGoogleSignInError(error)) {
        console.warn(error.code, error.message);
      }
    }
  };

  return <GoogleSignInButton onPress={handleSignIn} />;
}
```

## API reference

All members are named exports from `@thoughtbot/react-native-social-auth`, except [`<GoogleSignInButton />`](#googlesigninbutton-), which is exported from the `@thoughtbot/react-native-social-auth/google-button` subpath.

### `GoogleSignIn`

A singleton with the runtime sign-in API. **You must call `configure()` once before any other method**, or they'll throw `GoogleSignInError` with code `NOT_CONFIGURED`.

#### `configure(config: GoogleSignInConfig): void`

Stores credentials and options used by subsequent calls.

| Field            | Type       | Required | Description                                                                                       |
| ---------------- | ---------- | -------- | ------------------------------------------------------------------------------------------------- |
| `webClientId`    | `string`   | Yes      | The **Web application** OAuth Client ID. This is the audience of the issued ID token.             |
| `iosClientId`    | `string`   | No       | iOS OAuth Client ID.                                                |
| `offlineAccess`  | `boolean`  | No       | Request a server auth code in addition to the ID token. Default `false`.                          |
| `scopes`         | `string[]` | No       | Additional OAuth scopes beyond the default profile/email.                                         |
| `hostedDomain`   | `string`   | No       | Restrict sign-in to a Google Workspace domain.                                                    |
| `autoSelect`     | `boolean`  | No       | If `true`, returning users sign in silently when possible. Default `false`.                       |
| `nonce`          | `string`   | No       | A unique value bound into the ID token; recommended when verifying tokens on a backend.           |

#### `signIn(): Promise<GoogleAuthCredential>`

Launches the sign-in flow. On Android, this tries an **auto sign-in** first (silently re-uses a previously authorized account) and falls back to the **bottom sheet** when no authorized account is found.

Resolves to a `GoogleAuthCredential`:

| Field            | Type                       | Description                                                                  |
| ---------------- | -------------------------- | ---------------------------------------------------------------------------- |
| `idToken`        | `string`                   | The Google ID token. Verify this on your backend.                            |
| `accessToken`    | `string \| null`           | OAuth access token (null when not requested).                                |
| `serverAuthCode` | `string \| null`           | One-time code for backend exchange (requires `offlineAccess: true`).         |
| `user`           | [`GoogleUser`](#googleuser) | The authenticated user's profile.                                            |

Rejects with a [`GoogleSignInError`](#error-handling).

#### `signOut(): Promise<void>`

Clears the local credential state. The user remains signed into Google itself.

#### `getCurrentUser(): Promise<GoogleUser | null>`

Returns the in-memory authenticated user, or `null` if no one has signed in since app launch.

#### `revokeAccess(): Promise<void>`

Revokes the app's access to the user's Google account.

#### `isSignedIn(): boolean`

Synchronous check for whether a user is currently signed in (in memory).

### Types

#### `GoogleUser`

| Field         | Type             |
| ------------- | ---------------- |
| `id`          | `string`         |
| `email`       | `string`         |
| `displayName` | `string \| null` |
| `givenName`   | `string \| null` |
| `familyName`  | `string \| null` |
| `photoUrl`    | `string \| null` |

#### `GoogleAuthCredential`

See [`signIn`](#signin-promisegoogleauthcredential) above.

### `<GoogleSignInButton />`

A pre-built button that conforms to the [official Google branding guidelines](https://developers.google.com/identity/branding-guidelines). The button renders the Google "G" via `react-native-svg`, so it stays crisp at any density without bundling raster assets.

Because of that, it's exported from a dedicated subpath and `react-native-svg` must be installed to use it:

```tsx
import { GoogleSignInButton } from '@thoughtbot/react-native-social-auth/google-button';
```

| Prop       | Type                                       | Default      | Description                                                          |
| ---------- | ------------------------------------------ | ------------ | -------------------------------------------------------------------- |
| `theme`    | `'light' \| 'dark' \| 'neutral'`           | `'light'`    | Visual theme. Picks the right background, border, and text color.    |
| `shape`    | `'rounded' \| 'square'`                    | `'rounded'`  | Pill (`borderRadius: 20`) or square (`borderRadius: 4`).             |
| `text`     | `'signin' \| 'signup' \| 'continue'`       | `'signin'`   | One of the three call-to-actions Google permits.                     |
| `size`     | `'standard' \| 'icon'`                     | `'standard'` | Full-width button with text, or 40×40 icon-only.                     |
| `onPress`  | `() => void`                               | —            | Tap handler — wire this to `GoogleSignIn.signIn()`.                  |
| `disabled` | `boolean`                                  | `false`      | Renders at 0.38 opacity and disables taps.                           |
| `style`    | `StyleProp<ViewStyle>`                     | —            | Additional container styles (margin, alignment, etc.).               |
| `testID`   | `string`                                   | —            | Testing identifier.                                                  |

> **Do not restyle** the logo, text, or theme colors — Google's brand review will reject apps that do.

## Error handling

Every error from `GoogleSignIn` is a `GoogleSignInError` with a `code` from `GoogleSignInErrorCode`. Use `isGoogleSignInError` to narrow:

```tsx
import {
  GoogleSignIn,
  isGoogleSignInError,
  GoogleSignInErrorCode,
} from '@thoughtbot/react-native-social-auth';

try {
  await GoogleSignIn.signIn();
} catch (error) {
  if (isGoogleSignInError(error)) {
    switch (error.code) {
      case GoogleSignInErrorCode.SIGN_IN_CANCELLED:
        // User dismissed the bottom sheet — no UI needed.
        break;
      case GoogleSignInErrorCode.NO_CREDENTIALS:
        showAlert('No Google accounts on this device.');
        break;
      case GoogleSignInErrorCode.PLAY_SERVICES_NOT_AVAILABLE:
        showAlert('Google Play Services is missing or out of date.');
        break;
      default:
        showAlert(`Sign-in failed: ${error.message}`);
    }
  }
}
```

| Code                           | Meaning                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `SIGN_IN_CANCELLED`            | The user dismissed the bottom sheet. Don't show an error.                                |
| `SIGN_IN_FAILED`               | Generic failure from Credential Manager — the `message` has details.                     |
| `NO_CREDENTIALS`               | No Google accounts on the device, or no authorized accounts when auto sign-in was tried. |
| `PLAY_SERVICES_NOT_AVAILABLE`  | Device is missing Google Play Services (common on bare emulators).                       |
| `NETWORK_ERROR`                | The device couldn't reach Google's auth servers.                                         |
| `NOT_CONFIGURED`               | A method was called before `GoogleSignIn.configure()`.                                   |

## Sign in with Apple

Sign in with Apple is **iOS-only** (iOS 13+) and uses the native `ASAuthorizationController` — there is no Google Cloud–style console setup and no third-party SDK. Apple's [App Store Review Guideline 4.8](https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple) requires offering Sign in with Apple when your iOS app offers Google (or other third-party) sign-in, so most apps shipping the Google provider on iOS need this too.

> On Android, every method except `isAvailable()` throws `AppleSignInError` with code `NOT_SUPPORTED`, and `<AppleSignInButton />` renders `null`. Gate your Apple UI with `AppleSignIn.isAvailable()` (or `Platform.OS === 'ios'`).

### iOS setup

Sign in with Apple needs the **`com.apple.developer.applesignin`** entitlement (the "Sign in with Apple" capability) — nothing else. Unlike Google it needs no URL scheme and no `AppDelegate` changes.

- **Expo:** set `enableAppleSignIn: true` in the [config plugin](#expo-config-plugin), then run `npx expo prebuild --clean`. The plugin writes the entitlement for you.
- **Bare React Native:** in Xcode, select your target → **Signing & Capabilities** → **+ Capability** → **Sign in with Apple**. This adds the entitlement to your `.entitlements` file. You must also enable the capability for your App ID in the [Apple Developer portal](https://developer.apple.com/account/resources/identifiers/list).

Then `cd ios && pod install`.

### Quick start

```tsx
import { useState } from 'react';
import {
  AppleSignIn,
  isAppleSignInError,
  AppleSignInErrorCode,
} from '@thoughtbot/react-native-social-auth';
import { AppleSignInButton } from '@thoughtbot/react-native-social-auth/apple-button';

AppleSignIn.configure({ requestedScopes: ['email', 'fullName'] });

export function AppleButton() {
  const handleSignIn = async () => {
    try {
      const credential = await AppleSignIn.signIn();
      // Send credential.identityToken to your backend for verification.
      // Persist credential.user.email / fullName now — Apple only returns
      // them on the FIRST authorization.
    } catch (error) {
      if (isAppleSignInError(error) && error.code === AppleSignInErrorCode.SIGN_IN_CANCELLED) {
        return;
      }
      throw error;
    }
  };

  return <AppleSignInButton onPress={handleSignIn} />;
}
```

### `AppleSignIn`

The runtime API. All members are named exports from `@thoughtbot/react-native-social-auth`, except [`<AppleSignInButton />`](#applesigninbutton-), which is exported from the `@thoughtbot/react-native-social-auth/apple-button` subpath.

#### `configure(config: AppleSignInConfig): void`

| Field             | Type                          | Required | Description                                                                              |
| ----------------- | ----------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `requestedScopes` | `('email' \| 'fullName')[]`   | No       | What to request on first authorization. Default `['email', 'fullName']`.                 |
| `nonce`           | `string`                      | No       | Value bound into the returned identity token; verify it server-side to prevent replay.   |
| `state`           | `string`                      | No       | Opaque value echoed back on the credential.                                              |

#### `signIn(): Promise<AppleAuthCredential>`

Presents the native sign-in sheet. Resolves to an `AppleAuthCredential`:

| Field               | Type                      | Description                                                              |
| ------------------- | ------------------------- | ------------------------------------------------------------------------ |
| `identityToken`     | `string \| null`          | Apple-issued JWT. Verify on your backend against Apple's public keys.    |
| `authorizationCode` | `string \| null`          | One-time code your backend exchanges for refresh/access tokens.          |
| `state`             | `string \| null`          | The `state` value passed to `configure`, echoed back.                    |
| `user`              | [`AppleUser`](#appleuser) | The authenticated user.                                                  |

> ⚠️ **First-authorization only:** `user.email` and `user.fullName` are populated **only the very first time** a user authorizes your app. On every later sign-in they are `null`, even if you keep requesting them — so persist them server-side on first sign-in. `user.id` is always returned.

#### `getCredentialState(userId: string): Promise<AppleCredentialState>`

Queries whether a previously obtained `user.id` is still valid — useful at app launch to detect a revoked credential. Does not require `configure()`. Returns `'authorized'`, `'revoked'`, `'notFound'`, or `'transferred'`.

#### `isAvailable(): boolean`

`true` on iOS 13+, `false` on older iOS and on Android. Safe to call before `configure()`.

> There is deliberately no `signOut` or `revokeAccess`: Apple has no client-side sign-out, and revocation is a server-side token call. Use `getCredentialState` to detect revocation.

### Types

#### `AppleUser`

| Field            | Type                                              |
| ---------------- | ------------------------------------------------- |
| `id`             | `string`                                          |
| `email`          | `string \| null`                                  |
| `fullName`       | `{ givenName, familyName, nickname } \| null`     |
| `realUserStatus` | `'likelyReal' \| 'unknown' \| 'unsupported'`      |

### `<AppleSignInButton />`

Apple's official `ASAuthorizationAppleIDButton`, bridged as a native component so it always matches the current Human Interface Guidelines and localizes automatically. iOS-only — renders `null` on Android. Exported from the `/apple-button` subpath (no `react-native-svg` dependency):

```tsx
import { AppleSignInButton } from '@thoughtbot/react-native-social-auth/apple-button';
```

| Prop           | Type                                          | Default     | Description                                               |
| -------------- | --------------------------------------------- | ----------- | --------------------------------------------------------- |
| `type`         | `'signIn' \| 'continue' \| 'signUp'`          | `'signIn'`  | The call-to-action label.                                 |
| `buttonStyle`  | `'black' \| 'white' \| 'whiteOutline'`        | `'black'`   | Visual style.                                             |
| `cornerRadius` | `number`                                      | Apple's default | Corner radius in points.                              |
| `onPress`      | `() => void`                                  | —           | Tap handler — wire this to `AppleSignIn.signIn()`.        |
| `style`        | `StyleProp<ViewStyle>`                        | —           | Container styles (width, height, margin, etc.).           |
| `testID`       | `string`                                      | —           | Testing identifier.                                       |

### Error handling

Every error from `AppleSignIn` is an `AppleSignInError` with a `code` from `AppleSignInErrorCode`. Narrow with `isAppleSignInError`:

| Code                | Meaning                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `SIGN_IN_CANCELLED` | The user dismissed the sheet. Don't show an error.                           |
| `SIGN_IN_FAILED`    | Generic failure from AuthenticationServices — the `message` has details.     |
| `INVALID_RESPONSE`  | Apple returned a malformed or empty authorization.                           |
| `NOT_HANDLED`       | The request could not be handled (e.g. no Apple account on the device).      |
| `NOT_CONFIGURED`    | `signIn()` was called before `AppleSignIn.configure()`.                      |
| `NOT_SUPPORTED`     | Sign in with Apple is unavailable (Android, or iOS older than 13).           |

## Example app

A runnable example lives in [`/example`](example/). To try it:

```sh
yarn install
cp example/.env.example example/.env
# Edit example/.env and set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (and EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID for iOS)
yarn workspace @thoughtbot/react-native-social-auth-example start --clear
yarn workspace @thoughtbot/react-native-social-auth-example android
# or for iOS:
yarn workspace @thoughtbot/react-native-social-auth-example ios
```

For iOS, edit `example/app.json` and replace `REPLACE_WITH_REVERSED_IOS_CLIENT_ID` under `expo.ios.infoPlist.CFBundleURLTypes` with your reversed iOS Client ID, then run `npx expo prebuild --platform ios --clean` before the `yarn ios` command.

The example showcases every variant of `GoogleSignInButton`, the `AppleSignInButton` (on iOS), and exercises the full public API.

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
