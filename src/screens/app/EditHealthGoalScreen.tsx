import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { HealthGoal, BiologicalSex, calculateCalories, getMacros } from '../../context/HealthProfileContext';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<AppStackParamList, 'EditHealthGoal'>;

const GOALS: { value: HealthGoal; label: string; description: string }[] = [
  { value: 'eat_healthier',   label: 'Eat healthier',           description: 'Better nutrition, more balanced meals' },
  { value: 'weight_loss',     label: 'Lose weight',             description: 'A calorie deficit to shed fat over time' },
  { value: 'muscle_gain',     label: 'Build muscle',            description: 'Extra fuel to support muscle growth' },
  { value: 'maintain_weight', label: 'Maintain weight',         description: 'Keep things steady with balanced meals' },
  { value: 'recomposition',   label: 'Lose fat & build muscle', description: 'Body recomposition — the best of both' },
];

export default function EditHealthGoalScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const p = route.params; // data passed from hub — no fetch needed

  const [goal, setGoal] = useState<HealthGoal>(p.health_goal as HealthGoal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const calorie_target = calculateCalories(
      p.weight_kg, p.height_cm,
      p.date_of_birth, p.biological_sex as BiologicalSex, goal,
    );
    const macros = getMacros(goal);

    const { error: saveError } = await supabase
      .from('health_profiles')
      .update({ health_goal: goal, calorie_target, ...macros, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {GOALS.map((g) => (
          <TouchableOpacity
            key={g.value}
            style={[styles.card, goal === g.value && styles.cardSelected]}
            onPress={() => setGoal(g.value)}
          >
            <Text style={[styles.cardLabel, goal === g.value && styles.cardLabelSelected]}>{g.label}</Text>
            <Text style={[styles.cardDesc, goal === g.value && styles.cardDescSelected]}>{g.description}</Text>
          </TouchableOpacity>
        ))}
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
  card: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', marginBottom: 10 },
  cardSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  cardLabelSelected: { color: '#FF6B35' },
  cardDesc: { fontSize: 13, color: '#6B7280' },
  cardDescSelected: { color: '#FF6B35' },
  saveContainer: { marginTop: 24 },
  error: { color: '#EF4444', fontSize: 14, marginTop: 12, marginBottom: 4 },
});
