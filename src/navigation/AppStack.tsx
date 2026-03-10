import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HealthProfilePlaceholderScreen from '../screens/app/HealthProfilePlaceholderScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import EditHealthProfileScreen from '../screens/app/EditHealthProfileScreen';

export type AppStackParamList = {
  HealthProfile: undefined;
  Settings: undefined;
  EditHealthProfile: undefined;
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
      <Stack.Screen
        name="EditHealthProfile"
        component={EditHealthProfileScreen}
        options={{ title: 'Health Profile' }}
      />
    </Stack.Navigator>
  );
}
