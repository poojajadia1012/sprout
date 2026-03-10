import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HealthProfilePlaceholderScreen from '../screens/app/HealthProfilePlaceholderScreen';
import SettingsScreen from '../screens/app/SettingsScreen';

export type AppStackParamList = {
  HealthProfile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HealthProfile"
        component={HealthProfilePlaceholderScreen}
        options={{ title: 'RecipeApp', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
