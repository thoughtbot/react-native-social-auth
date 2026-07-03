# @thoughtbot/react-native-social-auth

Drop-in Google Sign-In for React Native using Android's Credential Manager and the official Google branding.

**Platform support:** ✅ Android · ✅ iOS

## Features

- Android **Credential Manager** and iOS **GoogleSignIn-iOS SDK** integration, both with auto-sign-in + interactive fallback
- Google-branding-compliant **`GoogleSignInButton`** (3 themes, 2 shapes, 3 text variants, icon-only)
- TypeScript-first, ships as a **Turbo Module** (new architecture)
- Typed errors via `GoogleSignInError` and `GoogleSignInErrorCode` for clean UX-level handling

## Requirements

- React Native `>=0.74` with the new architecture enabled
- Android `minSdkVersion` 24
- A Google Cloud project with OAuth 2.0 credentials (see [setup](#google-cloud-console-setup))
- [`react-native-svg`](https://github.com/software-mansion/react-native-svg) `>=13.0.0` (peer dependency — used to render the Google "G" logo)

## Installation

```sh
yarn add @thoughtbot/react-native-social-auth react-native-svg
# or
npm install @thoughtbot/react-native-social-auth react-native-svg
```

> `react-native-svg` is a peer dependency. If it's not already in your app, install it explicitly — otherwise you'll see runtime errors like `Tried to register two views with the same name RNSVGRect`.

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

## Expo config plugin

This package ships an Expo config plugin so you don't have to hand-edit `Info.plist` or `AppDelegate` in Expo projects. **Both React Native CLI and Expo projects are supported** — pick the setup section that matches your project.

> **Heads up:** Expo Go cannot ship third-party native modules. You must use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (via `expo-dev-client` and EAS Build) or the bare workflow.

### Install

```sh
npx expo install @thoughtbot/react-native-social-auth react-native-svg
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

| Prop          | Type     | Required for iOS | Description                                                                                                                       |
| ------------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `iosClientId` | `string` | Yes              | Your iOS OAuth Client ID (e.g. `123456-abc.apps.googleusercontent.com`). The plugin reverses it and registers the URL scheme.     |

Omit `iosClientId` if you only target Android — the plugin becomes a no-op on iOS and logs a warning.

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
  GoogleSignInButton,
  isGoogleSignInError,
  type GoogleUser,
} from '@thoughtbot/react-native-social-auth';

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

All members are named exports from `@thoughtbot/react-native-social-auth`.

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

The example showcases every variant of `GoogleSignInButton` and exercises the full public API.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Roadmap](ROADMAP.md)

## License

MIT
