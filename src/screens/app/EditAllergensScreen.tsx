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

type Props = NativeStackScreenProps<AppStackParamList, 'EditAllergens'>;

// Must match exactly what AllergiesScreen stores during onboarding
const ALLERGENS = [
  'Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts',
  'Soybeans', 'Dairy', 'Tree nuts', 'Celery', 'Mustard',
  'Sesame', 'Sulphites', 'Lupin', 'Molluscs',
];

export default function EditAllergensScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>(route.params.allergens);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(value: string) {
    setSelected((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error: saveError } = await supabase
      .from('health_profiles')
      .update({ allergens: selected, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>We'll never include these ingredients in your recipes.</Text>
        <View style={styles.chipWrap}>
          {ALLERGENS.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.chip, selected.includes(a) && styles.chipSelected]}
              onPress={() => toggle(a)}
            >
              <Text style={[styles.chipText, selected.includes(a) && styles.chipTextSelected]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.noneButton} onPress={() => setSelected([])}>
          <Text style={styles.noneText}>None — I have no allergies</Text>
        </TouchableOpacity>
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
  noneButton: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  noneText: { fontSize: 15, color: '#6B7280', textDecorationLine: 'underline' },
  saveContainer: { marginTop: 24 },
  error: { color: '#EF4444', fontSize: 14, marginTop: 12, marginBottom: 4 },
});
