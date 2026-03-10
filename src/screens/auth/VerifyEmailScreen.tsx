import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../hooks/useAuth';
import PrimaryButton from '../../components/common/PrimaryButton';
import FormError from '../../components/auth/FormError';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

const RESEND_COOLDOWN = 60;

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const { resendVerificationEmail } = useAuth();

  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    setResendError(null);
    setResendSuccess(false);
    setIsLoading(true);
    const { error } = await resendVerificationEmail(email);
    setIsLoading(false);
    if (error) {
      setResendError('Failed to resend. Please try again.');
    } else {
      setResendSuccess(true);
      setCooldown(RESEND_COOLDOWN);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.body}>
          We sent a verification link to
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.body}>
          Tap the link in the email to verify your account and get started.
        </Text>

        {resendSuccess && (
          <Text style={styles.successText}>Verification email resent!</Text>
        )}
        <FormError message={resendError} />

        <PrimaryButton
          title={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
          onPress={handleResend}
          isLoading={isLoading}
          disabled={cooldown > 0}
          style={styles.resendBtn}
        />

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.link}>
          <Text style={styles.linkText}>Wrong email? Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 56, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  email: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginVertical: 6, textAlign: 'center' },
  successText: { color: '#16A34A', fontSize: 14, marginBottom: 8 },
  resendBtn: { marginTop: 24 },
  link: { marginTop: 16 },
  linkText: { color: '#FF6B35', fontSize: 14, fontWeight: '500' },
});
