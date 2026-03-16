# Sprout — Recipe Detail Screen
### Scope: P0 (MVP) — Ready for development
### Path: `src/screens/app/RecipeDetailScreen.tsx`

---

## Overview

The Recipe Detail screen is the full content view for a recipe. It opens when a user taps any `RecipeCard` in the feed. It is the primary place where a user decides whether to cook a recipe — it must give them everything they need: ingredients, steps, nutrition, and timing.

---

## 5.1 Navigation

### P0
- Pushed onto `AppStack` via `navigation.navigate('RecipeDetail', { recipeId: string })`
- Tab bar is **hidden** on this screen (AppStack push hides it automatically)
- Back chevron in the top-left returns to the previous screen
- No custom header — the gradient hero section replaces it visually; a transparent back button floats over it

---

## 5.2 Layout Structure

### P0
The screen is a single `ScrollView` with the following sections top to bottom:

1. **Gradient hero** — full-width, same meal-type gradient as the card
2. **Attribution row** — avatar + display name
3. **Nutrition summary** — calories + macro pills
4. **Meta row** — prep time, cook time, dietary tags, allergen warning
5. **Ingredients** — titled section with a list of ingredients
6. **Method** — titled section with numbered steps
7. **Save button** — sticky footer CTA

---

## 5.3 Gradient Hero

### P0
- Full-width gradient block at the top of the screen, extending behind the status bar (`paddingTop` accounts for safe area)
- Same `MEAL_TYPE_GRADIENTS` colours used on the card — shared constant, no duplication
- Displays:
  - Meal type label (small, uppercase, muted) — e.g. "DINNER"
  - Recipe name — large, bold, white
  - Short description — 1–2 lines, semi-transparent white
- Floating back button (top-left, white chevron) overlaid on the gradient

---

## 5.4 Attribution Row

### P0
- Small circular avatar + display name, rendered directly below the hero
- P0: Seed recipes show the Sprout logo and "Sprout" as the display name
- P1+: Real user's avatar and first name for user-generated recipes

---

## 5.5 Nutrition Summary

### P0
- Displayed as a horizontal row of pill badges, consistent with the card style:
  - **Calories** — shown first and most prominently
  - **Protein** — in grams
  - **Carbs** — in grams
  - **Fat** — in grams
- Note: calories here are per-recipe nutritional content, not the user's daily target

---

## 5.6 Meta Row

### P0
- **Prep time** — e.g. "10 min prep"
- **Cook time** — e.g. "20 min cook" (omitted if 0)
- **Dietary tags** — same chips as on the card (e.g. "Vegan", "Gluten-free")
- **Allergen warning** — same ⚠️ warning as on the card if the recipe contains any of the user's allergens; tapping shows a tooltip with the specific matched allergens

---

## 5.7 Ingredients

### P0
- Section title: "Ingredients"
- Displayed as a simple bulleted list
- Each ingredient is a single string, e.g. "200g firm tofu, cubed"
- Serves 1 (single-serve recipes) — serving size adjustment is P1

### P1
- Serving size selector (1–4 servings) that scales ingredient quantities

---

## 5.8 Method

### P0
- Section title: "Method"
- Displayed as a numbered list of steps
- Each step is a plain string — clear, concise, action-first language
- e.g. "1. Heat a non-stick pan over medium heat and add 1 tsp olive oil."

---

## 5.9 Save Button

### P0
- Sticky footer at the bottom of the screen (outside the scroll view)
- **"Save Recipe"** / **"Saved ✓"** — toggles on tap, updates count optimistically
- Uses `PrimaryButton` styling (orange background)
- Save state is consistent with the card — if already saved from the feed, the button reflects that on open

---

## 5.10 P1 Features (Out of Scope for P0)

- **Like button** — consistent with P0.5 card interaction
- **Share button** — native share sheet with recipe deep link
- **Comments** — thread below the method
- **"Generate a variation"** CTA — triggers AI generation flow pre-filled with this recipe as context
- **User photo** — replaces gradient hero when the recipe creator has uploaded a photo
- **Serving size selector** — scales ingredient quantities

---

## Required `Recipe` Type Additions

The detail screen requires two new fields on the `Recipe` type that the card does not need:

```typescript
ingredients: string[]   // e.g. ["200g firm tofu, cubed", "2 tbsp soy sauce", ...]
steps: string[]         // e.g. ["Heat a pan over medium heat.", "Add tofu and fry until golden.", ...]
```

These fields must be added to:
- `src/data/seedRecipes.ts` — `Recipe` type definition and all 20 seed recipes
- `docs/components/recipe-card-requirements.md` — section 6.4 (Recipe type fields) for completeness

---

## Technical Notes for Claude Code

- Screen path: `src/screens/app/RecipeDetailScreen.tsx`
- Route param: `{ recipeId: string }` — look up recipe from `SEED_RECIPES` by id in P0; Supabase query in P1
- Navigation: registered in `AppStack` as `RecipeDetail`; `RecipeCard.onPress` calls `navigation.navigate('RecipeDetail', { recipeId: recipe.id })`
- Gradient hero uses `expo-linear-gradient` with `MEAL_TYPE_GRADIENTS` — same constant as the card
- Back button: `TouchableOpacity` with `Ionicons` chevron-back icon, positioned absolutely over the gradient
- Save state: read from a parent-level state or context in P1; in P0 manage locally with `useState` and a TODO comment to sync
- `userAllergens` for the allergen warning: read from `useHealthProfile()` context directly in this screen
- Sticky footer: use a `View` outside the `ScrollView` with `position: absolute` at the bottom, or wrap in a `SafeAreaView` with the scroll content above

---
