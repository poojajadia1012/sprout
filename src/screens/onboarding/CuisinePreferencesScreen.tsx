import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HealthProfileStackParamList } from '../../navigation/HealthProfileStack';
import { useHealthProfile } from '../../context/HealthProfileContext';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<HealthProfileStackParamList, 'CuisinePreferences'>;

const CUISINES = [
  { label: 'Indian',        emoji: '🇮🇳' },
  { label: 'Mediterranean', emoji: '🫒' },
  { label: 'Italian',       emoji: '🇮🇹' },
  { label: 'Mexican',       emoji: '🌮' },
  { label: 'Chinese',       emoji: '🇨🇳' },
  { label: 'Japanese',      emoji: '🇯🇵' },
  { label: 'Thai',          emoji: '🇹🇭' },
  { label: 'Middle Eastern',emoji: '🇲🇪' },
  { label: 'American',      emoji: '🇺🇸' },
  { label: 'African',       emoji: '🌍' },
];

export default function CuisinePreferencesScreen({ navigation }: Props) {
  const { draft, updateDraft } = useHealthProfile();
  const [selected, setSelected] = useState<string[]>(draft.cuisine_preferences);

  function toggleCuisine(label: string) {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((c) => c !== label)
        : [...prev, label]
    );
  }

  function handleNoPreference() {
    // Empty array signals "no preference" to the recipe engine
    setSelected([]);
  }

  function handleNext() {
    updateDraft({ cuisine_preferences: selected });
    navigation.navigate('Allergies');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.step}>Step 4 of 5</Text>
        <Text style={styles.title}>Cuisine preferences</Text>
        <Text style={styles.subtitle}>
          Pick the cuisines you enjoy most. We'll prioritise these when suggesting recipes.
          You can always change this in Settings.
        </Text>

        <View style={styles.chips}>
          {CUISINES.map((cuisine) => {
            const isSelected = selected.includes(cuisine.label);
            return (
              <TouchableOpacity
                key={cuisine.label}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleCuisine(cuisine.label)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipEmoji}>{cuisine.emoji}</Text>
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {cuisine.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected.length > 0 && (
          <Text style={styles.selectedCount}>
            {selected.length} cuisine{selected.length > 1 ? 's' : ''} selected
          </Text>
        )}

        <TouchableOpacity style={styles.noPreferenceButton} onPress={handleNoPreference}>
          <Text style={[
            styles.noPreferenceText,
            selected.length === 0 && styles.noPreferenceTextActive,
          ]}>
            No preference — surprise me
          </Text>
        </TouchableOpacity>

        <PrimaryButton title="Next" onPress={handleNext} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    gap: 6,
  },
  chipSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  selectedCount: { fontSize: 13, color: '#FF6B35', fontWeight: '600', marginBottom: 8 },
  noPreferenceButton: { paddingVertical: 14, alignItems: 'center', marginBottom: 24 },
  noPreferenceText: { fontSize: 15, color: '#6B7280', textDecorationLine: 'underline' },
  noPreferenceTextActive: { color: '#FF6B35', fontWeight: '600' },
});
