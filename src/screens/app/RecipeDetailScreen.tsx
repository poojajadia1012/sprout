import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { SEED_RECIPES, MEAL_TYPE_GRADIENTS } from '../../data/seedRecipes';
import { useHealthProfile } from '../../context/HealthProfileContext';

type Props = NativeStackScreenProps<AppStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen({ route, navigation }: Props) {
  const { recipeId } = route.params;
  const { existingProfile } = useHealthProfile();

  const recipe = SEED_RECIPES.find((r) => r.id === recipeId);

  // Local save state — TODO: sync to Supabase user_saved_recipes table in P1
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(recipe?.save_count ?? 0);

  // Allergen warning: cross-reference recipe allergens against user's allergen list
  const userAllergens = existingProfile?.allergens ?? [];
  const matchedAllergens = recipe?.allergens.filter((a) => userAllergens.includes(a)) ?? [];

  function handleSave() {
    setSaved((prev) => {
      const nowSaved = !prev;
      setSaveCount((c) => nowSaved ? c + 1 : c - 1);
      return nowSaved;
    });
  }

  // Guard: recipe not found (should never happen in P0 with seed data)
  if (!recipe) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Recipe not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.errorBack}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const gradient = MEAL_TYPE_GRADIENTS[recipe.meal_type];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Gradient Hero ─────────────────────────────────────────────── */}
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          {/* Safe area spacer + back button */}
          <SafeAreaView style={styles.heroSafeArea}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.heroContent}>
            <Text style={styles.mealType}>{recipe.meal_type.toUpperCase()}</Text>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
          </View>
        </LinearGradient>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <View style={styles.body}>

          {/* Attribution */}
          <View style={styles.attribution}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>🌱</Text>
            </View>
            <Text style={styles.attributionName}>{recipe.generated_by.display_name}</Text>
          </View>

          {/* Nutrition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition</Text>
            <View style={styles.nutritionRow}>
              <View style={[styles.nutritionPill, styles.caloriesPill]}>
                <Text style={styles.caloriesValue}>{recipe.calories}</Text>
                <Text style={styles.caloriesLabel}>kcal</Text>
              </View>
              <View style={styles.nutritionPill}>
                <Text style={styles.nutritionValue}>{recipe.protein_g}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionPill}>
                <Text style={styles.nutritionValue}>{recipe.carbs_g}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionPill}>
                <Text style={styles.nutritionValue}>{recipe.fat_g}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
          </View>

          {/* Meta — time, tags, allergen warning */}
          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={15} color="#6B7280" />
              <Text style={styles.metaText}>
                {recipe.prep_time > 0 ? `${recipe.prep_time} min prep` : ''}
                {recipe.prep_time > 0 && recipe.cook_time > 0 ? ' · ' : ''}
                {recipe.cook_time > 0 ? `${recipe.cook_time} min cook` : ''}
              </Text>
            </View>
            <View style={styles.tagsRow}>
              {recipe.dietary_tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              <View style={styles.tag}>
                <Text style={styles.tagText}>{recipe.cuisine}</Text>
              </View>
            </View>
            {matchedAllergens.length > 0 && (
              <View style={styles.allergenWarning}>
                <Ionicons name="warning-outline" size={14} color="#D97706" />
                <Text style={styles.allergenWarningText}>
                  Contains {matchedAllergens.join(', ')}
                </Text>
              </View>
            )}
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          {/* Method */}
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>Method</Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* ── Sticky Save Footer ────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saved && styles.saveButtonSaved]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={saved ? '#fff' : '#FF6B35'}
          />
          <Text style={[styles.saveButtonText, saved && styles.saveButtonTextSaved]}>
            {saved ? 'Saved' : 'Save Recipe'}
          </Text>
          {saveCount > 0 && (
            <Text style={[styles.saveCount, saved && styles.saveCountSaved]}>
              {saveCount}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // space for the sticky footer
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    paddingBottom: 28,
  },
  heroSafeArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  mealType: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 34,
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Attribution
  attribution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  attributionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },

  // Nutrition
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  nutritionPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  caloriesPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  caloriesValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EA580C',
  },
  caloriesLabel: {
    fontSize: 10,
    color: '#EA580C',
    fontWeight: '500',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  nutritionLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Meta
  metaSection: {
    marginBottom: 28,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  allergenWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  allergenWarningText: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '600',
  },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
    marginTop: 7,
    flexShrink: 0,
  },
  ingredientText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    flex: 1,
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 23,
    flex: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  saveButtonSaved: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  saveButtonTextSaved: {
    color: '#fff',
  },
  saveCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  saveCountSaved: {
    color: '#fff',
  },

  // Error state
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  errorBack: {
    fontSize: 15,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
