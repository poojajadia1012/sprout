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

type Props = NativeStackScreenProps<AppStackParamList, 'EditDietaryMode'>;

export default function EditDietaryModeScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [isVegan, setIsVegan] = useState(route.params.is_vegan);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error: saveError } = await supabase
      .from('health_profiles')
      .update({ is_vegan: isVegan, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>All recipes in Sprout are vegetarian. You can also filter for fully vegan recipes.</Text>
        <View style={styles.gap}>
          {([
            { value: false, label: 'Vegetarian', desc: 'May include eggs and dairy' },
            { value: true,  label: 'Vegan',       desc: 'No animal products at all' },
          ] as { value: boolean; label: string; desc: string }[]).map((o) => (
            <TouchableOpacity
              key={o.label}
              style={[styles.card, isVegan === o.value && styles.cardSelected]}
              onPress={() => setIsVegan(o.value)}
            >
              <Text style={[styles.cardLabel, isVegan === o.value && styles.cardLabelSelected]}>{o.label}</Text>
              <Text style={[styles.cardDesc, isVegan === o.value && styles.cardDescSelected]}>{o.desc}</Text>
            </TouchableOpacity>
          ))}
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
  gap: { gap: 10 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' },
  cardSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  cardLabelSelected: { color: '#FF6B35' },
  cardDesc: { fontSize: 13, color: '#6B7280' },
  cardDescSelected: { color: '#FF6B35' },
  saveContainer: { marginTop: 32 },
  error: { color: '#EF4444', fontSize: 14, marginTop: 12, marginBottom: 4 },
});
