import 'react-native-url-polyfill/auto';
import { enableScreens } from 'react-native-screens';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { HealthProfileProvider } from './context/HealthProfileContext';
import RootNavigator from './navigation/RootNavigator';
import { linkingConfig, useDeepLink } from './hooks/useDeepLink';

enableScreens();

function AppContent() {
  useDeepLink();
  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HealthProfileProvider>
        <NavigationContainer linking={linkingConfig}>
          <AppContent />
        </NavigationContainer>
      </HealthProfileProvider>
    </AuthProvider>
  );
}
