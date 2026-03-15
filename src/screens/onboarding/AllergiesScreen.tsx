import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HealthProfileStackParamList } from '../../navigation/HealthProfileStack';
import { useHealthProfile } from '../../context/HealthProfileContext';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<HealthProfileStackParamList, 'Allergies'>;

const ALLERGENS = [
  'Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts',
  'Soybeans', 'Dairy', 'Tree nuts', 'Celery', 'Mustard',
  'Sesame', 'Sulphites', 'Lupin', 'Molluscs',
];

export default function AllergiesScreen({ navigation }: Props) {
  const { draft, updateDraft, saveProfile } = useHealthProfile();
  const [selected, setSelected] = useState<string[]>(draft.allergens);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAllergen(allergen: string) {
    setSelected((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  }

  async function handleFinish() {
    setIsSaving(true);
    setError(null);

    // Pass allergens as an override so saveProfile reads the current selection
    // directly — avoids a React setState race where draft.allergens is still stale.
    const result = await saveProfile({ allergens: selected });

    setIsSaving(false);
    if (result.error) setError(result.error);
    // No navigation needed on success — RootNavigator handles it
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.step}>Step 5 of 5</Text>
        <Text style={styles.title}>Allergies</Text>
        <Text style={styles.subtitle}>
          Select anything you're allergic to or want to avoid. We'll never include these in your
          recipes. This step is optional — skip it if you have no allergies.
        </Text>

        <View style={styles.chips}>
          {ALLERGENS.map((allergen) => {
            const isSelected = selected.includes(allergen);
            return (
              <TouchableOpacity
                key={allergen}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleAllergen(allergen)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {allergen}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected.length > 0 && (
          <Text style={styles.selectedCount}>
            {selected.length} allergen{selected.length > 1 ? 's' : ''} selected
          </Text>
        )}

        <TouchableOpacity style={styles.noneButton} onPress={() => setSelected([])}>
          <Text style={styles.noneText}>None — I have no allergies</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        {isSaving ? (
          <ActivityIndicator size="large" color="#FF6B35" style={styles.spinner} />
        ) : (
          <PrimaryButton title="Finish" onPress={handleFinish} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  step: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  chipSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  selectedCount: { fontSize: 13, color: '#FF6B35', fontWeight: '600', marginBottom: 16 },
  noneButton: { paddingVertical: 14, alignItems: 'center', marginBottom: 24 },
  noneText: { fontSize: 15, color: '#6B7280', textDecorationLine: 'underline' },
  error: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
  spinner: { marginTop: 12 },
});
