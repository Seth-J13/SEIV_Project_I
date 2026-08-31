# Behavior & Rules Reference

**Living snapshot** of product rules currently in force on `dev`.

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md`.

| File | Role |
|------|------|
| [api.md](./api.md) | Routes / payloads |
| [data-model.md](./data-model.md) | Tables / columns |
| **This file** | Ownership, sort, validation, UI rules |

---

## Provenance

| Area | Introduced |
|------|------------|
| User authentication & sessions | Feature 1 |

---

## Rules in Force

### Authentication & Sessions

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Users authenticate with username and password (stored lowercase). | `auth.controller.js` (`POST /todo/login`, `POST /todo/register`) | Feature 1 |
| Passwords hashed with bcrypt (`SALT_ROUNDS = 10`); hashes excluded by `defaultScope`. | `user.model.js`, `auth.controller.js` | Feature 1 |
| Default role for new users is `worker`. | `user.model.js`, `auth.controller.js` | Feature 1 |
| Session token stored server-side with 24-hour lifetime. | `session.model.js`, `auth.controller.js` | Feature 1 |
| Non-expired session reused on subsequent logins by the same user. | `auth.controller.js` (`login`) | Feature 1 |
| Authenticated API requests require valid `Authorization: Bearer <token>` resolving to `req.user`. | `authenticate` middleware in `authorization.js` | Feature 1 |
| Missing or expired token on protected endpoints returns `401 Unauthorized`. | `authenticate` middleware in `authorization.js` | Feature 1 |
| Sign out invalidates server session row and clears client session. | `auth.controller.js` (`logout`), `Home.vue` | Feature 1 |

### Validation Rules

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Registration requires first name, last name, email, username, and password. | `Register.vue`, `auth.controller.js` | Feature 1 |
| Email must match valid email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); error: "Enter a valid email address." | `frontend/src/config/validation.js` (`emailRules`), `Register.vue` | Feature 1 |
| Password minimum length is 8 characters. | `Register.vue`, `auth.controller.js` | Feature 1 |
| Passwords must match confirm password on registration. | `Register.vue` | Feature 1 |
| Duplicate username rejected with `400` ("Username is already taken."). | `auth.controller.js` | Feature 1 |
| Duplicate email rejected with `400` ("Email is already registered."). | `auth.controller.js` | Feature 1 |

### UI & Navigation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Unauthenticated access to protected routes redirects to `login`. | `router.js` (`beforeEach`) | Feature 1 |
| Authenticated access to `login` or `register` redirects to `home`. | `router.js` (`beforeEach`) | Feature 1 |
| Full-screen auth layout for `login` and `register` (no `MenuBar` in Feature 1). | `App.vue`, `Login.vue`, `Register.vue` | Feature 1 |
| Dashboard placeholder displays user's first name and standalone Sign out button. | `Home.vue` | Feature 1 |
| Auth errors displayed via `<v-alert type="error">`. | `Login.vue`, `Register.vue` | Feature 1 |
| Primary CTAs use class `oc-cta`. | `Login.vue`, `Register.vue`, `Home.vue` | Feature 1 |
