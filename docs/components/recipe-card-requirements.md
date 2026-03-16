# Sprout — Recipe Card Component
### Scope: P0 (MVP) — Ready for development
### Path: `src/components/recipe/RecipeCard.tsx`

---

## Overview

The Recipe Card is a **reusable component** used across multiple screens — the homepage feed, search results, saved collections, and user profiles. Any changes to the card design apply everywhere it appears.

---

## 6.1 Card Structure

### P0
Each recipe card displays the following, from top to bottom:

**Top row — Attribution**
- Small circular avatar (left) + display name (right)
- P0: Seed recipes show the Sprout logo as avatar and "Sprout" as display name
- P1+: Real user's profile picture and name for user-generated recipes

**Gradient background**
- Full-width branded gradient tied to meal type (no photo in P0):
  - Breakfast → warm yellow / amber (`#FEF08A` → `#EAB308`)
  - Lunch → fresh green (`#BBF7D0` → `#16A34A`)
  - Dinner → deep indigo (`#C4B5FD` → `#4F46E5`)
  - Snack → soft coral (`#FECDD3` → `#F43F5E`)
- Gradient colours are defined as a shared constant — see Technical Notes

**Recipe metadata (overlaid on gradient)**
- **Meal type label** — small, uppercase, muted (e.g. "BREAKFAST")
- **Recipe name** — large, bold, prominent
- **Short description** — 1–2 lines
- **Cuisine tag** — small chip (e.g. "Italian", "Indian")
- **Dietary tags** — small chips (e.g. "Vegan", "Gluten-free")
- **Allergen indicator** — ⚠️ warning shown if the recipe contains any allergen matching the current user's allergen list; tapping the warning shows a tooltip listing the specific matched allergens

**Nutrition row**
- **Calories** — shown first, most prominently (per-recipe calorie content, not the user's daily target)
- **Protein / Carbs / Fat** — in grams, displayed as pill badges

**Time row**
- Prep time and cook time — e.g. "10 min prep · 20 min cook"

**Action row**
- 🔖 Save button + save count — P0
- ❤️ Like button + like count — P0.5 (data model included from day one; UI ships after initial launch)

---

## 6.2 Interactions

### P0
- **Tap card** → navigates to Recipe Detail screen (`AppStack.push('RecipeDetail', { recipeId })`)
- **Save / bookmark** → toggles save state, updates count optimistically, syncs to Supabase; shows brief toast "Saved" / "Removed"
- **Allergen indicator tap** → shows tooltip with specific allergen names (e.g. "Contains Gluten, Dairy")

### P0.5
- **Like / heart** → toggles like state, updates count optimistically, syncs to Supabase

### P1
- **Share** — native share sheet
- **Comment** — opens comment thread

---

## 6.3 Save & Like State

### P0
- Save state is **consistent across all screens** — saving from the homepage also reflects on search results and saved collections
- State is sourced from Supabase on mount and updated optimistically on interaction
- `saved_recipes` join table: `user_id`, `recipe_id`, `saved_at`

### P0.5
- `liked_recipes` join table: `user_id`, `recipe_id`, `liked_at`
- Like count is a denormalised `like_count` column on the `recipes` table — updated via Supabase function or trigger

---

## 6.4 Required `Recipe` Type Fields

The card relies on the following fields from the `Recipe` type (`src/data/seedRecipes.ts`):

```typescript
id: string
name: string
description: string
meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
cuisine: string           // e.g. 'Italian', 'Indian', 'Mexican'
dietary_tags: string[]    // e.g. ['Vegan', 'Gluten-free']
allergens: string[]       // allergens the recipe CONTAINS — matched against user's list for warning
calories: number          // per-recipe calorie content (not the user's daily target)
protein_g: number
carbs_g: number
fat_g: number
prep_time: number         // minutes
cook_time: number         // minutes
save_count: number
like_count: number        // included in data model from P0; UI surfaced in P0.5
generated_by: {
  id: string              // user_id or 'sprout' for seed recipes
  display_name: string    // e.g. 'Sprout' or user's first name
  avatar_url: string | null  // null falls back to Sprout logo
}
```

---

## 6.5 P1 Features (Out of Scope for P0 / P0.5)

- User-uploaded photo replacing the gradient background
- Share button
- Comment count + tap to open comments
- Animated like interaction (heart burst animation)

---

## Technical Notes for Claude Code

- Component path: `src/components/recipe/RecipeCard.tsx`
- Accept `recipe: Recipe`, `userAllergens: string[]`, and `onPress: () => void` as props
- Save and like state should be **managed by the parent screen** and passed in as props — the card itself is stateless for these interactions
- Allergen warning: compare `recipe.allergens` against `userAllergens` prop — show ⚠️ if any overlap; tap shows tooltip
- Gradient colours are defined in `src/data/seedRecipes.ts` as `MEAL_TYPE_GRADIENTS` and shared with the Recipe Detail screen header
- Use `expo-linear-gradient` for the gradient background
- Use `@expo/vector-icons` (Ionicons) for save and like icons

---
