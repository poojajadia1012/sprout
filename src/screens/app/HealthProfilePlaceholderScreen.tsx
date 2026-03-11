import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { useAuth } from '../../hooks/useAuth';
import SecondaryButton from '../../components/common/SecondaryButton';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<AppStackParamList, 'HealthProfile'>;

export default function HealthProfilePlaceholderScreen({ navigation }: Props) {
  const { signOut, dbUser } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🥗</Text>
        <Text style={styles.title}>Health Profile Setup</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.body}>
          We're building something great for you. Your personalised health profile will help us
          recommend recipes tailored to your needs.
        </Text>
        {dbUser && (
          <Text style={styles.welcome}>
            Welcome, {dbUser.first_name}!
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <SecondaryButton title="Sign out" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', marginBottom: 6, textAlign: 'center' },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  welcome: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  footer: { paddingBottom: 32, paddingHorizontal: 16, gap: 4 },
});
