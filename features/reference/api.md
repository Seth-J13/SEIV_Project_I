# API Reference

**Status:** Integrated snapshot on `dev` (Feature 1).

Base mount path: `/todo` (Express server).

## Provenance

| Area | Introduced |
|------|------------|
| Authentication & Sessions (`/register`, `/login`, `/logout`) | Feature 1 |

## Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/todo/register` | No | Create a new user account |
| `POST` | `/todo/login` | No | Authenticate and return session payload |
| `POST` | `/todo/logout` | Yes | Invalidate current session token |

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

## Conventions

- Flat JSON responses (no `{ success, data }` envelope).
- Errors: `{ "message": "Human-readable explanation." }` with appropriate HTTP status code.
- Authenticated routes: `Authorization: Bearer <token>`.
