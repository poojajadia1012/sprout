# Recipe App — Registration & Account Creation
### Scope: P0 (MVP) — Ready for development

---

## Overview

This document covers the full registration, authentication, and account management workflow for the MVP. It does not include health profile setup, recipe generation, or any other product areas — those will be handed off separately as each phase is built.

---

## 1.1 Sign-Up Methods

### P0
- Users can sign up with **Google SSO**
- Users can sign up with **email & password**
- Basic info collected at sign-up: **first name, last name, email, password**
- Password must meet minimum security requirements (8+ characters, at least one number or symbol)

### P1 (out of scope for now)
- Phone number + OTP sign-up via SMS provider (e.g. Twilio)

---

## 1.2 Email Verification

### P0
- After email sign-up, user receives a **verification email** before accessing the app
- Email contains a **magic link** that verifies the account and logs the user in
- Unverified accounts cannot access the app
- User can request a **resend** of the verification email
- Verification links expire after **24 hours**
- Google SSO accounts are considered pre-verified — no additional verification step required

---

## 1.3 Login

### P0
- Users can log in with **Google SSO** or **email & password**
- Failed login attempts show a clear, generic error message (do not reveal whether the email exists)
- Users stay logged in across sessions via a persistent auth token

---

## 1.4 Password Recovery

### P0
- Users can request a **password reset** from the login screen
- A reset link is sent to the user's registered email address
- Reset links expire after **1 hour**
- After a successful reset, the user is redirected to the login screen

---

## 1.5 Post Sign-Up Flow

### P0
- After successful sign-up and email verification, users are redirected to a **health profile setup flow**
- This flow is mandatory — users cannot access the main app until it is complete
- (Health profile setup requirements will be handed off separately as the next build phase)
- For the purposes of this phase, after registration is complete redirect the user to a placeholder screen that says "Health Profile Setup — Coming Soon"

---

## 1.6 Account Deletion

### P0
- Users can delete their account from within the app (e.g. Settings)
- Deletion is **soft** — account and data are retained for **30 days** before permanent removal
- User receives a confirmation email when deletion is initiated
- User can **reactivate** their account within the 30-day window simply by logging back in
- After 30 days, all personal data is permanently and irreversibly deleted

---

## Technical Notes for Claude Code

- Use **Supabase Auth** or **Firebase Auth** for authentication — both support Google SSO, email/password, magic links, and persistent sessions out of the box
- Store user records in a `users` table with fields: `id`, `first_name`, `last_name`, `email`, `auth_provider` (google | email), `verified_at`, `deleted_at` (nullable, for soft delete), `created_at`
- Soft delete: set `deleted_at` timestamp on deletion request; run a scheduled job to hard delete records where `deleted_at` is older than 30 days
- All auth state should be managed via the auth provider's SDK — do not roll your own token management
- The app is mobile-first (iOS & Android) — build with **React Native** or **Expo**

---

