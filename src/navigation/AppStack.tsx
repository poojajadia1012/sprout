import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HealthProfilePlaceholderScreen from '../screens/app/HealthProfilePlaceholderScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import EditHealthProfileScreen from '../screens/app/EditHealthProfileScreen';
import EditBasicInfoScreen from '../screens/app/EditBasicInfoScreen';
import EditHealthGoalScreen from '../screens/app/EditHealthGoalScreen';
import EditDietaryModeScreen from '../screens/app/EditDietaryModeScreen';
import EditCuisinePreferencesScreen from '../screens/app/EditCuisinePreferencesScreen';
import EditAllergensScreen from '../screens/app/EditAllergensScreen';

export type AppStackParamList = {
  HealthProfile: undefined;
  Settings: undefined;
  EditHealthProfile: undefined;
  EditBasicInfo: {
    unit_preference: string;
    date_of_birth: string;
    biological_sex: string;
    height_cm: number;
    weight_kg: number;
    health_goal: string; // needed to recalculate calories on save
  };
  EditHealthGoal: {
    health_goal: string;
    date_of_birth: string;
    biological_sex: string;
    height_cm: number;
    weight_kg: number;
  };
  EditDietaryMode: {
    is_vegan: boolean;
  };
  EditCuisinePreferences: {
    cuisine_preferences: string[];
  };
  EditAllergens: {
    allergens: string[];
  };
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
      <Stack.Screen
        name="EditBasicInfo"
        component={EditBasicInfoScreen}
        options={{ title: 'Basic Info' }}
      />
      <Stack.Screen
        name="EditHealthGoal"
        component={EditHealthGoalScreen}
        options={{ title: 'Health Goal' }}
      />
      <Stack.Screen
        name="EditDietaryMode"
        component={EditDietaryModeScreen}
        options={{ title: 'Dietary Mode' }}
      />
      <Stack.Screen
        name="EditCuisinePreferences"
        component={EditCuisinePreferencesScreen}
        options={{ title: 'Cuisine Preferences' }}
      />
      <Stack.Screen
        name="EditAllergens"
        component={EditAllergensScreen}
        options={{ title: 'Allergies & Avoidances' }}
      />
    </Stack.Navigator>
  );
}
