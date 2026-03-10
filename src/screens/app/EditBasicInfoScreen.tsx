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
import { AppStackParamList } from '../../navigation/AppStack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import {
  BiologicalSex, UnitPreference, HealthGoal,
  calculateCalories, getMacros,
} from '../../context/HealthProfileContext';
import PrimaryButton from '../../components/common/PrimaryButton';

type Props = NativeStackScreenProps<AppStackParamList, 'EditBasicInfo'>;

function ftInToCm(feet: number, inches: number) { return Math.round(((feet * 12) + inches) * 2.54); }
function cmToFtIn(cm: number) {
  const t = cm / 2.54;
  return { feet: Math.floor(t / 12), inches: Math.round(t % 12) };
}
function lbsToKg(lbs: number) { return Math.round(lbs * 0.453592 * 10) / 10; }
function kgToLbs(kg: number) { return Math.round(kg * 2.20462); }
function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function toISODate(d: Date) { return d.toISOString().split('T')[0]; }

export default function EditBasicInfoScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const p = route.params; // data passed from hub — no fetch needed

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [unit, setUnit] = useState<UnitPreference>(p.unit_preference as UnitPreference);
  const [dobDate, setDobDate] = useState(new Date(p.date_of_birth));
  const [showPicker, setShowPicker] = useState(false);
  const [sex, setSex] = useState<BiologicalSex | null>(p.biological_sex as BiologicalSex);

  // Pre-compute both unit representations so switching units works instantly
  const imperial = cmToFtIn(p.height_cm);
  const [heightCm, setHeightCm] = useState(p.height_cm.toString());
  const [heightFt, setHeightFt] = useState(imperial.feet.toString());
  const [heightIn, setHeightIn] = useState(imperial.inches.toString());
  const [weightKg, setWeightKg] = useState(p.weight_kg.toString());
  const [weightLbs, setWeightLbs] = useState(kgToLbs(p.weight_kg).toString());

  async function handleSave() {
    if (!user) return;
    setError(null);

    let finalHeightCm: number;
    if (unit === 'metric') { finalHeightCm = parseFloat(heightCm); }
    else { finalHeightCm = ftInToCm(parseInt(heightFt) || 0, parseInt(heightIn) || 0); }
    if (!finalHeightCm || finalHeightCm < 50 || finalHeightCm > 300) {
      setError('Enter a valid height'); return;
    }

    let finalWeightKg: number;
    if (unit === 'metric') { finalWeightKg = parseFloat(weightKg); }
    else { finalWeightKg = lbsToKg(parseFloat(weightLbs)); }
    if (!finalWeightKg || finalWeightKg < 20 || finalWeightKg > 500) {
      setError('Enter a valid weight'); return;
    }

    if (!sex) { setError('Please select a biological sex'); return; }

    setSaving(true);
    const dob = toISODate(dobDate);
    const calorie_target = calculateCalories(finalWeightKg, finalHeightCm, dob, sex, p.health_goal as HealthGoal);
    const macros = getMacros(p.health_goal as HealthGoal);

    const { error: saveError } = await supabase
      .from('health_profiles')
      .update({
        date_of_birth: dob, biological_sex: sex,
        height_cm: finalHeightCm, weight_kg: finalWeightKg,
        unit_preference: unit, calorie_target, ...macros,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>Units</Text>
          <View style={styles.toggle}>
            {(['metric', 'imperial'] as UnitPreference[]).map((u) => (
              <TouchableOpacity key={u} style={[styles.toggleOption, unit === u && styles.toggleSelected]} onPress={() => setUnit(u)}>
                <Text style={[styles.toggleText, unit === u && styles.toggleTextSelected]}>
                  {u === 'metric' ? 'Metric (cm, kg)' : 'Imperial (ft, lbs)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity style={[styles.input, styles.dobField]} onPress={() => setShowPicker(!showPicker)} activeOpacity={0.7}>
            <Text style={styles.inputText}>{formatDate(dobDate)}</Text>
            <Text style={styles.dobChevron}>{showPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={dobDate} mode="date" display="spinner"
                maximumDate={new Date()} minimumDate={new Date(1900, 0, 1)}
                onChange={(_e, d) => { if (d) setDobDate(d); }}
                style={styles.picker}
              />
              <TouchableOpacity style={styles.doneButton} onPress={() => setShowPicker(false)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Biological sex</Text>
          <View style={styles.sexRow}>
            {([
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ] as { value: BiologicalSex; label: string }[]).map((o) => (
              <TouchableOpacity key={o.value} style={[styles.sexOption, sex === o.value && styles.sexSelected]} onPress={() => setSex(o.value)}>
                <Text style={[styles.sexText, sex === o.value && styles.sexTextSelected]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Height</Text>
          {unit === 'metric' ? (
            <TextInput style={styles.input} placeholder="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" placeholderTextColor="#9CA3AF" />
          ) : (
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.inputHalf]} placeholder="ft" value={heightFt} onChangeText={setHeightFt} keyboardType="number-pad" placeholderTextColor="#9CA3AF" />
              <TextInput style={[styles.input, styles.inputHalf]} placeholder="in" value={heightIn} onChangeText={setHeightIn} keyboardType="number-pad" placeholderTextColor="#9CA3AF" />
            </View>
          )}

          <Text style={styles.label}>Weight</Text>
          {unit === 'metric' ? (
            <TextInput style={styles.input} placeholder="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" placeholderTextColor="#9CA3AF" />
          ) : (
            <TextInput style={styles.input} placeholder="Weight (lbs)" value={weightLbs} onChangeText={setWeightLbs} keyboardType="decimal-pad" placeholderTextColor="#9CA3AF" />
          )}

          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.saveContainer}>
            <PrimaryButton title="Save" onPress={handleSave} isLoading={saving} />
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
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1A1A1A', backgroundColor: '#FAFAFA',
  },
  inputText: { fontSize: 16, color: '#1A1A1A' },
  dobField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dobChevron: { fontSize: 12, color: '#9CA3AF' },
  pickerContainer: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FAFAFA', marginTop: 4, overflow: 'hidden' },
  picker: { height: 200 },
  doneButton: { alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  doneText: { fontSize: 16, color: '#FF6B35', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },
  toggle: { flexDirection: 'row', gap: 8 },
  toggleOption: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#FAFAFA' },
  toggleSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  toggleText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  toggleTextSelected: { color: '#fff' },
  sexRow: { gap: 8 },
  sexOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' },
  sexSelected: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  sexText: { fontSize: 15, color: '#374151' },
  sexTextSelected: { color: '#fff', fontWeight: '500' },
  saveContainer: { marginTop: 32 },
  error: { color: '#EF4444', fontSize: 14, marginTop: 12, marginBottom: 4 },
});
