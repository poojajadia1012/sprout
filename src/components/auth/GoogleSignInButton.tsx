import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import GoogleLogo from '../common/GoogleLogo';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../../hooks/useAuth';
import { ENV } from '../../lib/env';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  style?: ViewStyle;
  onError?: (error: string) => void;
};

export default function GoogleSignInButton({ style, onError }: Props) {
  const { handleGoogleSignIn } = useAuth();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: ENV.googleIosClientId,
    webClientId: ENV.googleWebClientId,
  });

  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        setIsLoading(true);
        handleGoogleSignIn(idToken).then(({ error }) => {
          setIsLoading(false);
          if (error && onError) onError(error);
        });
      }
    } else if (response?.type === 'error') {
      setIsLoading(false);
      if (onError) onError('Google sign-in failed. Please try again.');
    }
  }, [response]);

  async function handlePress() {
    setIsLoading(true);
    await promptAsync();
    // isLoading will be reset in the response effect above
  }

  return (
    <TouchableOpacity
      style={[styles.button, (!request || isLoading) && styles.disabled, style]}
      onPress={handlePress}
      disabled={!request || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#1A1A1A" />
      ) : (
        <>
          <GoogleLogo size={20} />
          <Text style={styles.text}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 18,
    backgroundColor: '#fff',
    width: '100%',
    gap: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
});
