import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  GoogleSignIn,
  GoogleSignInButton,
  isGoogleSignInError,
  GoogleSignInErrorCode,
  type GoogleUser,
} from '@thoughtbot/react-native-social-auth';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);

  const handleSignIn = async () => {
    if (!WEB_CLIENT_ID) {
      Alert.alert(
        'Missing config',
        'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in example/.env'
      );
      return;
    }
    try {
      GoogleSignIn.configure({
        webClientId: WEB_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
      });
      const credential = await GoogleSignIn.signIn();
      setUser(credential.user);
    } catch (error) {
      if (isGoogleSignInError(error)) {
        switch (error.code) {
          case GoogleSignInErrorCode.SIGN_IN_CANCELLED:
            break;
          case GoogleSignInErrorCode.NO_CREDENTIALS:
            Alert.alert(
              'No Credentials',
              'No Google accounts found on this device.'
            );
            break;
          case GoogleSignInErrorCode.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services is not available.');
            break;
          default:
            Alert.alert('Sign In Failed', error.message);
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignIn.signOut();
      setUser(null);
    } catch (e) {
      console.error('Sign out error:', e);
      Alert.alert('Error', 'Sign out failed.');
    }
  };

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.profile}>
          <Text style={styles.heading}>Welcome</Text>
          <Text style={styles.name}>{user.displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <GoogleSignInButton
            theme="dark"
            text="signin"
            onPress={handleSignOut}
            style={styles.signOutButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Social Auth Example</Text>

        <Text style={styles.sectionTitle}>Light Theme</Text>
        <View style={styles.row}>
          <GoogleSignInButton
            theme="light"
            text="signin"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="light"
            text="signup"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="light"
            text="continue"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="light"
            size="icon"
            onPress={handleSignIn}
          />
        </View>

        <Text style={styles.sectionTitle}>Dark Theme</Text>
        <View style={styles.row}>
          <GoogleSignInButton
            theme="dark"
            text="signin"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="dark"
            text="signup"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="dark"
            text="continue"
            onPress={handleSignIn}
          />
          <GoogleSignInButton theme="dark" size="icon" onPress={handleSignIn} />
        </View>

        <Text style={styles.sectionTitle}>Neutral Theme</Text>
        <View style={styles.row}>
          <GoogleSignInButton
            theme="neutral"
            text="signin"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="neutral"
            text="signup"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="neutral"
            text="continue"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="neutral"
            size="icon"
            onPress={handleSignIn}
          />
        </View>

        <Text style={styles.sectionTitle}>Square Shape</Text>
        <View style={styles.row}>
          <GoogleSignInButton
            theme="light"
            shape="square"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="dark"
            shape="square"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="neutral"
            shape="square"
            onPress={handleSignIn}
          />
          <GoogleSignInButton
            theme="light"
            shape="square"
            size="icon"
            onPress={handleSignIn}
          />
        </View>

        <Text style={styles.sectionTitle}>Disabled State</Text>
        <View style={styles.row}>
          <GoogleSignInButton theme="light" disabled />
          <GoogleSignInButton theme="dark" disabled />
          <GoogleSignInButton theme="neutral" disabled />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scroll: {
    padding: 24,
    gap: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  row: {
    gap: 10,
  },
  profile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    marginTop: 16,
  },
});
