# Data Model Reference

**Status:** Integrated snapshot on `dev` (Features 1–3).

## Provenance

| Table / Area | Introduced |
|--------------|------------|
| `users` | Feature 1 |
| `sessions` | Feature 1 |
| `lists` | Feature 2 |
| `todos` | Feature 3 |

## Tables

### `users`

| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `fName` | STRING | Required |
| `lName` | STRING | Required |
| `email` | STRING | Required, unique |
| `username` | STRING(100) | Required, unique; stored lowercase |
| `password` | STRING(255) | Required; bcrypt hash only (defaultScope excludes) |
| `role` | STRING(20) | Default `worker` |

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
