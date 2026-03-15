import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type HealthGoal = 'eat_healthier' | 'weight_loss' | 'muscle_gain' | 'maintain_weight' | 'recomposition';
export type BiologicalSex = 'male' | 'female' | 'prefer_not_to_say';
export type UnitPreference = 'metric' | 'imperial';

export type HealthProfileDraft = {
  date_of_birth: string | null;
  biological_sex: BiologicalSex | null;
  height_cm: number | null;
  weight_kg: number | null;
  unit_preference: UnitPreference;
  health_goal: HealthGoal | null;
  is_vegan: boolean;
  cuisine_preferences: string[];
  allergens: string[];
};

// The loaded profile from Supabase (for the edit flow in Settings).
export type HealthProfile = HealthProfileDraft & {
  id: string;
  user_id: string;
  date_of_birth: string;
  biological_sex: BiologicalSex;
  height_cm: number;
  weight_kg: number;
  health_goal: HealthGoal;
  calorie_target: number;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
};

type HealthProfileContextValue = {
  draft: HealthProfileDraft;
  updateDraft: (fields: Partial<HealthProfileDraft>) => void;
  saveProfile: (overrides?: Partial<HealthProfileDraft>) => Promise<{ error: string | null }>;
  existingProfile: HealthProfile | null;
  setExistingProfile: (profile: HealthProfile | null) => void;
};

const HealthProfileContext = createContext<HealthProfileContextValue | null>(null);

const defaultDraft: HealthProfileDraft = {
  date_of_birth: null,
  biological_sex: null,
  height_cm: null,
  weight_kg: null,
  unit_preference: 'metric',
  health_goal: null,
  is_vegan: false,
  cuisine_preferences: [],
  allergens: [],
};

// Silently calculates calorie target using Mifflin-St Jeor formula.
// This number is never shown to the user — it's used by the recipe engine.
export function calculateCalories(
  weightKg: number,
  heightCm: number,
  dateOfBirth: string,
  sex: BiologicalSex,
  goal: HealthGoal,
): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  const age = today.getFullYear() - birth.getFullYear();

  // Mifflin-St Jeor BMR formula — different for male vs female.
  // For "prefer_not_to_say" we use the average of the two formulas.
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

  // TDEE = BMR × activity multiplier (1.55 = moderately active)
  const tdee = bmr * 1.55;

  // Adjust based on health goal
  if (goal === 'weight_loss') return Math.round(tdee - 400);
  if (goal === 'muscle_gain') return Math.round(tdee + 250);
  return Math.round(tdee); // maintain_weight and eat_healthier use TDEE as-is
}

// Returns the macro percentage split based on the health goal.
export function getMacros(goal: HealthGoal): { protein_pct: number; carbs_pct: number; fat_pct: number } {
  switch (goal) {
    case 'weight_loss':     return { protein_pct: 40, carbs_pct: 30, fat_pct: 30 };
    case 'muscle_gain':     return { protein_pct: 35, carbs_pct: 45, fat_pct: 20 };
    case 'maintain_weight': return { protein_pct: 30, carbs_pct: 40, fat_pct: 30 };
    case 'eat_healthier':   return { protein_pct: 25, carbs_pct: 50, fat_pct: 25 };
    case 'recomposition':   return { protein_pct: 40, carbs_pct: 35, fat_pct: 25 };
  }
}

export function HealthProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUserStatus } = useAuth();
  const [draft, setDraft] = useState<HealthProfileDraft>(defaultDraft);
  const [existingProfile, setExistingProfile] = useState<HealthProfile | null>(null);

  function updateDraft(fields: Partial<HealthProfileDraft>) {
    setDraft((prev) => ({ ...prev, ...fields }));
  }

  async function saveProfile(overrides?: Partial<HealthProfileDraft>): Promise<{ error: string | null }> {
    if (!user) return { error: 'Not logged in.' };
    // Merge any last-step overrides (e.g. allergens from AllergiesScreen) so we
    // don't rely on setState having flushed before this function is called.
    const data = { ...draft, ...overrides };
    if (!data.date_of_birth || !data.biological_sex || !data.height_cm || !data.weight_kg || !data.health_goal) {
      return { error: 'Profile is incomplete.' };
    }

    // Calculate silently — user never sees these numbers
    const calorie_target = calculateCalories(
      data.weight_kg,
      data.height_cm,
      data.date_of_birth,
      data.biological_sex,
      data.health_goal,
    );
    const macros = getMacros(data.health_goal);

    const { error } = await supabase.from('health_profiles').upsert({
      user_id: user.id,
      date_of_birth: data.date_of_birth,
      biological_sex: data.biological_sex,
      height_cm: data.height_cm,
      weight_kg: data.weight_kg,
      unit_preference: data.unit_preference,
      health_goal: data.health_goal,
      is_vegan: data.is_vegan,
      cuisine_preferences: data.cuisine_preferences,
      allergens: data.allergens,
      calorie_target,
      ...macros,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) return { error: error.message };

    // Mark onboarding as complete — RootNavigator will route to main app
    await updateUserStatus('active');
    return { error: null };
  }

  return (
    <HealthProfileContext.Provider value={{ draft, updateDraft, saveProfile, existingProfile, setExistingProfile }}>
      {children}
    </HealthProfileContext.Provider>
  );
}

export function useHealthProfile(): HealthProfileContextValue {
  const context = useContext(HealthProfileContext);
  if (!context) throw new Error('useHealthProfile must be used within HealthProfileProvider');
  return context;
}
