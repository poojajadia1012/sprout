# Sprout — Project Memory

## Standing Rules
- Update MEMORY.md in every GitHub commit — same commit, never separate
- At the start of each new session, read MEMORY.md first before reading any other file
- Before building any feature, read the relevant requirements doc in docs/
- Walk through architecture approach and get sign-off before building anything significant

## Product
Sprout — a vegetarian recipe app powered by AI (Anthropic Claude API). All recipes are vegetarian. Vegan mode excludes dairy/eggs.

## Stack
- React Native + Expo SDK 54, TypeScript
- Supabase (auth + database)
- Anthropic Claude API (AI recipe generation — not yet integrated)
- `@react-navigation/native-stack` — installed
- `@react-navigation/bottom-tabs` — installed
- `react-native-svg` — installed (used for Google logo)
- `expo-linear-gradient` — installed (used for recipe cards)
- `@expo/vector-icons` (Ionicons) — available in Expo

## Key File Paths
- `src/App.tsx` — root, wraps AuthProvider + HealthProfileProvider + NavigationContainer
- `src/navigation/RootNavigator.tsx` — routes between Auth/Onboarding/App based on session + status
- `src/navigation/AppStack.tsx` — main app stack, AppTabs as root + edit screens on top
- `src/navigation/AppTabs.tsx` — bottom tab bar (Home, Search, Saved, Profile)
- `src/navigation/AuthStack.tsx` — auth screens
- `src/navigation/HealthProfileStack.tsx` — onboarding wizard (no longer wraps HealthProfileProvider — moved to App.tsx)
- `src/context/AuthContext.tsx` — exports DbUser, useAuth
- `src/context/HealthProfileContext.tsx` — exports HealthProfile, useHealthProfile, calculateCalories, getMacros
- `src/screens/app/HomeScreen.tsx` — homepage with motivational header, Generate button, recipe feed
- `src/screens/app/SettingsScreen.tsx` — Profile tab + settings (Sign Out = PrimaryButton)
- `src/screens/app/EditHealthProfileScreen.tsx` — hub for health profile editing
- `src/screens/app/SearchScreen.tsx` — placeholder
- `src/screens/app/SavedScreen.tsx` — placeholder
- `src/components/recipe/RecipeCard.tsx` — gradient card with macros, tags, save button
- `src/components/common/` — PrimaryButton, SecondaryButton, LoadingOverlay
- `src/components/auth/GoogleSignInButton.tsx` — uses GoogleLogo SVG
- `src/components/common/GoogleLogo.tsx` — multicolor Google G SVG
- `src/data/seedRecipes.ts` — 20 seed recipes + MealType type + MEAL_TYPE_GRADIENTS

## Database Tables
- `users` — id, first_name, last_name, email, auth_provider, verified_at, deleted_at, created_at, status ('registered' | 'active')
- `health_profiles` — user_id, date_of_birth, biological_sex, height_cm, weight_kg, unit_preference, health_goal, is_vegan, cuisine_preferences[], allergens[], calorie_target, protein_pct, carbs_pct, fat_pct, created_at, updated_at
- `recipes` — TO BE CREATED: id, name, description, meal_type, protein_g, carbs_g, fat_g, prep_time, cook_time, dietary_tags[], save_count, created_at

## Navigation Structure
```
RootNavigator
├── AuthStack (no session)
├── AuthStack → VerifyEmail (email unverified)
├── HealthProfileStack (status = 'registered') — 5-step onboarding wizard
└── AppStack (status = 'active')  — NativeStack
    ├── AppTabs  ← root (bottom tab bar)
    │   ├── Home → HomeScreen
    │   ├── Search → SearchScreen (placeholder)
    │   ├── Saved → SavedScreen (placeholder)
    │   └── Profile → SettingsScreen
    ├── Settings (legacy route — kept for deep linking)
    ├── EditHealthProfile (hub)
    ├── EditBasicInfo
    ├── EditHealthGoal
    ├── EditDietaryMode
    ├── EditCuisinePreferences
    └── EditAllergens
```
Note: SettingsScreen is rendered as the Profile tab. navigation.navigate('EditHealthProfile') works because React Navigation bubbles up to AppStack. TypeScript typing for SettingsScreen's nav prop is loose — acceptable for now, flag before P1.

## Onboarding Flow
- `registered` → HealthProfileStack (5-step wizard)
- After step 5 (Allergies), saveProfile() sets status → 'active' → RootNavigator routes to AppStack
- Equipment setup is NOT part of onboarding — modal on first "Generate Recipe" tap

## Homepage (Built — P0)
- Header: motivational message by health_goal + first name
- Generate Recipe button: orange, prominent, above feed
- Feed: seed recipes paginated (10/page), Load More button
- Recipe cards: LinearGradient by meal_type, macros pills, dietary tags, save toggle
- Health profile loaded in HomeScreen via useEffect → Supabase fetch if not in context
- Meal type gradients: Breakfast=yellow/amber, Lunch=green, Dinner=indigo, Snack=coral
- Save count hidden when 0

## UI Conventions
- Primary color: `#FF6B35` (orange)
- Border/divider: `#E5E7EB`
- Body text: `#6B7280`
- Dark text: `#1A1A1A`
- Background: `#fff` (screens), `#F9FAFB` (feed)
- Button paddingVertical: 18
- Button containers: paddingHorizontal: 16 min (never full-width buttons)
- Border radius: 12 for buttons, 16–20 for cards/sections

## Pending / Known Issues
- SettingsScreen navigation type mismatch (works at runtime, TypeScript loose) — fix before P1
- Generate Recipe button has no action yet — equipment modal to be built
- Search and Saved tabs are placeholders
- `recipes` table not yet created in Supabase — needed for generated recipes
