# API Reference

**Status:** Integrated snapshot on `dev` (Features 1–4).

Base mount path: `/todo` (Express server).

## Provenance

| Area | Introduced |
|------|------------|
| Authentication & Sessions (`/register`, `/login`, `/logout`) | Feature 1 |
| Todo Lists (`/lists`, `/lists/:listId`) | Feature 2 |
| Todo Items (`/lists/:listId/todos`, `/todos/:id`) | Feature 3 |
| User Profile (`/users/:id`) | Feature 4 |

## Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/todo/register` | No | Create a new user account |
| `POST` | `/todo/login` | No | Authenticate and return session payload |
| `POST` | `/todo/logout` | Yes | Invalidate current session token |
| `GET` | `/todo/lists` | Yes | Fetch all lists owned by authenticated user |
| `POST` | `/todo/lists` | Yes | Create a new list |
| `PUT` | `/todo/lists/:listId` | Yes | Rename an owned list |
| `DELETE` | `/todo/lists/:listId` | Yes | Delete an owned list |
| `GET` | `/todo/lists/:listId/todos` | Yes | Fetch all todos in an owned list |
| `POST` | `/todo/lists/:listId/todos` | Yes | Add a todo to an owned list |
| `PUT` | `/todo/todos/:id` | Yes | Update a todo (title and/or completed) |
| `DELETE` | `/todo/todos/:id` | Yes | Delete an owned todo |
| `GET` | `/todo/users/:id` | Yes | Fetch authenticated user's profile |
| `PUT` | `/todo/users/:id` | Yes | Update authenticated user's profile |

### Register (`POST /todo/register`)

**Request body:**
```json
{
  "fName": "Jane",
  "lName": "Doe",
  "email": "jdoe@example.com",
  "username": "jdoe",
  "password": "password123"
}
```

**Success response (`201 Created`):**
```json
{
  "userId": 1,
  "username": "jdoe",
  "email": "jdoe@example.com",
  "fName": "Jane",
  "lName": "Doe",
  "role": "worker",
  "token": "<jwt>"
}
```

### Login (`POST /todo/login`)

**Request body:**
```json
{
  "username": "jdoe",
  "password": "password123"
}
```

**Success response (`200 OK`):**
```json
{
  "userId": 1,
  "username": "jdoe",
  "email": "jdoe@example.com",
  "fName": "Jane",
  "lName": "Doe",
  "role": "worker",
  "token": "<jwt>"
}
```

### Logout (`POST /todo/logout`)

**Headers:** `Authorization: Bearer <token>`

**Success response (`200 OK`):**
```json
{
  "message": "Successfully logged out."
}
```

### Get Lists (`GET /todo/lists`)

**Headers:** `Authorization: Bearer <token>`

**Success response (`200 OK`):**
```json
[
  {
    "id": 1,
    "name": "Groceries",
    "userId": 1,
    "createdAt": "2026-08-31T12:00:00.000Z",
    "updatedAt": "2026-08-31T12:00:00.000Z"
  }
]
```

### Create List (`POST /todo/lists`)

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "name": "Groceries"
}
```

**Success response (`201 Created`):**
```json
{
  "id": 1,
  "name": "Groceries",
  "userId": 1,
  "createdAt": "2026-08-31T12:00:00.000Z",
  "updatedAt": "2026-08-31T12:00:00.000Z"
}
```

### Rename List (`PUT /todo/lists/:listId`)

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "name": "Shopping"
}
```

**Success response (`200 OK`):**
```json
{
  "id": 1,
  "name": "Shopping",
  "userId": 1,
  "createdAt": "2026-08-31T12:00:00.000Z",
  "updatedAt": "2026-08-31T12:05:00.000Z"
}
```

### Delete List (`DELETE /todo/lists/:listId`)

**Headers:** `Authorization: Bearer <token>`

**Success response (`200 OK`):**
```json
{
  "message": "List deleted successfully."
}
```

### Get Todos for List (`GET /todo/lists/:listId/todos`)

**Headers:** `Authorization: Bearer <token>`

**Success response (`200 OK`):**
```json
[
  {
    "id": 10,
    "listId": 1,
    "title": "Buy milk",
    "completed": false,
    "userId": 1,
    "createdAt": "2026-08-31T12:00:00.000Z",
    "updatedAt": "2026-08-31T12:00:00.000Z"
  }
]
```

### Create Todo (`POST /todo/lists/:listId/todos`)

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "title": "Buy milk"
}
```

**Success response (`201 Created`):**
```json
{
  "id": 10,
  "listId": 1,
  "title": "Buy milk",
  "completed": false,
  "userId": 1,
  "createdAt": "2026-08-31T12:00:00.000Z",
  "updatedAt": "2026-08-31T12:00:00.000Z"
}
```

### Update Todo (`PUT /todo/todos/:id`)

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "title": "Buy oat milk",
  "completed": true
}
```

**Success response (`200 OK`):**
```json
{
  "id": 10,
  "listId": 1,
  "title": "Buy oat milk",
  "completed": true,
  "userId": 1,
  "createdAt": "2026-08-31T12:00:00.000Z",
  "updatedAt": "2026-08-31T12:05:00.000Z"
}
```

### Delete Todo (`DELETE /todo/todos/:id`)

**Headers:** `Authorization: Bearer <token>`

**Success response (`200 OK`):**
```json
{
  "message": "Todo deleted successfully."
}
```

### Get User Profile (`GET /todo/users/:id`)

**Headers:** `Authorization: Bearer <token>`

**Success response (`200 OK`):**
```json
{
  "id": 42,
  "fName": "Jane",
  "lName": "Doe",
  "email": "jane@example.com",
  "username": "jdoe",
  "role": "worker",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:05:00.000Z"
}
```

### Update User Profile (`PUT /todo/users/:id`)

**Headers:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "fName": "Jane",
  "lName": "Doe",
  "email": "jane@example.com",
  "username": "jdoe",
  "password": "newpassword123"
}
```

`password` is optional.

**Success response (`200 OK`):**
```json
{
  "id": 42,
  "fName": "Jane",
  "lName": "Doe",
  "email": "jane@example.com",
  "username": "jdoe",
  "role": "worker",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:05:00.000Z"
}
```

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "Human-readable explanation." }` with appropriate HTTP status code.
- Not found / not owned: `404` with `{ "message": "List with id=<id> not found." }`, `{ "message": "Todo with id=<id> not found." }`, or `{ "message": "User with id=<id> not found." }` (never leak existence with `403`).
- Authenticated routes: `Authorization: Bearer <token>`.
