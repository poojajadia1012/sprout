import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { validatePassword } from '../../lib/validation';
import PrimaryButton from '../../components/common/PrimaryButton';
import PasswordInput from '../../components/auth/PasswordInput';
import FormError from '../../components/auth/FormError';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { token_hash } = route.params ?? {};
  const { resetPassword, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token_hash) {
      setTokenError(true);
      return;
    }
    // Exchange the recovery token for a session
    supabase.auth.verifyOtp({ token_hash, type: 'recovery' }).then(({ error }) => {
      if (error) setTokenError(true);
    });
  }, [token_hash]);

  async function handleSubmit() {
    const pwResult = validatePassword(password);
    if (!pwResult.valid) {
      setPasswordError(pwResult.error);
      return;
    }
    setPasswordError(null);

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      return;
    }
    setConfirmError(null);
    setFormError(null);

    setIsLoading(true);
    const { error } = await resetPassword(password);
    setIsLoading(false);

    if (error) {
      setFormError(error);
    } else {
      await signOut();
      navigation.navigate('Login');
    }
  }

  if (tokenError) {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.container}>
          <Text style={styles.title}>Link expired</Text>
          <Text style={styles.subtitle}>
            This password reset link is invalid or has expired.
          </Text>
          <PrimaryButton
            title="Request a new link"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.back}>
          <Text style={styles.backText}>← Back to sign in</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView style={styles.container}>
          <Text style={styles.title}>New password</Text>
          <Text style={styles.subtitle}>Choose a strong password for your account.</Text>

          <FormError message={formError} />

          <PasswordInput
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => {
              const r = validatePassword(password);
              setPasswordError(r.valid ? null : r.error);
            }}
            error={passwordError}
          />

          <PasswordInput
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => setConfirmError(password !== confirmPassword ? 'Passwords do not match.' : null)}
            error={confirmError}
          />

          <PrimaryButton title="Set new password" onPress={handleSubmit} isLoading={isLoading} />
        </KeyboardAvoidingView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  back: { paddingHorizontal: 24, paddingTop: 16 },
  backText: { color: '#FF6B35', fontSize: 16, fontWeight: '500' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24, lineHeight: 22 },
});
