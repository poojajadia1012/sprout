import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Recipe, MEAL_TYPE_GRADIENTS } from '../../data/seedRecipes';

type Props = {
  recipe: Recipe;
  onPress: () => void;
};

export default function RecipeCard({ recipe, onPress }: Props) {
  const [saveCount, setSaveCount] = useState(recipe.save_count);
  const [saved, setSaved] = useState(false);
  const gradient = MEAL_TYPE_GRADIENTS[recipe.meal_type];

  function handleSave() {
    // Optimistic update — toggles save and adjusts count immediately
    setSaved((prev) => {
      const nowSaved = !prev;
      setSaveCount((c) => nowSaved ? c + 1 : c - 1);
      return nowSaved;
    });
    // TODO: sync to Supabase when user_saved_recipes table exists
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.wrapper}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Meal type label */}
        <Text style={styles.mealType}>{recipe.meal_type.toUpperCase()}</Text>

        {/* Recipe name & description */}
        <Text style={styles.name}>{recipe.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>

        {/* Macros */}
        <View style={styles.macros}>
          <View style={styles.macroPill}>
            <Text style={styles.macroValue}>{recipe.protein_g}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroPill}>
            <Text style={styles.macroValue}>{recipe.carbs_g}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroPill}>
            <Text style={styles.macroValue}>{recipe.fat_g}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        {/* Time & dietary tags row */}
        <View style={styles.metaRow}>
          <Text style={styles.time}>
            {recipe.prep_time > 0 ? `${recipe.prep_time} min prep · ` : ''}
            {recipe.cook_time > 0 ? `${recipe.cook_time} min cook` : 'No cook'}
          </Text>
        </View>
        <View style={styles.tagsRow}>
          {recipe.dietary_tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={saved ? '#FF6B35' : '#fff'}
          />
          {saveCount > 0 && (
            <Text style={[styles.saveCount, saved && styles.saveCountActive]}>
              {saveCount}
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 240,
  },
  mealType: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 16,
  },
  macros: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  macroPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  macroLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  metaRow: {
    marginBottom: 10,
  },
  time: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
  },
  saveCount: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  saveCountActive: {
    color: '#FF6B35',
  },
});
