# Sprout — Homepage
### Scope: P0 (MVP) — Ready for development

---

## Overview

The homepage is the main landing screen after onboarding. It is designed as a **social-first discovery feed** — visually engaging, scrollable, and interactive. The primary goal is to surface recipes users want to make while keeping the Generate Recipe action always accessible.

---

## 4.1 Layout Structure

### P0
The homepage is composed of three layers from top to bottom:

1. **Header** — motivational greeting tied to health goal
2. **Generate Recipe button** — prominent, always visible below the header
3. **Scrollable recipe feed** — paginated cards below the generate button

---

## 4.2 Header & Greeting

### P0
- Displays a **motivational message tied to the user's health goal** instead of a generic greeting
- Examples:
  - Weight loss: *"Every healthy meal is a step forward 💪"*
  - Muscle gain: *"Fuel your gains today 🏋️"*
  - Maintain weight: *"Consistency is everything 🌿"*
  - Eat healthier: *"Good food, good mood 🥗"*
- Message is static per health goal in P0 — rotates daily in P1
- User's first name appears below the motivational message in smaller text

---

## 4.3 Generate Recipe Button

### P0
- A large, prominent **"✨ Generate Recipe"** button sits below the header
- Always visible without scrolling — above the feed
- Tapping it triggers the recipe generation flow (equipment modal on first use, then generation)
- Button uses the app's primary brand color (`#FF6B35`) with an orange glow shadow

---

## 4.4 Recipe Feed

### P0
- Vertical scrolling feed of recipe cards below the generate button
- Feed is populated with **editorial seed recipes** pre-loaded by the team, ordered editorially
- Feed loads **10 cards per page** with a **"Load more"** button at the bottom
- There is no trending logic in P0 — the feed is the seed recipe catalogue

#### Dietary Filtering (P0)
The feed is filtered client-side against the user's health profile before display:
1. **Vegan mode** — if `health_profiles.is_vegan = true`, only recipes tagged `'Vegan'` are shown; all other recipes are hidden
2. **Allergen warnings** — recipes are **never hidden** based on allergens; instead, a warning is shown on any card that contains an allergen matching the user's allergen list
   - Rationale: hiding recipes is paternalistic and breaks down in social contexts (P2+) where users may want to see recipes from people they follow regardless of allergen

#### Dietary Tag Rules
- A recipe tagged `'Vegan'` does **not** also carry the `'Vegetarian'` tag (vegan implies vegetarian)
- All Sprout recipes are vegetarian by definition — the `'Vegetarian'` tag is shown only on non-vegan vegetarian recipes

### P1
- Switch to **trending recipes** (most saved globally, weighted by the user's cuisine preferences) once real usage data exists
- Switch to **infinite scroll** as the app grows

---

## 4.5 Recipe Card

The recipe card is a **reusable component** with its own specification. See [`docs/components/recipe-card-requirements.md`](components/recipe-card-requirements.md) for the full card spec including layout, interactions, and the required `Recipe` type fields.

The homepage feed renders one `RecipeCard` component per recipe in the list.

---

## 4.6 Card Interactions

See [`docs/components/recipe-card-requirements.md`](components/recipe-card-requirements.md) for the full interaction spec. The homepage feed is responsible for managing save (and eventually like) state and passing it down to each `RecipeCard` as props.

---

## 4.7 Bottom Navigation

### P0
Standard mobile bottom tab bar with 4 tabs:

| Tab | Icon | Destination |
|---|---|---|
| Home | 🏠 | Homepage / feed |
| Search | 🔍 | Search & discovery screen |
| Saved | 🔖 | User's saved collections |
| Profile | 👤 | User profile & settings |

- Active tab is highlighted with the app's primary brand color
- Bottom tab bar is persistent across all main app screens
- Profile tab routes to the Settings screen

---

## 4.8 Empty States

### P0
- If feed has no data → show a friendly prompt to generate their first recipe
- If user has no saved recipes → show a friendly prompt to generate their first recipe
- If generation limit is reached → show a friendly message with reset time

---

## Technical Notes for Claude Code

- Feed is populated from `src/data/seedRecipes.ts` in P0 — no Supabase query needed yet
- Vegan filter runs client-side via `useMemo` keyed on `existingProfile`
- Allergen warning logic lives in `RecipeCard` — pass `userAllergens: string[]` from HomeScreen as a prop
- `recipes` table schema (for when AI-generated recipes are introduced): `id`, `name`, `description`, `meal_type`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `prep_time`, `cook_time`, `dietary_tags[]`, `allergens[]`, `cuisine`, `save_count`, `like_count`, `created_at`
- Macros stored as **explicit columns** (`protein_g`, `carbs_g`, `fat_g`, `calories`) — not JSON — for efficient querying and indexing
- Save actions update count optimistically on the client, then sync to Supabase
- Gradient colours defined in `src/data/seedRecipes.ts` as `MEAL_TYPE_GRADIENTS` — shared with RecipeCard and RecipeDetail header

---

## Evolution Path

| Phase | Feed Content | Card Media | Interactions | Scroll |
|---|---|---|---|---|
| P0 | Editorial seed recipes | Branded gradient | Save only | Paginated |
| P0.5 | Editorial seed recipes | Branded gradient | Save + Like | Paginated |
| P1 | Trending (global, weighted by cuisine preferences) | User photos | Save + Like | Infinite scroll |
| P2 | Personalised algorithm (health profile + behaviour) | User photos + videos | Save + Like + Comment | Infinite scroll |
| P3 | Social feed (followed users + trending) | User photos + videos | Full social | Infinite scroll |
| P4 | Full social (follow, discover, activity feed) | User photos + videos + reels | Full social | Infinite scroll |

---
