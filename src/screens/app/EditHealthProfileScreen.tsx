import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { HealthGoal, BiologicalSex, UnitPreference } from '../../context/HealthProfileContext';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<AppStackParamList, 'EditHealthProfile'>;

// ── Unit conversion helpers ──────────────────────────────────────────────────

function ftInToCm(feet: number, inches: number): number {
  return Math.round(((feet * 12) + inches) * 2.54);
}
function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  return { feet: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
}
function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10;
}
function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ── Calorie & macro calculations (mirrors HealthProfileContext) ──────────────

function calculateCalories(
  weightKg: number,
  heightCm: number,
  dateOfBirth: string,
  sex: BiologicalSex,
  goal: HealthGoal,
): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  const age = today.getFullYear() - birth.getFullYear();
  let bmr: number;
  if (sex === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else if (sex === 'female') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  } else {
    const maleBmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    const femaleBmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    bmr = (maleBmr + femaleBmr) / 2;
  }
  const tdee = bmr * 1.55;
  if (goal === 'weight_loss') return Math.round(tdee - 400);
  if (goal === 'muscle_gain') return Math.round(tdee + 250);
  return Math.round(tdee);
}

function getMacros(goal: HealthGoal): { protein_pct: number; carbs_pct: number; fat_pct: number } {
  switch (goal) {
    case 'weight_loss':     return { protein_pct: 40, carbs_pct: 30, fat_pct: 30 };
    case 'muscle_gain':     return { protein_pct: 35, carbs_pct: 45, fat_pct: 20 };
    case 'maintain_weight': return { protein_pct: 30, carbs_pct: 40, fat_pct: 30 };
    case 'eat_healthier':   return { protein_pct: 25, carbs_pct: 50, fat_pct: 25 };
    case 'recomposition':   return { protein_pct: 40, carbs_pct: 35, fat_pct: 25 };
  }
}

// ── Static data ──────────────────────────────────────────────────────────────

const HEALTH_GOALS: { value: HealthGoal; label: string; description: string }[] = [
  { value: 'eat_healthier',   label: 'Eat healthier',           description: 'Better nutrition, more balanced meals' },
  { value: 'weight_loss',     label: 'Lose weight',             description: 'A calorie deficit to shed fat over time' },
  { value: 'muscle_gain',     label: 'Build muscle',            description: 'Extra fuel to support muscle growth' },
  { value: 'maintain_weight', label: 'Maintain weight',         description: 'Keep things steady with balanced meals' },
  { value: 'recomposition',   label: 'Lose fat & build muscle', description: 'Body recomposition — the best of both' },
];

const CUISINES = [
  { value: 'italian',       label: '🇮🇹 Italian' },
  { value: 'indian',        label: '🇮🇳 Indian' },
  { value: 'mexican',       label: '🇲🇽 Mexican' },
  { value: 'chinese',       label: '🇨🇳 Chinese' },
  { value: 'japanese',      label: '🇯🇵 Japanese' },
  { value: 'thai',          label: '🇹🇭 Thai' },
  { value: 'mediterranean', label: '🫒 Mediterranean' },
  { value: 'american',      label: '🇺🇸 American' },
  { value: 'french',        label: '🇫🇷 French' },
  { value: 'middle_eastern',label: '🧆 Middle Eastern' },
];

const ALLERGENS = [
  'Gluten', 'Dairy', 'Eggs', 'Soy', 'Nuts', 'Peanuts', 'Sesame', 'Shellfish',
];

// ── Screen ───────────────────────────────────────────────────────────────────

export default function EditHealthProfileScreen({ navigation }: Props) {
  const { user } = useAuth();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [unit, setUnit] = useState<UnitPreference>('metric');
  const [dobDate, setDobDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState<BiologicalSex | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [healthGoal, setHealthGoal] = useState<HealthGoal | null>(null);
  const [isVegan, setIsVegan] = useState(false);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);

  // Load existing profile from Supabase when the screen opens.
  // user is in the dependency array so if it loads slightly after mount, we still run.
  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      try {
        const { data } = await supabase
          .from('health_profiles')
          .select('*')
          .eq('user_id', user!.id)
          .single();

        if (data) {
          const savedUnit: UnitPreference = data.unit_preference ?? 'metric';
          setUnit(savedUnit);
          setDobDate(new Date(data.date_of_birth));
          setSex(data.biological_sex);
          if (savedUnit === 'imperial') {
            const { feet, inches } = cmToFtIn(data.height_cm);
            setHeightFt(feet.toString());
            setHeightIn(inches.toString());
            setWeightLbs(kgToLbs(data.weight_kg).toString());
          } else {
            setHeightCm(data.height_cm.toString());
            setWeightKg(data.weight_kg.toString());
          }
          setHealthGoal(data.health_goal);
          setIsVegan(data.is_vegan ?? false);
          setCuisines(data.cuisine_preferences ?? []);
          setAllergens(data.allergens ?? []);
        }
      } finally {
        // Always hide the spinner — even if the query fails or user was null
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user]);

  function toggleCuisine(value: string) {
    if (value === 'none') {
      setCuisines([]);
      return;
    }
    setCuisines((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  function toggleAllergen(value: string) {
    setAllergens((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  async function handleSave() {
    if (!user) return;
    setError(null);

    // Validate & resolve height to cm
    let finalHeightCm: number;
    if (unit === 'metric') {
      finalHeightCm = parseFloat(heightCm);
    } else {
      finalHeightCm = ftInToCm(parseInt(heightFt) || 0, parseInt(heightIn) || 0);
    }
    if (!finalHeightCm || finalHeightCm < 50 || finalHeightCm > 300) {
      setError('Enter a valid height');
      return;
    }

    // Validate & resolve weight to kg
    let finalWeightKg: number;
    if (unit === 'metric') {
      finalWeightKg = parseFloat(weightKg);
    } else {
      finalWeightKg = lbsToKg(parseFloat(weightLbs));
    }
    if (!finalWeightKg || finalWeightKg < 20 || finalWeightKg > 500) {
      setError('Enter a valid weight');
      return;
    }

    if (!sex) { setError('Please select a biological sex'); return; }
    if (!healthGoal) { setError('Please select a health goal'); return; }

    setSaving(true);
    const dob = toISODate(dobDate);
    const calorie_target = calculateCalories(finalWeightKg, finalHeightCm, dob, sex, healthGoal);
    const macros = getMacros(healthGoal);

    const { error: saveError } = await supabase.from('health_profiles').upsert({
      user_id: user.id,
      date_of_birth: dob,
      biological_sex: sex,
      height_cm: finalHeightCm,
      weight_kg: finalWeightKg,
      unit_preference: unit,
      health_goal: healthGoal,
      is_vegan: isVegan,
      cuisine_preferences: cuisines,
      allergens,
      calorie_target,
      ...macros,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    navigation.goBack();
  }

  // Show a spinner while the profile is loading from Supabase
  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* ── BASIC INFO ──────────────────────────────────────────────── */}
          <Text style={styles.sectionHeader}>Basic info</Text>

          <Text style={styles.label}>Units</Text>
          <View style={styles.toggle}>
            {(['metric', 'imperial'] as UnitPreference[]).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.toggleOption, unit === u && styles.toggleSelected]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.toggleText, unit === u && styles.toggleTextSelected]}>
                  {u === 'metric' ? 'Metric (cm, kg)' : 'Imperial (ft, lbs)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity
            style={[styles.input, styles.dobField]}
            onPress={() => setShowDatePicker(!showDatePicker)}
            activeOpacity={0.7}
          >
            <Text style={styles.inputText}>{formatDate(dobDate)}</Text>
            <Text style={styles.dobChevron}>{showDatePicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={dobDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) setDobDate(selectedDate);
                }}
                style={styles.picker}
              />
              <TouchableOpacity style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Biological sex</Text>
          <View style={styles.sexRow}>
            {([
              { value: 'male',              label: 'Male' },
              { value: 'female',            label: 'Female' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ] as { value: BiologicalSex; label: string }[]).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sexOption, sex === option.value && styles.sexSelected]}
                onPress={() => setSex(option.value)}
              >
                <Text style={[styles.sexText, sex === option.value && styles.sexTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Height</Text>
          {unit === 'metric' ? (
            <TextInput
              style={styles.input}
              placeholder="Height (cm)"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="ft"
                value={heightFt}
                onChangeText={setHeightFt}
                keyboardType="number-pad"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="in"
                value={heightIn}
                onChangeText={setHeightIn}
                keyboardType="number-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          )}

          <Text style={styles.label}>Weight</Text>
          {unit === 'metric' ? (
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Weight (lbs)"
              value={weightLbs}
              onChangeText={setWeightLbs}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          )}

          {/* ── HEALTH GOAL ─────────────────────────────────────────────── */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>Health goal</Text>
          {HEALTH_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[styles.goalCard, healthGoal === goal.value && styles.goalCardSelected]}
              onPress={() => setHealthGoal(goal.value)}
            >
              <Text style={[styles.goalLabel, healthGoal === goal.value && styles.goalLabelSelected]}>
                {goal.label}
              </Text>
              <Text style={[styles.goalDesc, healthGoal === goal.value && styles.goalDescSelected]}>
                {goal.description}
              </Text>
            </TouchableOpacity>
          ))}

          {/* ── DIETARY MODE ────────────────────────────────────────────── */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>Dietary mode</Text>
          <View style={styles.toggle}>
            {([
              { value: false, label: 'Vegetarian' },
              { value: true,  label: 'Vegan' },
            ] as { value: boolean; label: string }[]).map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[styles.toggleOption, isVegan === option.value && styles.toggleSelected]}
                onPress={() => setIsVegan(option.value)}
              >
                <Text style={[styles.toggleText, isVegan === option.value && styles.toggleTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── CUISINE PREFERENCES ─────────────────────────────────────── */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>Cuisine preferences</Text>
          <View style={styles.chipWrap}>
            {CUISINES.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[styles.chip, cuisines.includes(c.value) && styles.chipSelected]}
                onPress={() => toggleCuisine(c.value)}
              >
                <Text style={[styles.chipText, cuisines.includes(c.value) && styles.chipTextSelected]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, cuisines.length === 0 && styles.chipSelected]}
              onPress={() => toggleCuisine('none')}
            >
              <Text style={[styles.chipText, cuisines.length === 0 && styles.chipTextSelected]}>
                No preference — surprise me
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── ALLERGENS ───────────────────────────────────────────────── */}
          <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>Allergies & avoidances</Text>
          <Text style={styles.sectionSubtitle}>We'll never include these in your recipes.</Text>
          <View style={styles.chipWrap}>
            {ALLERGENS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, allergens.includes(a) && styles.chipSelected]}
                onPress={() => toggleAllergen(a)}
              >
                <Text style={[styles.chipText, allergens.includes(a) && styles.chipTextSelected]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── SAVE ────────────────────────────────────────────────────── */}
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.saveContainer}>
            <PrimaryButton title="Save changes" onPress={handleSave} isLoading={saving} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },

  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionHeaderSpaced: { marginTop: 36 },
  sectionSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },

  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 20 },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  inputText: { fontSize: 16, color: '#1A1A1A' },

  dobField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dobChevron: { fontSize: 12, color: '#9CA3AF' },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    marginTop: 4,
    overflow: 'hidden',
  },
  picker: { height: 200 },
  doneButton: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  doneText: { fontSize: 16, color: '#FF6B35', fontWeight: '600' },

  row: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },

  toggle: { flexDirection: 'row', gap: 8 },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  toggleSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  toggleText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  toggleTextSelected: { color: '#fff' },

  sexRow: { gap: 8 },
  sexOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  sexSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  sexText: { fontSize: 15, color: '#374151' },
  sexTextSelected: { color: '#fff', fontWeight: '500' },

  goalCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  goalCardSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  goalLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  goalLabelSelected: { color: '#FF6B35' },
  goalDesc: { fontSize: 13, color: '#6B7280' },
  goalDescSelected: { color: '#FF6B35' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  chipSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextSelected: { color: '#fff', fontWeight: '500' },

  saveContainer: { marginTop: 32 },
  error: { color: '#EF4444', fontSize: 14, marginTop: 12, marginBottom: 4 },
});
