import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import HealthProfileStack from './HealthProfileStack';
import LoadingOverlay from '../components/common/LoadingOverlay';

export default function RootNavigator() {
  const { session, dbUser, isLoading } = useAuth();

  // Show a spinner while we're checking if the user is already logged in.
  if (isLoading) return <LoadingOverlay />;

  // No session = not logged in. Show the auth screens (Welcome, Login, SignUp, etc.)
  if (!session) return <AuthStack />;

  // Logged in with email but hasn't verified yet. Send to the verify email screen.
  if (!dbUser?.verified_at && session.user.app_metadata?.provider !== 'google') {
    return (
      <AuthStack
        initialRouteName="VerifyEmail"
        verifyEmail={session.user.email ?? ''}
      />
    );
  }

  // Logged in and verified, but hasn't completed health profile yet.
  // Route them to the onboarding wizard.
  if (dbUser?.status === 'registered') {
    return <HealthProfileStack />;
  }

  // Fully onboarded — show the main app.
  return <AppStack />;
}
