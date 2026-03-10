import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AppStackParamList, 'EditHealthProfile'>;

const HEALTH_GOAL_LABELS: Record<string, string> = {
  eat_healthier:   'Eat healthier',
  weight_loss:     'Lose weight',
  muscle_gain:     'Build muscle',
  maintain_weight: 'Maintain weight',
  recomposition:   'Lose fat & build muscle',
};

const CUISINE_LABELS: Record<string, string> = {
  italian: 'Italian', indian: 'Indian', mexican: 'Mexican',
  chinese: 'Chinese', japanese: 'Japanese', thai: 'Thai',
  mediterranean: 'Mediterranean', american: 'American',
  french: 'French', middle_eastern: 'Middle Eastern',
};

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54;
  return { feet: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
}
function kgToLbs(kg: number) { return Math.round(kg * 2.20462); }

export default function EditHealthProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  // Reload every time this screen comes back into focus (e.g. after saving a sub-screen)
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (active) { setProfile(data ?? null); setLoading(false); }
        });
      return () => { active = false; };
    }, [user])
  );

  function basicSummary() {
    if (!profile) return '';
    if (profile.unit_preference === 'imperial') {
      const { feet, inches } = cmToFtIn(profile.height_cm);
      return `${feet}′${inches}″  ·  ${kgToLbs(profile.weight_kg)} lbs`;
    }
    return `${profile.height_cm} cm  ·  ${profile.weight_kg} kg`;
  }

  function cuisineSummary() {
    const list: string[] = profile?.cuisine_preferences ?? [];
    if (list.length === 0) return 'No preference';
    const labels = list.map((v) => CUISINE_LABELS[v] ?? v);
    if (labels.length <= 2) return labels.join(', ');
    return `${labels[0]}, ${labels[1]} +${labels.length - 2} more`;
  }

  function allergenSummary() {
    const list: string[] = profile?.allergens ?? [];
    if (list.length === 0) return 'None';
    return list.length === 1 ? list[0] : `${list[0]} +${list.length - 1} more`;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const rows: { title: string; summary: string; onPress: () => void }[] = [
    {
      title: 'Basic info',
      summary: basicSummary(),
      onPress: () => navigation.navigate('EditBasicInfo', {
        unit_preference: profile?.unit_preference ?? 'metric',
        date_of_birth:   profile?.date_of_birth ?? '',
        biological_sex:  profile?.biological_sex ?? '',
        height_cm:       profile?.height_cm ?? 0,
        weight_kg:       profile?.weight_kg ?? 0,
        health_goal:     profile?.health_goal ?? 'eat_healthier',
      }),
    },
    {
      title: 'Health goal',
      summary: HEALTH_GOAL_LABELS[profile?.health_goal ?? ''] ?? '—',
      onPress: () => navigation.navigate('EditHealthGoal', {
        health_goal:    profile?.health_goal ?? 'eat_healthier',
        date_of_birth:  profile?.date_of_birth ?? '',
        biological_sex: profile?.biological_sex ?? '',
        height_cm:      profile?.height_cm ?? 0,
        weight_kg:      profile?.weight_kg ?? 0,
      }),
    },
    {
      title: 'Dietary mode',
      summary: profile?.is_vegan ? 'Vegan' : 'Vegetarian',
      onPress: () => navigation.navigate('EditDietaryMode', {
        is_vegan: profile?.is_vegan ?? false,
      }),
    },
    {
      title: 'Cuisine preferences',
      summary: cuisineSummary(),
      onPress: () => navigation.navigate('EditCuisinePreferences', {
        cuisine_preferences: profile?.cuisine_preferences ?? [],
      }),
    },
    {
      title: 'Allergies & avoidances',
      summary: allergenSummary(),
      onPress: () => navigation.navigate('EditAllergens', {
        allergens: profile?.allergens ?? [],
      }),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {rows.map((row, index) => (
            <TouchableOpacity
              key={row.title}
              style={[styles.row, index === 0 && styles.rowFirst]}
              onPress={row.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowSummary} numberOfLines={1}>{row.summary}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  rowFirst: { borderTopWidth: 0 },
  rowContent: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  rowSummary: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  chevron: { fontSize: 20, color: '#9CA3AF' },
});
