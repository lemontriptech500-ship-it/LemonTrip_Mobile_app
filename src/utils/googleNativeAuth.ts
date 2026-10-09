// Native (Android / iOS) Google Sign-In. Returns a Google ID token that the
// backend verifies at POST /api/auth/google. Web uses expo-auth-session instead.

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

let configured = false;

function nativeGoogle(): GoogleSignInModule {
  try {
    return require('@react-native-google-signin/google-signin');
  } catch {
    throw new Error('Google sign-in needs a development build with @react-native-google-signin/google-signin installed. It does not run in Expo Go.');
  }
}

function configure(mod: GoogleSignInModule) {
  if (configured) return;
  mod.GoogleSignin.configure({
    // The WEB client ID is required on both platforms: it becomes the `aud` of the ID token,
    // and it must be listed in the backend's GOOGLE_CLIENT_ID / GOOGLE_CLIENT_IDS.
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim(),
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim(),
    scopes: ['profile', 'email'],
    offlineAccess: false,
  });
  configured = true;
}

/** Resolves to an ID token, or null if the user cancelled / a sign-in is already running. */
export async function getGoogleIdToken(): Promise<string | null> {
  const mod = nativeGoogle();
  configure(mod);
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = mod;
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    if (!isSuccessResponse(result)) return null; // user dismissed the account picker
    const idToken = result.data.idToken;
    if (!idToken) throw new Error('Google did not return an identity token. Please try again.');
    return idToken;
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS) return null;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) throw new Error('Google Play Services is missing or out of date on this device.');
      // Android "DEVELOPER_ERROR" (code 10) shows up as a generic error: SHA-1 / package name / client ID mismatch.
      throw new Error('Google sign-in could not be completed. Check the OAuth client IDs, package name and SHA-1 fingerprint.');
    }
    throw error;
  }
}

/** Clears the cached Google account so the next sign-in shows the account picker. */
export async function signOutGoogleUser() {
  try {
    const { GoogleSignin } = nativeGoogle();
    await GoogleSignin.signOut();
  } catch {
    // Not signed in with Google, or the native module isn't available (web / Expo Go).
  }
}