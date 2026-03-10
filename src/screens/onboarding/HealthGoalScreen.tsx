import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HealthProfileStackParamList } from '../../navigation/HealthProfileStack';
import { useHealthProfile, HealthGoal } from '../../context/HealthProfileContext';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<HealthProfileStackParamList, 'HealthGoal'>;

// Each card has an emoji, a label, and the value we store in the database
const GOALS: { value: HealthGoal; emoji: string; label: string; description: string }[] = [
  { value: 'eat_healthier',   emoji: '🥗', label: 'Eat healthier',          description: 'More balanced, nutritious meals' },
  { value: 'weight_loss',     emoji: '⚖️', label: 'Lose weight',            description: 'Sustainable calorie deficit' },
  { value: 'muscle_gain',     emoji: '💪', label: 'Build muscle',           description: 'Higher protein, calorie surplus' },
  { value: 'maintain_weight', emoji: '➡️', label: 'Maintain weight',        description: 'Stay at current weight' },
  { value: 'recomposition',   emoji: '🔄', label: 'Lose fat & build muscle', description: 'Body recomposition — the best of both' },
];

export default function HealthGoalScreen({ navigation }: Props) {
  const { draft, updateDraft } = useHealthProfile();
  const [selected, setSelected] = useState<HealthGoal | null>(draft.health_goal);
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!selected) {
      setError('Please select a goal to continue');
      return;
    }
    updateDraft({ health_goal: selected });
    navigation.navigate('DietaryMode');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.step}>Step 2 of 5</Text>
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.subtitle}>
          This shapes the types of recipes we suggest — higher protein for muscle gain,
          lighter meals for weight loss, and so on.
        </Text>

        <View style={styles.cards}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[styles.card, selected === goal.value && styles.cardSelected]}
              onPress={() => { setSelected(goal.value); setError(null); }}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{goal.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, selected === goal.value && styles.cardLabelSelected]}>
                  {goal.label}
                </Text>
                <Text style={[styles.cardDescription, selected === goal.value && styles.cardDescriptionSelected]}>
                  {goal.description}
                </Text>
              </View>
              {/* Checkmark shown when selected */}
              {selected === goal.value && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

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
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 28, lineHeight: 22 },
  cards: { gap: 12, marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    gap: 14,
  },
  cardSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF4F0' },
  emoji: { fontSize: 28 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  cardLabelSelected: { color: '#FF6B35' },
  cardDescription: { fontSize: 13, color: '#6B7280' },
  cardDescriptionSelected: { color: '#FF6B35', opacity: 0.8 },
  check: { fontSize: 18, color: '#FF6B35', fontWeight: '700' },
  error: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
});
