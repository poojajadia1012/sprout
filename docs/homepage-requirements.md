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
- A large, prominent **"Generate Recipe"** button sits below the header
- Always visible without scrolling — above the feed
- Tapping it triggers the recipe generation flow (equipment modal on first use, then generation)
- Button uses the app's primary brand color with clear contrast

---

## 4.4 Recipe Feed

### P0
- Vertical scrolling feed of recipe cards below the generate button
- Feed is populated with **seed recipes** pre-loaded by the team, ordered editorially
- Feed loads **10 cards per page** with a **"Load more"** button at the bottom
- There is no trending logic in P0 — the feed is the seed recipe catalogue

#### P1
- Switch to **trending recipes** (most generated globally, weighted by the user's cuisine preferences) once real usage data exists
- Switch to **infinite scroll** as the app grows and social features are added
- Personalise the feed algorithmically based on the user's health profile, cuisine preferences, saved recipes, and behaviour

---

## 4.5 Recipe Card Design

### P0
Each recipe card in the feed displays:

- **Background** — branded gradient card (no photo in P0)
  - Gradient color is tied to meal type:
    - Breakfast → warm yellow/orange
    - Lunch → fresh green
    - Dinner → deep purple/indigo
    - Snack → soft coral
- **Recipe name** — large, bold, prominent
- **Short description** — 1-2 lines, e.g. "A creamy high-protein bowl ready in 15 minutes"
- **Macro summary** — protein / carbs / fat in grams, displayed as pill badges
- **Prep & cook time** — e.g. "10 min prep · 20 min cook"
- **Dietary tags** — e.g. "Vegetarian", "Vegan" as small label chips
- **Save button** — bookmark icon, saves to user's collection

#### P1
- Add **Like button** — heart icon with like count (meaningful once there are multiple users)
- Users can upload their own photo or video to a recipe, replacing the gradient card
- AI-generated image option for premium users

---

## 4.6 Card Interactions

### P0
- **Tap card** → opens full recipe detail screen
- **Save / bookmark** → saves recipe to user's default collection, confirms with a small toast notification
- **Save count** is visible on each card

#### P1
- **Like / heart** → toggles like, updates count optimistically
- **Share** — share recipe link externally
- **Comment** — open comment thread on a recipe

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
- Bottom tab bar is persistent across all main screens
- Profile tab routes to the existing Settings screen

---

## 4.8 Empty States

### P0
- If feed has no data → show a friendly prompt to generate their first recipe
- If user has no saved recipes → show a friendly prompt to generate their first recipe
- If generation limit is reached → show a friendly message with reset time

---

## Technical Notes for Claude Code

- Use a `recipes` table to store all generated recipes with fields: `id`, `name`, `description`, `meal_type`, `protein_g`, `carbs_g`, `fat_g`, `prep_time`, `cook_time`, `dietary_tags` (array), `save_count`, `created_at`
- Macros are stored as explicit columns (`protein_g`, `carbs_g`, `fat_g`) — not JSON — for efficient querying and indexing
- No `like_count` column in P0 — add in P1 when likes are introduced
- Feed query in P0: `SELECT * FROM recipes ORDER BY created_at ASC LIMIT 10 OFFSET {page * 10}` (editorial seed order)
- Gradient colors should be defined as constants tied to `meal_type` — applied consistently across the app
- Save actions should update count optimistically on the client, then sync to the server
- Seed recipes should be inserted into the `recipes` table at setup — aim for 20-30 to give the feed substance on day one
- Bottom tab bar should use React Navigation's tab navigator
- Use Unsplash API as a fallback for P1 photo matching when users haven't uploaded their own image

---

## Evolution Path

| Phase | Feed Content | Card Media | Scroll |
|---|---|---|---|
| P0 | Editorial seed recipes | Branded gradient | Paginated |
| P1 | Trending (global, weighted by cuisine preferences) | User photos | Infinite scroll |
| P2 | Personalised algorithm (health profile + cuisine preferences + behaviour) | User photos + videos | Infinite scroll |
| P3 | Social feed (recipes from followed users mixed with trending) | User photos + videos | Infinite scroll |
| P4 | Full social (follow, discover people, activity feed, comments) | User photos + videos + reels | Infinite scroll |

---
