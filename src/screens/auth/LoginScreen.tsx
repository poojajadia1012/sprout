import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../hooks/useAuth';
import PrimaryButton from '../../components/common/PrimaryButton';
import PasswordInput from '../../components/auth/PasswordInput';
import FormError from '../../components/auth/FormError';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    setFormError(null);
    setIsLoading(true);
    const { error } = await signInWithEmail(email, password);
    setIsLoading(false);
    if (error) setFormError(error);
    // On success, RootNavigator re-renders automatically via onAuthStateChange
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <GoogleSignInButton style={styles.googleBtn} />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or sign in with email</Text>
            <View style={styles.divider} />
          </View>

          <FormError message={formError} />

          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9CA3AF"
          />

          <PasswordInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <PrimaryButton title="Sign in" onPress={handleSubmit} isLoading={isLoading} />

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.link}>
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkBold}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24 },
  googleBtn: { marginBottom: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 10, color: '#9CA3AF', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
    width: '100%',
  },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { color: '#FF6B35', fontSize: 14, fontWeight: '500' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#FF6B35', fontWeight: '600' },
});
