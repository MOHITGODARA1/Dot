# Dot Backend

Node.js + Express API for Dot (JavaScript only).

## Stack

- Express.js
- MongoDB (Mongoose)
- JWT authentication
- Socket.IO realtime connection updates
- dotenv, express-validator, helmet, cors

## Setup

```bash
cd backend
cp .env.example .env
npm install
```

Set `MONGODB_URI` in `.env`:
- `memory` — in-memory MongoDB replica set for local development (transactions enabled)
- `mongodb://127.0.0.1:27017/dot` — local MongoDB instance
- or any MongoDB Atlas connection string

## Run

```bash
# development (auto-reload)
npm run dev

# production
npm start
```

API base: `http://localhost:8080/api`

Interactive sign-in is Google OAuth only. The backend issues app JWTs after Google verifies the user's identity; connection routes accept those JWTs and derive the current account from the token.

Access JWTs expire after 15 minutes by default and carry the session's absolute expiration, so they cannot outlive it. A random refresh token is stored only as a SHA-256 hash in MongoDB and sent to the browser in an HttpOnly cookie. Refresh tokens rotate on use and keep a fixed 20-day session expiration. Set `COOKIE_SAME_SITE=none` for a cross-site production frontend; production cookies always use `Secure`. Refresh and logout requests also require the configured frontend `Origin` and CSRF header.

> Note: macOS often uses port 5000 for AirPlay Receiver — this project defaults to **8080**.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/auth/refresh` | HttpOnly refresh cookie + frontend Origin | Rotate session and receive a new access JWT |
| POST | `/api/auth/logout` | HttpOnly refresh cookie + frontend Origin | Revoke the current session and clear the cookie |
| GET | `/api/auth/google` | No | Start Google OAuth |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |
| GET | `/api/connections/me` | Bearer | Current connection status |
| POST | `/api/connections/code` | Bearer | Get or create the active 10-minute code |
| POST | `/api/connections/connect` | Bearer | Connect using `{ "code": "ABC234" }` |
| GET | `/api/tasks?date=YYYY-MM-DD` | Bearer | Read both partners' tasks for a day |
| POST | `/api/tasks` | Bearer | Add a task to the selected day |
| PATCH | `/api/tasks/:taskId` | Bearer | Update your own task |
| DELETE | `/api/tasks/:taskId` | Bearer | Delete your own task |

Connection creation and refresh-token rotation use MongoDB transactions. Use MongoDB Atlas or another replica set; standalone MongoDB servers do not support the required transactions. Authenticated Socket.IO clients receive `connection:updated` when either account connects.

Task dates are shared as UTC calendar dates. Tasks remain stored until a user deletes their own task. Both connected partners can read the shared day's list; edits and deletes are restricted to the task creator. Authenticated clients receive `tasks:updated` for live list refreshes.

Run the two-account connection integration test with `npm test`.

## Structure

```text
src/
├── config/        # env + database
├── controllers/
├── middleware/    # auth, validation, errors
├── models/
├── routes/
├── services/
├── utils/
├── app.js
└── server.js
```
