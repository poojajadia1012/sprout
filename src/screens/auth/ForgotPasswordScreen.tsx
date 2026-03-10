import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../hooks/useAuth';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { sendPasswordResetEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) return;
    setIsLoading(true);
    await sendPasswordResetEmail(email.trim());
    setIsLoading(false);
    setSubmitted(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView style={styles.container}>
          <Text style={styles.title}>Reset password</Text>

          {submitted ? (
            <>
              <Text style={styles.successText}>
                If that email is registered, you'll receive a reset link shortly.
              </Text>
              <PrimaryButton title="Back to sign in" onPress={() => navigation.navigate('Login')} />
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a reset link.
              </Text>
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
              <PrimaryButton
                title="Send reset link"
                onPress={handleSubmit}
                isLoading={isLoading}
                disabled={!email.trim()}
              />
            </>
          )}
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
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
    width: '100%',
  },
  successText: {
    fontSize: 15,
    color: '#16A34A',
    marginBottom: 24,
    lineHeight: 22,
  },
});
