import { describe, expect, it } from '@jest/globals';
import {
  injectObjCURLHandler,
  injectSwiftURLHandler,
  reverseClientId,
} from '../withSocialAuth';

describe('reverseClientId', () => {
  it('reverses a valid iOS client ID', () => {
    expect(reverseClientId('123456-abc.apps.googleusercontent.com')).toBe(
      'com.googleusercontent.apps.123456-abc'
    );
  });

  it('throws on a Web client ID (missing iOS suffix)', () => {
    expect(() => reverseClientId('123456-xyz.example.com')).toThrow(
      /must end with "\.apps\.googleusercontent\.com"/
    );
  });

  it('throws on an empty string', () => {
    expect(() => reverseClientId('')).toThrow();
  });
});

const SWIFT_FIXTURE = `import Expo
import ExpoModulesCore

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: ...
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
`;

describe('injectSwiftURLHandler', () => {
  it('adds the import and URL handler override', () => {
    const out = injectSwiftURLHandler(SWIFT_FIXTURE);
    expect(out).toContain('import react_native_social_auth');
    expect(out).toContain('GoogleSignIn.handleURL(url)');
    expect(out).toContain(
      'public override func application(\n    _ app: UIApplication'
    );
  });

  it('places the override inside the AppDelegate class (before the closing brace)', () => {
    const out = injectSwiftURLHandler(SWIFT_FIXTURE);
    const handlerIndex = out.indexOf('GoogleSignIn.handleURL');
    const lastBraceIndex = out.lastIndexOf('}');
    expect(handlerIndex).toBeLessThan(lastBraceIndex);
  });

  it('throws if the closing brace cannot be located', () => {
    expect(() => injectSwiftURLHandler('// no class here')).toThrow(
      /closing brace/
    );
  });
});

const OBJC_FIXTURE = `#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

@end
`;

describe('injectObjCURLHandler', () => {
  it('adds the import and openURL method', () => {
    const out = injectObjCURLHandler(OBJC_FIXTURE);
    expect(out).toContain('#import <react_native_social_auth/GoogleSignIn.h>');
    expect(out).toContain('[GoogleSignIn handleURL:url]');
    expect(out).toContain(
      '- (BOOL)application:(UIApplication *)application\n            openURL:(NSURL *)url'
    );
  });

  it('places the method before @end', () => {
    const out = injectObjCURLHandler(OBJC_FIXTURE);
    const handlerIndex = out.indexOf('[GoogleSignIn handleURL:url]');
    const endIndex = out.lastIndexOf('@end');
    expect(handlerIndex).toBeLessThan(endIndex);
  });

  it('throws if @end is missing', () => {
    expect(() => injectObjCURLHandler('// no class here')).toThrow(/@end/);
  });
});
