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
import { validateEmail, validateName, validatePassword } from '../../lib/validation';
import PrimaryButton from '../../components/common/PrimaryButton';
import PasswordInput from '../../components/auth/PasswordInput';
import FormError from '../../components/auth/FormError';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { signUpWithEmail } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  function validateAll(): boolean {
    let valid = true;

    if (!validateName(firstName)) {
      setFirstNameError('First name is required.');
      valid = false;
    } else {
      setFirstNameError(null);
    }

    if (!validateName(lastName)) {
      setLastNameError('Last name is required.');
      valid = false;
    } else {
      setLastNameError(null);
    }

    if (!validateEmail(email)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError(null);
    }

    const pwResult = validatePassword(password);
    if (!pwResult.valid) {
      setPasswordError(pwResult.error);
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  }

  async function handleSubmit() {
    if (!validateAll()) return;
    setFormError(null);
    setIsLoading(true);
    const { error } = await signUpWithEmail({ firstName, lastName, email, password });
    setIsLoading(false);
    if (error) {
      setFormError(error);
    } else {
      navigation.navigate('VerifyEmail', { email });
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join RecipeApp today</Text>

          <GoogleSignInButton style={styles.googleBtn} />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.divider} />
          </View>

          <FormError message={formError} />

          <TextInput
            style={[styles.input, firstNameError ? styles.inputError : null]}
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
            onBlur={() => setFirstNameError(validateName(firstName) ? null : 'First name is required.')}
            autoCapitalize="words"
            placeholderTextColor="#9CA3AF"
          />
          {firstNameError ? <Text style={styles.fieldError}>{firstNameError}</Text> : null}

          <TextInput
            style={[styles.input, lastNameError ? styles.inputError : null]}
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
            onBlur={() => setLastNameError(validateName(lastName) ? null : 'Last name is required.')}
            autoCapitalize="words"
            placeholderTextColor="#9CA3AF"
          />
          {lastNameError ? <Text style={styles.fieldError}>{lastNameError}</Text> : null}

          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setEmailError(validateEmail(email) ? null : 'Enter a valid email address.')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9CA3AF"
          />
          {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

          <PasswordInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => {
              const result = validatePassword(password);
              setPasswordError(result.valid ? null : result.error);
            }}
            error={passwordError}
          />

          <PrimaryButton title="Create account" onPress={handleSubmit} isLoading={isLoading} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
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
    marginBottom: 4,
    width: '100%',
  },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#FF6B35', fontWeight: '600' },
});
