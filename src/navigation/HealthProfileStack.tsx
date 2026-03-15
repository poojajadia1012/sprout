import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BasicInfoScreen from '../screens/onboarding/BasicInfoScreen';
import HealthGoalScreen from '../screens/onboarding/HealthGoalScreen';
import DietaryModeScreen from '../screens/onboarding/DietaryModeScreen';
import CuisinePreferencesScreen from '../screens/onboarding/CuisinePreferencesScreen';
import AllergiesScreen from '../screens/onboarding/AllergiesScreen';

export type HealthProfileStackParamList = {
  BasicInfo: undefined;
  HealthGoal: undefined;
  DietaryMode: undefined;
  CuisinePreferences: undefined;
  Allergies: undefined;
};

const Stack = createNativeStackNavigator<HealthProfileStackParamList>();

export default function HealthProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="HealthGoal" component={HealthGoalScreen} />
      <Stack.Screen name="DietaryMode" component={DietaryModeScreen} />
      <Stack.Screen name="CuisinePreferences" component={CuisinePreferencesScreen} />
      <Stack.Screen name="Allergies" component={AllergiesScreen} />
    </Stack.Navigator>
  );
}
