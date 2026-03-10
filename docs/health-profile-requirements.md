# Sprout — Health Profile Setup
### Scope: P0 (MVP) — Ready for development

---

## Overview

This document covers the health profile onboarding flow that appears immediately after a user completes registration. It does not include equipment setup, recipe generation, or any other product areas — those will be handed off separately.

The health profile is the foundation of all personalisation in the app. It must be completed before the user can access the main app.

---

## 2.1 When It Appears

### P0
- Health profile setup is triggered immediately after successful sign-up and email verification
- Presented as a **multi-step onboarding flow** — one topic per screen
- Cannot be skipped — user cannot access the main app until all steps are complete
- Progress is saved at each step so users can resume if they close the app mid-flow
- A progress indicator (e.g. step 1 of 5) is shown at the top of each screen

---

## 2.2 Basic Physical Info

### P0
- User provides the following on a single screen:
  - **Date of birth** — date picker
  - **Biological sex** — single select: Male / Female / Prefer not to say
  - **Height** — numeric input
  - **Weight** — numeric input
- User selects their preferred unit system at the top of this screen:
  - **Imperial** (ft/in, lbs) or **Metric** (cm, kg)
  - Unit preference is saved and applied throughout the app
- All four fields are required to proceed
- A subtitle explains why this info is needed: age, height, and weight are used to estimate how many calories the body needs — this informs how recipes are sized for the user's goal

---

## 2.3 Health Goals

### P0
- User selects **one primary health goal** from the following options (large tappable cards):
  - 🥗 Eat healthier / more balanced
  - ⚖️ Weight loss
  - 💪 Muscle gain
  - ➡️ Maintain weight
- Selection is required to proceed
- The chosen goal directly influences how calorie targets and macro splits are calculated internally (not shown to the user — see section 2.6)

---

## 2.4 Dietary Mode

### P0
- User is informed that **all recipes on the app are vegetarian** — no meat, fish, or poultry
- User is asked one simple question: **"Do you follow a vegan diet?"**
  - **No** — eggs and dairy are permitted in recipes (default)
  - **Yes** — all animal products including eggs and dairy are excluded from recipes
- This is a single toggle/binary choice, not a multi-select

---

## 2.5 Cuisine Preferences

### P0
- User selects **one or more cuisines** they enjoy from a predefined list (tappable chips):
  - 🇮🇳 Indian, 🫒 Mediterranean, 🇮🇹 Italian, 🌮 Mexican, 🇨🇳 Chinese, 🇯🇵 Japanese, 🇹🇭 Thai, 🇲🇪 Middle Eastern, 🇺🇸 American, 🌍 African
- Multiple selections allowed
- A **"No preference — surprise me"** option clears all selections and signals no cuisine filter
- This step is optional — user can proceed with "No preference" if they don't want to filter by cuisine
- Selected cuisines are used to prioritise recipes shown to the user

---

## 2.6 Allergies & Ingredient Avoidances

### P0
- User is shown a **predefined list of the 14 major allergens** as tappable chips/tags:
  - Gluten, Crustaceans, Eggs, Fish, Peanuts, Soybeans, Dairy, Tree nuts, Celery, Mustard, Sesame, Sulphites, Lupin, Molluscs
- Multiple selections allowed
- This step is **optional** — user can proceed without selecting anything
- A "None" option is available to explicitly confirm no allergies
- Selected allergens are strictly excluded from all generated recipes
- Tapping "Finish" on this screen saves the full health profile and routes the user to the main app

---

## 2.7 Calorie & Macro Targets (Internal Only — Not Shown to User)

### P0
- Calorie and macro targets are calculated **silently in the background** when the profile is saved — they are never shown to the user
- The app only suggests recipes, it does not track everything the user eats. Showing a specific calorie target would create false precision and is not appropriate for this use case
- Calculation uses the **Mifflin-St Jeor formula**:
  - For men: (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5
  - For women: (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161
  - Apply an activity multiplier of **1.55** (moderately active) as default
  - Adjust based on health goal:
    - Weight loss: subtract 400 kcal from TDEE
    - Muscle gain: add 250 kcal to TDEE
    - Maintain weight / Eat healthier: use TDEE as-is
- Macro split is set automatically based on health goal:
  - **Weight loss:** 40% protein / 30% carbs / 30% fat
  - **Muscle gain:** 35% protein / 45% carbs / 20% fat
  - **Maintain weight:** 30% protein / 40% carbs / 30% fat
  - **Eat healthier:** 25% protein / 50% carbs / 25% fat
- These values are stored in the database and used by the recipe engine — the user has no UI to view or override them

---

## 2.8 Editing the Health Profile

### P0
- Users can edit all health profile fields at any time via **Settings → Health Profile**
- Changes to physical info or health goal trigger a **silent recalculation** of calorie/macro targets
- Changes take effect immediately on subsequent recipe generations

---

## 2.9 Recipe Browsing Filters (Not Part of Onboarding)

- Cooking time and number of servings are **not** onboarding preferences — they change per session
- These will be available as filters on the recipe browsing screen (separate feature)

---

## Technical Notes

- Store health profile in a `health_profiles` table linked to `users` by `user_id`
- Fields: `user_id`, `date_of_birth`, `biological_sex`, `height_cm`, `weight_kg`, `unit_preference`, `health_goal`, `is_vegan`, `allergens` (text array), `cuisine_preferences` (text array), `calorie_target` (auto-calculated), `protein_pct` (auto-calculated), `carbs_pct` (auto-calculated), `fat_pct` (auto-calculated), `created_at`, `updated_at`
- Always store height and weight in metric internally — convert for display based on `unit_preference`
- Calorie and macro targets are always auto-calculated — there is no manual override
- Track onboarding progress using a `status` field on the `users` table:
  - `registered` — signed up but health profile not complete
  - `health_profile_done` — reserved for future use (equipment setup)
  - `active` — health profile complete, full access to main app
- After health profile is saved, update `users.status` from `registered` → `active`
- The app checks `users.status` on every launch to route the user:
  - `registered` → health profile onboarding flow
  - `active` → main app

---
