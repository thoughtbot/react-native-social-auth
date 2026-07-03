# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

To get started with the project, make sure you have the correct version of [Node.js](https://nodejs.org/) installed. See the [`.nvmrc`](./.nvmrc) file for the version used in this project.

Run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`](https://github.com/npm/cli) for development without manually migrating.

The [example app](/example/) demonstrates usage of the library. You need to run it to test any changes you make.

It is configured to use the local version of the library, so any changes you make to the library's source code will be reflected in the example app. Changes to the library's JavaScript code will be reflected in the example app without a rebuild, but native code changes will require a rebuild of the example app.

If you want to use Android Studio or Xcode to edit the native code, you can open the `example/android` or `example/ios` directories respectively in those editors. To edit the Objective-C or Swift files, open `example/ios/ReactNativeSocialAuthExample.xcworkspace` in Xcode and find the source files at `Pods > Development Pods > @thoughtbot/react-native-social-auth`.

To edit the Java or Kotlin files, open `example/android` in Android studio and find the source files at `thoughtbot-react-native-social-auth` under `Android`.

You can use various commands from the root directory to work with the project.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS:

```sh
yarn example ios
```

To confirm that the app is running with the new architecture, you can check the Metro logs for a message like this:

```sh
Running "ReactNativeSocialAuthExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

To run the example app on Web:

```sh
yarn example web
```

Make sure your code passes TypeScript:

```sh
yarn typecheck
```

To check for linting errors, run the following:

```sh
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

The test suite covers:

- **JS API tests** (`src/google/__tests__/GoogleSignIn.test.ts`) — the `configure`-then-call contract on the `GoogleSignIn` wrapper, with the native TurboModule mocked.
- **Error tests** (`src/google/__tests__/errors.test.ts`) — `GoogleSignInError`, the `GoogleSignInErrorCode` enum, and the `isGoogleSignInError` type guard.
- **Component tests** (`src/google/__tests__/GoogleSignInButton.test.tsx`) — accessibility labels, `onPress` / `disabled` behavior, and theme/shape/text variants, using [React Native Testing Library](https://callstack.github.io/react-native-testing-library/).
- **Expo config plugin tests** (`plugin/src/__tests__/withSocialAuth.test.ts`) — `Info.plist` URL scheme reversal and `AppDelegate` URL-handler injection, for both Swift and Objective-C fixtures.

`react-native-svg` is mocked via `__mocks__/react-native-svg.js` so the button renders without native bindings during tests.


### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.


### Releasing

Releases are driven by [conventional commits](#commit-message-convention) and shipped from CI — no developer needs npm credentials.

**Trigger a release:**

1. Open the [Actions](../../actions) tab on GitHub.
2. Pick the **Release** workflow.
3. Click **Run workflow** on the `main` branch. Tick **Dry run** first to preview the version bump and changelog without publishing.
4. The job is gated on the `npm-production` GitHub Environment — an approved reviewer must click **Approve and run** before the publish step executes.

**What happens under the hood:**

The workflow runs lint / typecheck / test / build as gates, then invokes [release-it](https://github.com/release-it/release-it) with the angular conventional-changelog preset. release-it walks every commit since the last `v*` tag and decides the bump:

| Commit type            | Bump    |
| ---------------------- | ------- |
| `feat:`                | minor   |
| `fix:`                 | patch   |
| `feat!:` / `BREAKING CHANGE:` | major |
| `chore:`, `docs:`, `style:`, `refactor:`, `test:` | none |

If the bump is non-zero, release-it updates `package.json`, regenerates `CHANGELOG.md`, commits + tags the change, pushes both to `main`, publishes to npm, and creates a matching GitHub Release.

**Authentication:**

The workflow authenticates to npm via [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC), so there is no long-lived `NPM_TOKEN`. The npm registry validates the runner's OIDC token against the trusted-publisher config on the package (repository + workflow filename + environment) before issuing a short-lived publish credential.

**Local fallback:**

`yarn release` still works for local-machine emergencies if CI is unavailable, but it requires the maintainer to be logged into npm with publish access on `@thoughtbot/react-native-social-auth`. Prefer the workflow.


### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn`: setup project by installing dependencies.
- `yarn typecheck`: type-check files with TypeScript.
- `yarn lint`: lint files with [ESLint](https://eslint.org/).
- `yarn test`: run unit + component tests with [Jest](https://jestjs.io/) and [React Native Testing Library](https://callstack.github.io/react-native-testing-library/).
- `yarn prepare`: build the library to `lib/` with [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob) and compile the Expo config plugin to `plugin/build/` (also runs automatically before `npm publish`).
- `yarn build:plugin`: compile only the Expo config plugin (faster than `yarn prepare` when iterating on plugin code).
- `yarn example start`: start the Metro server for the example app.
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.
- `yarn example web`: run the example app on Web.
- `yarn example build:web`: build the example app for Web.


### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
