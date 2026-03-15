import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useHealthProfile, HealthProfile } from '../../context/HealthProfileContext';
import { supabase } from '../../lib/supabase';
import RecipeCard from '../../components/recipe/RecipeCard';
import { SEED_RECIPES, Recipe } from '../../data/seedRecipes';

const PAGE_SIZE = 10;

const MOTIVATIONAL_MESSAGES: Record<string, string> = {
  weight_loss:     'Every healthy meal is a step forward 💪',
  muscle_gain:     'Fuel your gains today 🏋️',
  maintain_weight: 'Consistency is everything 🌿',
  eat_healthier:   'Good food, good mood 🥗',
  recomposition:   'Build the best version of you 🔥',
};

export default function HomeScreen() {
  const { dbUser, user } = useAuth();
  const { existingProfile, setExistingProfile } = useHealthProfile();
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load health profile if not already in context
  useEffect(() => {
    if (existingProfile || !user) return;
    supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setExistingProfile(data as HealthProfile);
      });
  }, [user, existingProfile]);

  const visibleRecipes: Recipe[] = SEED_RECIPES.slice(0, page * PAGE_SIZE);
  const hasMore = visibleRecipes.length < SEED_RECIPES.length;

  const goal = existingProfile?.health_goal ?? 'eat_healthier';
  const motivationalMessage = MOTIVATIONAL_MESSAGES[goal];

  function handleLoadMore() {
    setLoadingMore(true);
    // Small delay so the spinner is visible before the list extends
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 400);
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => {
              // TODO: navigate to RecipeDetailScreen
            }}
          />
        )}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.greeting}>{motivationalMessage}</Text>
              <Text style={styles.name}>
                {dbUser?.first_name ? `Hi, ${dbUser.first_name}` : 'Welcome back'}
              </Text>
            </View>

            {/* Generate Recipe button */}
            <TouchableOpacity style={styles.generateButton} activeOpacity={0.85}>
              <Text style={styles.generateText}>✨ Generate Recipe</Text>
            </TouchableOpacity>

            <Text style={styles.feedLabel}>Discover recipes</Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footer}>
              {loadingMore ? (
                <ActivityIndicator color="#FF6B35" />
              ) : (
                <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                  <Text style={styles.loadMoreText}>Load more</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.footer}>
              <Text style={styles.endText}>You've seen all recipes 🎉</Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  generateButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  generateText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  feedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadMoreButton: {
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  loadMoreText: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 15,
  },
  endText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
