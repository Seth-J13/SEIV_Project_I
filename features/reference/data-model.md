# Data Model Reference

**Status:** Integrated snapshot on `dev` (Features 1–5).

## Provenance

| Table / Area | Introduced |
|--------------|------------|
| `users` | Feature 1; updated Feature 4 |
| `sessions` | Feature 1 |
| `lists` | Feature 2 |
| `todos` | Feature 3; updated Feature 5 |

## Tables

### `users`

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `fName` | STRING | Required; editable via `PUT /todo/users/:id` |
| `lName` | STRING | Required; editable via `PUT /todo/users/:id` |
| `email` | STRING | Required, unique; editable via `PUT /todo/users/:id` |
| `username` | STRING(100) | Required, unique; stored lowercase; editable via `PUT /todo/users/:id` |
| `password` | STRING(255) | Required; bcrypt hash only (defaultScope excludes); optional on `PUT /todo/users/:id` |
| `role` | STRING(20) | Default `worker` (read-only) |

### `sessions`

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `token` | STRING(512) | Required |
| `email` | STRING | Required |
| `expirationDate` | DATE / DATETIME | Required (24h TTL) |
| `userId` | INTEGER FK | Required, references `users.id` |

### `lists`

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `name` | STRING(100) | Required; max 100 chars |
| `userId` | INTEGER FK | Required, references `users.id` |
| `createdAt` | DATE | Sequelize timestamps |
| `updatedAt` | DATE | Sequelize timestamps |

### `todos`

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `listId` | INTEGER FK | Required, references `lists.id`; cascade on list delete |
| `title` | STRING(255) | Required; max 255 chars |
| `completed` | BOOLEAN | Default `false` |
| `dueDate` | DATEONLY | Nullable; optional on create/update (`YYYY-MM-DD`) |
| `userId` | INTEGER FK | Required, references `users.id` |
| `createdAt` | DATE | Sequelize timestamps |
| `updatedAt` | DATE | Sequelize timestamps |

## Associations

- `User.hasMany(Session, { as: "sessions", foreignKey: "userId", onDelete: "CASCADE" })`
- `Session.belongsTo(User, { as: "user", foreignKey: "userId" })`
- `User.hasMany(List, { as: "lists", foreignKey: "userId", onDelete: "CASCADE" })`
- `List.belongsTo(User, { as: "user", foreignKey: "userId" })`
- `List.hasMany(Todo, { as: "todos", foreignKey: "listId", onDelete: "CASCADE" })`
- `Todo.belongsTo(List, { as: "list", foreignKey: "listId" })`
- `User.hasMany(Todo, { as: "todos", foreignKey: "userId", onDelete: "CASCADE" })`
- `Todo.belongsTo(User, { as: "user", foreignKey: "userId" })`
