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
| Todo items management & ownership | Feature 3 |
| User profile management | Feature 4 |
| Todo due date management | Feature 5 |

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
| Sign out invalidates server session row and clears client session. | `auth.controller.js` (`logout`), `MenuBar.vue` | Feature 1; updated Feature 2, Feature 4 |

### Data Ownership & Isolation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Lists belong exclusively to the creating user (`userId = req.user.id`). | `list.controller.js` (`create`), `list.model.js` | Feature 2 |
| `GET /todo/lists` returns only lists owned by `req.user.id`. | `list.controller.js` (`findAll`) | Feature 2 |
| List queries, updates, and deletes scoped by user ID via `getAccessibleListOrNull`. | `authorization.js`, `list.controller.js` | Feature 2 |
| Todos belong to exactly one list and one user (`userId = req.user.id`, `listId = list.id`). | `todo.controller.js`, `todo.model.js` | Feature 3 |
| Todo queries, updates, and deletes scoped by user ID via `getAccessibleTodoOrNull`. | `authorization.js`, `todo.controller.js` | Feature 3 |
| Adding a todo requires parent list ownership; cross-user attempts return `404`. | `authorization.js`, `todo.controller.js` (`create`) | Feature 3 |
| User profiles are accessible only by the authenticated user (`id = req.user.id`). | `authorization.js` (`getAccessibleUserOrNull`), `user.controller.js` | Feature 4 |
| Cross-user access returns `404` with `{ message: "List with id=<id> not found." }`, `{ message: "Todo with id=<id> not found." }`, or `{ message: "User with id=<id> not found." }` (never `403`). | `list.controller.js`, `todo.controller.js`, `user.controller.js` | Feature 2, Feature 3, Feature 4 |
| Client-supplied `userId` on list or todo creation is ignored and overwritten with `req.user.id`. | `list.controller.js` (`create`), `todo.controller.js` (`create`) | Feature 2, Feature 3 |
| Deleting a list cascades deletion to all contained todos. | `models/index.js` (`onDelete: CASCADE`), `list.model.js`, `todo.model.js` | Feature 3 |

### Validation & Sorting Rules

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Registration requires first name, last name, email, username, and password. | `Register.vue`, `auth.controller.js` | Feature 1 |
| Email must match valid email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); error: "Enter a valid email address." | `frontend/src/config/validation.js` (`emailRules`), `Register.vue`, `MenuBar.vue` | Feature 1; updated Feature 4 |
| Password minimum length is 8 characters. | `Register.vue`, `auth.controller.js`, `MenuBar.vue`, `user.controller.js` | Feature 1; updated Feature 4 |
| Passwords must match confirm password on registration and profile edit. | `Register.vue`, `MenuBar.vue` | Feature 1; updated Feature 4 |
| Duplicate username rejected with `400` ("Username is already taken."). | `auth.controller.js`, `user.controller.js` | Feature 1; updated Feature 4 |
| Duplicate email rejected with `400` ("Email is already registered."). | `auth.controller.js`, `user.controller.js` | Feature 1; updated Feature 4 |
| List name is required and trimmed before save (empty strings rejected). | `Dashboard.vue`, `list.controller.js` | Feature 2 |
| List name must be 100 characters or fewer (error: "List name must be 100 characters or fewer."). | `list.controller.js` | Feature 2 |
| Lists are returned in alphabetical order by name (`ASC`). | `list.controller.js` (`findAll`), `Dashboard.vue` | Feature 2 |
| Todo title is required and trimmed before save; empty strings rejected with `400` ("Todo title is required."). | `Dashboard.vue`, `todo.controller.js` | Feature 3 |
| Todo title must be 255 characters or fewer (error: "Todo title must be 255 characters or fewer."). | `todo.controller.js` | Feature 3 |
| New todos default to `completed: false`. | `todo.model.js`, `todo.controller.js` | Feature 3 |
| Todos are ordered incomplete first (`completed ASC`), then `createdAt ASC`. | `todo.controller.js` (`findAllByList`) | Feature 3 |
| Profile fields (`fName`, `lName`, `email`, `username`) are required and trimmed on update. | `MenuBar.vue`, `user.controller.js` | Feature 4 |
| Profile username is normalized to lowercase on save. | `user.controller.js` | Feature 4 |
| Password update is optional on profile edit; when provided, requires at least 8 characters. | `MenuBar.vue`, `user.controller.js` | Feature 4 |
| `dueDate` is optional on todo create and update (`null` means no due date). | `todo.controller.js`, `Dashboard.vue` | Feature 5 |
| `dueDate` must be a valid calendar date in `YYYY-MM-DD` format; invalid strings rejected with `400` ("Due date must be a valid date in YYYY-MM-DD format."). | `todo.controller.js`, `frontend/src/config/validation.js` | Feature 5 |
| Sending `dueDate: null` on `PUT` clears the due date; omitting `dueDate` leaves the existing value unchanged. | `todo.controller.js` | Feature 5 |

### UI & Navigation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Unauthenticated access to protected routes redirects to `login`. | `router.js` (`beforeEach`) | Feature 1 |
| Authenticated access to `login` or `register` redirects to `home`. | `router.js` (`beforeEach`) | Feature 1 |
| Full-screen auth layout for `login` and `register` (`MenuBar` hidden on auth routes). | `App.vue`, `MenuBar.vue`, `Login.vue`, `Register.vue` | Feature 1; updated Feature 2 |
| `MenuBar` displayed on protected routes with user icon dropdown menu containing user details, Edit Profile, and Log out actions. | `App.vue`, `MenuBar.vue` | Feature 2; updated Feature 4 |
| Standalone `Sign out` button is removed from the menu bar; logout resides in profile dropdown only. | `MenuBar.vue` | Feature 4 |
| Edit Profile modal allows editing user details and optional password update with inline validation. | `MenuBar.vue` | Feature 4 |
| Successful profile update refreshes `localStorage` `user` and dispatches `user-logged-in` event to update UI. | `MenuBar.vue` | Feature 4 |
| Dashboard single view at `home` route with list CRUD dialogs and no sidebar split. | `Dashboard.vue`, `router.js` | Feature 2 |
| Empty lists state displays copy: "No lists yet. Create your first list." | `Dashboard.vue` | Feature 2 |
| Each list row includes an Items icon (`aria-label="Items"`) opening a list-items dialog. | `Dashboard.vue` | Feature 3 |
| List-items dialog shows empty state copy: "No todos in this list yet." | `Dashboard.vue` | Feature 3 |
| Todo management (add/edit/delete) operates via nested dialogs. | `Dashboard.vue` | Feature 3 |
| Completed todos show struck-through or muted styling. | `Dashboard.vue` | Feature 3 |
| Due dates displayed in readable formatted form (e.g. `Jul 15, 2026`) on todo row. | `Dashboard.vue`, `validation.js` (`formatDueDate`) | Feature 5 |
| Incomplete todos past due date in local browser calendar display overdue styling (`text-error`). Completed todos do not show overdue styling even if past due. | `Dashboard.vue`, `validation.js` (`isTodoOverdue`) | Feature 5 |
| Errors displayed via `<v-alert type="error">`. | `Login.vue`, `Register.vue`, `Dashboard.vue`, `MenuBar.vue` | Feature 1; updated Feature 2; updated Feature 3; updated Feature 4 |
| Primary CTAs use class `oc-cta`. | `Login.vue`, `Register.vue`, `MenuBar.vue`, `Dashboard.vue` | Feature 1; updated Feature 2; updated Feature 3; updated Feature 4 |
