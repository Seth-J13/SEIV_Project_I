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
| Todo lists management & ownership | Feature 2 |

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
| Sign out invalidates server session row and clears client session. | `auth.controller.js` (`logout`), `MenuBar.vue` | Feature 1; updated Feature 2 |

### Data Ownership & Isolation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Lists belong exclusively to the creating user (`userId = req.user.id`). | `list.controller.js` (`create`), `list.model.js` | Feature 2 |
| `GET /todo/lists` returns only lists owned by `req.user.id`. | `list.controller.js` (`findAll`) | Feature 2 |
| List queries, updates, and deletes scoped by user ID via `getAccessibleListOrNull`. | `authorization.js`, `list.controller.js` | Feature 2 |
| Cross-user access returns `404` with `{ message: "List with id=<id> not found." }` (never `403`). | `list.controller.js` (`update`, `delete`) | Feature 2 |
| Client-supplied `userId` on list creation is ignored and overwritten with `req.user.id`. | `list.controller.js` (`create`) | Feature 2 |

### Validation & Sorting Rules

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Registration requires first name, last name, email, username, and password. | `Register.vue`, `auth.controller.js` | Feature 1 |
| Email must match valid email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); error: "Enter a valid email address." | `frontend/src/config/validation.js` (`emailRules`), `Register.vue` | Feature 1 |
| Password minimum length is 8 characters. | `Register.vue`, `auth.controller.js` | Feature 1 |
| Passwords must match confirm password on registration. | `Register.vue` | Feature 1 |
| Duplicate username rejected with `400` ("Username is already taken."). | `auth.controller.js` | Feature 1 |
| Duplicate email rejected with `400` ("Email is already registered."). | `auth.controller.js` | Feature 1 |
| List name is required and trimmed before save (empty strings rejected). | `Dashboard.vue`, `list.controller.js` | Feature 2 |
| List name must be 100 characters or fewer (error: "List name must be 100 characters or fewer."). | `list.controller.js` | Feature 2 |
| Lists are returned in alphabetical order by name (`ASC`). | `list.controller.js` (`findAll`), `Dashboard.vue` | Feature 2 |

### UI & Navigation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Unauthenticated access to protected routes redirects to `login`. | `router.js` (`beforeEach`) | Feature 1 |
| Authenticated access to `login` or `register` redirects to `home`. | `router.js` (`beforeEach`) | Feature 1 |
| Full-screen auth layout for `login` and `register` (`MenuBar` hidden on auth routes). | `App.vue`, `MenuBar.vue`, `Login.vue`, `Register.vue` | Feature 1; updated Feature 2 |
| `MenuBar` displayed on protected routes with signed-in user name and Sign out action. | `App.vue`, `MenuBar.vue` | Feature 2 |
| Dashboard single view at `home` route with list CRUD dialogs and no sidebar split. | `Dashboard.vue`, `router.js` | Feature 2 |
| Empty lists state displays copy: "No lists yet. Create your first list." | `Dashboard.vue` | Feature 2 |
| Errors displayed via `<v-alert type="error">`. | `Login.vue`, `Register.vue`, `Dashboard.vue` | Feature 1; updated Feature 2 |
| Primary CTAs use class `oc-cta`. | `Login.vue`, `Register.vue`, `MenuBar.vue`, `Dashboard.vue` | Feature 1; updated Feature 2 |
