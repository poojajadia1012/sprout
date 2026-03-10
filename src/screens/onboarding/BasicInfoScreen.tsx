import React, { useState } from 'react';
import {
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
import { HealthProfileStackParamList } from '../../navigation/HealthProfileStack';
import { useHealthProfile, UnitPreference, BiologicalSex } from '../../context/HealthProfileContext';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<HealthProfileStackParamList, 'BasicInfo'>;

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

// Formats a Date object as "12 March 1995" for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Converts a Date object to YYYY-MM-DD string for the database
function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Default starting date for the picker — 25 years ago
function defaultDobDate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 25);
  return d;
}

export default function BasicInfoScreen({ navigation }: Props) {
  const { draft, updateDraft } = useHealthProfile();

  // Parse existing DOB from draft if present, otherwise use default
  const [dobDate, setDobDate] = useState<Date>(
    draft.date_of_birth ? new Date(draft.date_of_birth) : defaultDobDate()
  );
  // Whether the user has explicitly picked a date (vs just seeing the default)
  const [dobPicked, setDobPicked] = useState(!!draft.date_of_birth);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [sex, setSex] = useState<BiologicalSex | null>(draft.biological_sex);
  const [unit, setUnit] = useState<UnitPreference>(draft.unit_preference);

  const [heightCm, setHeightCm] = useState(draft.height_cm?.toString() ?? '');
  const [heightFt, setHeightFt] = useState(
    draft.height_cm ? cmToFtIn(draft.height_cm).feet.toString() : ''
  );
  const [heightIn, setHeightIn] = useState(
    draft.height_cm ? cmToFtIn(draft.height_cm).inches.toString() : ''
  );

  const [weightKg, setWeightKg] = useState(draft.weight_kg?.toString() ?? '');
  const [weightLbs, setWeightLbs] = useState(
    draft.weight_kg ? kgToLbs(draft.weight_kg).toString() : ''
  );

  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!dobPicked) {
      setError('Please select your date of birth');
      return;
    }
    if (!sex) {
      setError('Please select a biological sex');
      return;
    }

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

    updateDraft({
      date_of_birth: toISODate(dobDate),
      biological_sex: sex,
      height_cm: finalHeightCm,
      weight_kg: finalWeightKg,
      unit_preference: unit,
    });
    navigation.navigate('HealthGoal');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.step}>Step 1 of 5</Text>
          <Text style={styles.title}>Basic info</Text>
          <Text style={styles.subtitle}>
            Your age, height, and weight help us understand your body's needs so we can suggest
            recipes that are appropriately sized for your goal.
          </Text>

          {/* Unit toggle */}
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

          {/* Date of birth — tappable field that reveals the wheel picker */}
          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity
            style={[styles.input, styles.dobField]}
            onPress={() => setShowDatePicker(!showDatePicker)}
            activeOpacity={0.7}
          >
            <Text style={dobPicked ? styles.dobText : styles.dobPlaceholder}>
              {dobPicked ? formatDate(dobDate) : 'Select your date of birth'}
            </Text>
            <Text style={styles.dobChevron}>{showDatePicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {/* The iOS wheel picker — shown inline when tapped */}
          {showDatePicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={dobDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    setDobDate(selectedDate);
                    setDobPicked(true);
                  }
                }}
                style={styles.picker}
              />
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Biological sex */}
          <Text style={styles.label}>Biological sex</Text>
          <View style={styles.sexRow}>
            {([
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
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

          {/* Height */}
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

          {/* Weight */}
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

          {error && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton title="Next" onPress={handleNext} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  step: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 28, lineHeight: 22 },
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
  dobField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dobText: { fontSize: 16, color: '#1A1A1A' },
  dobPlaceholder: { fontSize: 16, color: '#9CA3AF' },
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
  error: { color: '#EF4444', fontSize: 14, marginTop: 12, marginBottom: 4 },
});
