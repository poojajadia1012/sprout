import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/app/HomeScreen';
import SearchScreen from '../screens/app/SearchScreen';
import SavedScreen from '../screens/app/SavedScreen';
import SettingsScreen from '../screens/app/SettingsScreen';

export type AppTabsParamList = {
  Home: undefined;
  Search: undefined;
  Saved: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { focused: string; unfocused: string }> = {
            Home:    { focused: 'home',          unfocused: 'home-outline' },
            Search:  { focused: 'search',        unfocused: 'search-outline' },
            Saved:   { focused: 'bookmark',      unfocused: 'bookmark-outline' },
            Profile: { focused: 'person',        unfocused: 'person-outline' },
          };
          const icon = icons[route.name];
          return (
            <Ionicons
              name={(focused ? icon.focused : icon.unfocused) as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}     options={{ title: 'Home' }} />
      <Tab.Screen name="Search"  component={SearchScreen}   options={{ title: 'Search' }} />
      <Tab.Screen name="Saved"   component={SavedScreen}    options={{ title: 'Saved' }} />
      <Tab.Screen name="Profile" component={SettingsScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
