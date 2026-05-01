package com.thoughtbot.reactnativesocialauth

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap

class GoogleSignInModule(reactContext: ReactApplicationContext) :
  NativeGoogleSignInSpec(reactContext) {

  override fun configure(config: ReadableMap) {
    // TODO: Phase 3 — Store configuration for Credential Manager
  }

  override fun signIn(promise: Promise) {
    promise.reject("ERR_NOT_IMPLEMENTED", "Google Sign-In is not yet implemented on Android")
  }

  override fun signOut(promise: Promise) {
    promise.reject("ERR_NOT_IMPLEMENTED", "Google Sign-In is not yet implemented on Android")
  }

  override fun getCurrentUser(promise: Promise) {
    promise.reject("ERR_NOT_IMPLEMENTED", "Google Sign-In is not yet implemented on Android")
  }

  override fun revokeAccess(promise: Promise) {
    promise.reject("ERR_NOT_IMPLEMENTED", "Google Sign-In is not yet implemented on Android")
  }

  override fun isSignedIn(): Boolean {
    return false
  }

  companion object {
    const val NAME = NativeGoogleSignInSpec.NAME
  }
}
