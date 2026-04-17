package com.thoughtbot.reactnativesocialauth

import com.facebook.react.bridge.ReactApplicationContext

class ReactNativeSocialAuthModule(reactContext: ReactApplicationContext) :
  NativeReactNativeSocialAuthSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeReactNativeSocialAuthSpec.NAME
  }
}
