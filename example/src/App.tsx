import { Text, View, StyleSheet } from 'react-native';
import {
  GoogleSignIn,
  GoogleSignInButton,
} from '@thoughtbot/react-native-social-auth';

export default function App() {
  const handleSignIn = async () => {
    try {
      GoogleSignIn.configure({
        webClientId: 'YOUR_WEB_CLIENT_ID',
      });
      const credential = await GoogleSignIn.signIn();
      console.log('Signed in:', credential.user.email);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social Auth Example</Text>
      <GoogleSignInButton onPress={handleSignIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});
