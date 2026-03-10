# Sprout 🌱

A personalised vegetarian recipe app built with React Native (Expo).

## What it does

Sprout suggests vegetarian recipes tailored to each user's health goals, dietary preferences, and cuisine tastes. All recipes are vegetarian. Users can optionally follow a fully vegan diet.

## Current features

- Email sign-up and login with email verification
- Google Sign-In (OAuth)
- Password reset via email
- Health profile onboarding (5-step wizard):
  - Basic physical info (DOB, sex, height, weight)
  - Health goal (eat healthier, lose weight, build muscle, maintain, recompose)
  - Dietary mode (vegetarian or vegan)
  - Cuisine preferences
  - Allergy and ingredient avoidances
- Calorie and macro targets calculated silently in the background

## Tech stack

- **React Native** (Expo SDK 54)
- **TypeScript**
- **Supabase** — auth, database, row-level security
- **Google OAuth** — sign in with Google

## Getting started

1. Clone the repo
2. Run `npm install`
3. Create a `.env.local` file with your own Supabase and Google credentials (see `.env.example`)
4. Run `NODE_OPTIONS="--no-experimental-require-module" npx expo start`

## Project structure

```
src/
├── context/        # Auth and health profile state management
├── navigation/     # Stack navigators (Auth, HealthProfile, App)
├── screens/
│   ├── auth/       # Login, signup, verify email, reset password
│   ├── onboarding/ # Health profile setup wizard
│   └── app/        # Main app screens
├── components/     # Reusable UI components
├── hooks/          # Custom hooks
└── lib/            # Supabase client, env config, validation
docs/               # Product requirements
```
