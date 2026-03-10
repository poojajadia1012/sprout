import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<AppStackParamList, 'EditCuisinePreferences'>;

const CUISINES = [
  { value: 'italian',        label: '🇮🇹 Italian' },
  { value: 'indian',         label: '🇮🇳 Indian' },
  { value: 'mexican',        label: '🇲🇽 Mexican' },
  { value: 'chinese',        label: '🇨🇳 Chinese' },
  { value: 'japanese',       label: '🇯🇵 Japanese' },
  { value: 'thai',           label: '🇹🇭 Thai' },
  { value: 'mediterranean',  label: '🫒 Mediterranean' },
  { value: 'american',       label: '🇺🇸 American' },
  { value: 'french',         label: '🇫🇷 French' },
  { value: 'middle_eastern', label: '🧆 Middle Eastern' },
];

export default function EditCuisinePreferencesScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>(route.params.cuisine_preferences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(value: string) {
    if (value === 'none') { setSelected([]); return; }
    setSelected((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error: saveError } = await supabase
      .from('health_profiles')
      .update({ cuisine_preferences: selected, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>Select the cuisines you enjoy most. We'll prioritise these when suggesting recipes.</Text>
        <View style={styles.chipWrap}>
          {CUISINES.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.chip, selected.includes(c.value) && styles.chipSelected]}
              onPress={() => toggle(c.value)}
            >
              <Text style={[styles.chipText, selected.includes(c.value) && styles.chipTextSelected]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.chip, selected.length === 0 && styles.chipSelected]}
            onPress={() => toggle('none')}
          >
            <Text style={[styles.chipText, selected.length === 0 && styles.chipTextSelected]}>
              No preference — surprise me
            </Text>
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.saveContainer}>
          <PrimaryButton title="Save" onPress={handleSave} isLoading={saving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22, marginBottom: 24 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' },
  chipSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  saveContainer: { marginTop: 32 },
  error: { color: '#EF4444', fontSize: 14, marginTop: 12, marginBottom: 4 },
});
