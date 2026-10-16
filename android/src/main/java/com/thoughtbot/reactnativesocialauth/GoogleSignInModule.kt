package com.thoughtbot.reactnativesocialauth

import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class GoogleSignInModule(reactContext: ReactApplicationContext) :
  NativeGoogleSignInSpec(reactContext) {

  private val credentialManager: CredentialManager =
    CredentialManager.create(reactContext)

  private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

  private var webClientId: String? = null
  private var nonce: String? = null
  private var autoSelect: Boolean? = null
  private var filterByAuthorizedAccounts: Boolean? = null
  private var currentUser: GoogleIdTokenCredential? = null

  override fun configure(config: ReadableMap) {
    webClientId = config.getString("webClientId")
    nonce = if (config.hasKey("nonce")) config.getString("nonce") else null
    autoSelect = if (config.hasKey("autoSelect") && !config.isNull("autoSelect")) config.getBoolean("autoSelect") else null
    filterByAuthorizedAccounts =
      if (config.hasKey("filterByAuthorizedAccounts") &&
          !config.isNull("filterByAuthorizedAccounts")) {
        config.getBoolean("filterByAuthorizedAccounts")
      } else null
  }

  override fun signIn(promise: Promise) {
    val clientId = webClientId
    if (clientId == null) {
      promise.reject("ERR_NOT_CONFIGURED", "GoogleSignIn.configure() must be called before signIn()")
      return
    }

    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("ERR_NO_ACTIVITY", "No current activity available")
      return
    }

    scope.launch {
      try {
        val result = getCredentialWithAutoSignIn(clientId, activity)
        handleSignInResult(result, promise)
      } catch (e: GetCredentialCancellationException) {
        promise.reject("SIGN_IN_CANCELLED", "User cancelled the sign-in flow", e)
      } catch (e: NoCredentialException) {
        promise.reject("NO_CREDENTIALS", "No credentials available on this device", e)
      } catch (e: GetCredentialException) {
        promise.reject("SIGN_IN_FAILED", e.message, e)
      }
    }
  }

  private suspend fun getCredentialWithAutoSignIn(
    clientId: String,
    activity: android.app.Activity
  ): GetCredentialResponse {
    if (autoSelect != null || filterByAuthorizedAccounts != null) {
      // Developer explicitly configured at least one option.
      // Respect the configured values without the existing fallback.
      return buildCredential(clientId, activity, autoSelect ?: false, filterByAuthorizedAccounts ?: false)
    }

    return try {
      buildCredential(clientId, activity, true, true)
    } catch (e: NoCredentialException) {
      buildCredential(clientId, activity, false, false)
    }
  }

  private suspend fun buildCredential(
    clientId: String,
    activity: android.app.Activity,
    autoSelect: Boolean,
    filterAuthorized: Boolean
  ): GetCredentialResponse {
    val signInOption = GetGoogleIdOption.Builder()
      .setFilterByAuthorizedAccounts(filterAuthorized)
      .setServerClientId(clientId)
      .setAutoSelectEnabled(autoSelect)
      .apply { nonce?.let { setNonce(it) } }
      .build()

    val signInRequest = GetCredentialRequest.Builder()
      .addCredentialOption(signInOption)
      .build()

    return credentialManager.getCredential(activity, signInRequest)
  }

  private fun handleSignInResult(result: GetCredentialResponse, promise: Promise) {
    val credential = result.credential

    if (credential !is CustomCredential ||
        credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
      promise.reject("SIGN_IN_FAILED", "Unexpected credential type: ${credential.type}")
      return
    }

    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
    currentUser = googleIdTokenCredential

    val userMap = Arguments.createMap().apply {
      putString("id", googleIdTokenCredential.id)
      putString("email", googleIdTokenCredential.id)
      putString("displayName", googleIdTokenCredential.displayName)
      putString("givenName", googleIdTokenCredential.givenName)
      putString("familyName", googleIdTokenCredential.familyName)
      putString("photoUrl", googleIdTokenCredential.profilePictureUri?.toString())
    }

    val resultMap = Arguments.createMap().apply {
      putString("idToken", googleIdTokenCredential.idToken)
      putNull("accessToken")
      putNull("serverAuthCode")
      putMap("user", userMap)
    }

    promise.resolve(resultMap)
  }

  override fun signOut(promise: Promise) {
    scope.launch {
      try {
        credentialManager.clearCredentialState(ClearCredentialStateRequest())
        currentUser = null
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("SIGN_OUT_FAILED", e.message, e)
      }
    }
  }

  override fun getCurrentUser(promise: Promise) {
    val user = currentUser
    if (user == null) {
      promise.resolve(null)
      return
    }

    val userMap = Arguments.createMap().apply {
      putString("id", user.id)
      putString("email", user.id)
      putString("displayName", user.displayName)
      putString("givenName", user.givenName)
      putString("familyName", user.familyName)
      putString("photoUrl", user.profilePictureUri?.toString())
    }

    promise.resolve(userMap)
  }

  override fun revokeAccess(promise: Promise) {
    scope.launch {
      try {
        credentialManager.clearCredentialState(ClearCredentialStateRequest())
        currentUser = null
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("REVOKE_FAILED", e.message, e)
      }
    }
  }

  override fun isSignedIn(): Boolean {
    return currentUser != null
  }

  override fun invalidate() {
    scope.cancel()
    super.invalidate()
  }

  companion object {
    const val NAME = NativeGoogleSignInSpec.NAME
  }
}
