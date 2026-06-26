import {
  createRunOncePlugin,
  withAppDelegate,
  withInfoPlist,
} from '@expo/config-plugins';
import type { ConfigPlugin } from '@expo/config-plugins';

const pkg = require('../../package.json');

export type SocialAuthPluginProps = {
  /**
   * The OAuth 2.0 iOS application client ID from Google Cloud Console
   * (format: `*.apps.googleusercontent.com`). Required to register the
   * URL scheme that GoogleSignIn-iOS uses for its OAuth callback.
   *
   * Omit for Android-only setups — the plugin becomes a no-op on iOS.
   */
  iosClientId?: string;
};

const PLUGIN_NAME = '@thoughtbot/react-native-social-auth';
const MARKER = '/* @thoughtbot/react-native-social-auth: URL handler */';

/**
 * Compute the reversed iOS Client ID that GoogleSignIn-iOS expects as a
 * `CFBundleURLSchemes` entry.
 *
 * Example:
 *   `123-abc.apps.googleusercontent.com`
 *     → `com.googleusercontent.apps.123-abc`
 */
/** @internal — exported for tests only. */
export function reverseClientId(iosClientId: string): string {
  const suffix = '.apps.googleusercontent.com';
  if (!iosClientId.endsWith(suffix)) {
    throw new Error(
      `[${PLUGIN_NAME}] iosClientId must end with "${suffix}". Received: "${iosClientId}".`
    );
  }
  const id = iosClientId.slice(0, -suffix.length);
  return `com.googleusercontent.apps.${id}`;
}

const withGoogleSignInURLScheme: ConfigPlugin<{ reversedClientId: string }> = (
  config,
  { reversedClientId }
) => {
  return withInfoPlist(config, (config) => {
    const urlTypes = (config.modResults.CFBundleURLTypes ??= []);
    const alreadyRegistered = urlTypes.some((entry) =>
      (entry.CFBundleURLSchemes ?? []).includes(reversedClientId)
    );
    if (!alreadyRegistered) {
      urlTypes.push({
        CFBundleURLSchemes: [reversedClientId],
      });
    }
    return config;
  });
};

const withGoogleSignInAppDelegate: ConfigPlugin = (config) => {
  return withAppDelegate(config, (config) => {
    const { language, contents } = config.modResults;

    if (contents.includes(MARKER)) {
      return config;
    }

    if (language === 'swift') {
      config.modResults.contents = injectSwiftURLHandler(contents);
    } else if (language === 'objcpp' || language === 'objc') {
      config.modResults.contents = injectObjCURLHandler(contents);
    } else {
      throw new Error(
        `[${PLUGIN_NAME}] Unknown AppDelegate language "${language}". Expected "swift" or "objcpp".`
      );
    }
    return config;
  });
};

/** @internal — exported for tests only. */
export function injectSwiftURLHandler(contents: string): string {
  const snippet = `
  ${MARKER}
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    if GoogleSignIn.handleURL(url) { return true }
    return super.application(app, open: url, options: options)
  }
`;

  const importLine = 'import react_native_social_auth';
  let next = contents;
  if (!next.includes(importLine)) {
    next = next.replace(
      /(import ExpoModulesCore|import React|import Expo)/,
      `$1\n${importLine}`
    );
  }

  // Inject the override before the closing brace of the AppDelegate class.
  const classCloseRegex = /\n\}\s*$/;
  if (!classCloseRegex.test(next)) {
    throw new Error(
      `[${PLUGIN_NAME}] Could not locate the AppDelegate class closing brace.`
    );
  }
  return next.replace(classCloseRegex, `\n${snippet}}\n`);
}

/** @internal — exported for tests only. */
export function injectObjCURLHandler(contents: string): string {
  const snippet = `
${MARKER}
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
  if ([GoogleSignIn handleURL:url]) { return YES; }
  return [super application:application openURL:url options:options];
}
`;

  const importLine = '#import <react_native_social_auth/GoogleSignIn.h>';
  let next = contents;
  if (!next.includes(importLine)) {
    next = next.replace(/(#import "AppDelegate\.h")/, `$1\n${importLine}`);
  }

  const endRegex = /\n@end\s*$/;
  if (!endRegex.test(next)) {
    throw new Error(
      `[${PLUGIN_NAME}] Could not locate the AppDelegate's @end directive.`
    );
  }
  return next.replace(endRegex, `\n${snippet}\n@end\n`);
}

const withSocialAuth: ConfigPlugin<SocialAuthPluginProps | void> = (
  config,
  props
) => {
  const iosClientId = props?.iosClientId;

  if (!iosClientId) {
    console.warn(
      `[${PLUGIN_NAME}] No iosClientId provided — skipping iOS configuration. ` +
        'Android consumers can ignore this warning; iOS consumers must pass ' +
        '{ iosClientId } in their app config plugin entry.'
    );
    return config;
  }

  const reversedClientId = reverseClientId(iosClientId);

  config = withGoogleSignInURLScheme(config, { reversedClientId });
  config = withGoogleSignInAppDelegate(config);

  return config;
};

export default createRunOncePlugin(withSocialAuth, PLUGIN_NAME, pkg.version);
