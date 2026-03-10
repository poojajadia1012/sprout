import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HealthProfileStackParamList } from '../../navigation/HealthProfileStack';
import { useHealthProfile } from '../../context/HealthProfileContext';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<HealthProfileStackParamList, 'DietaryMode'>;

export default function DietaryModeScreen({ navigation }: Props) {
  const { draft, updateDraft } = useHealthProfile();
  const [isVegan, setIsVegan] = useState(draft.is_vegan);

  function handleNext() {
    updateDraft({ is_vegan: isVegan });
    navigation.navigate('CuisinePreferences');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.step}>Step 3 of 5</Text>

        <Text style={styles.title}>Your diet</Text>

        {/* Info banner explaining the app is vegetarian */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>🌿</Text>
          <Text style={styles.infoText}>
            All recipes on Sprout are vegetarian — no meat, fish, or poultry.
          </Text>
        </View>

        <Text style={styles.question}>Do you follow a vegan diet?</Text>
        <Text style={styles.subtitle}>
          This determines whether eggs and dairy are included in your recipes.
        </Text>

        {/* Two large option cards — No (default) and Yes */}
        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.option, !isVegan && styles.optionSelected]}
            onPress={() => setIsVegan(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.optionEmoji}>🧀</Text>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, !isVegan && styles.optionLabelSelected]}>
                No, I eat eggs & dairy
              </Text>
              <Text style={styles.optionDesc}>Vegetarian (default)</Text>
            </View>
            {!isVegan && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, isVegan && styles.optionSelected]}
            onPress={() => setIsVegan(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.optionEmoji}>🌱</Text>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, isVegan && styles.optionLabelSelected]}>
                Yes, I'm vegan
              </Text>
              <Text style={styles.optionDesc}>No animal products at all</Text>
            </View>
            {isVegan && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        </View>

        <PrimaryButton title="Next" onPress={handleNext} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  step: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginBottom: 20 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 28,
  },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 14, color: '#166534', lineHeight: 20 },
  question: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  options: { gap: 12, marginBottom: 32 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    gap: 14,
  },
  optionSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF4F0' },
  optionEmoji: { fontSize: 28 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  optionLabelSelected: { color: '#FF6B35' },
  optionDesc: { fontSize: 13, color: '#6B7280' },
  check: { fontSize: 18, color: '#FF6B35', fontWeight: '700' },
});
