# Door OS Backend

Express + TypeScript + MongoDB/Mongoose + JWT + Socket.IO API.

## Start
1. Install Node.js 20+ and run MongoDB locally or use a hosted MongoDB URI.
2. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`.
3. Run `npm install`, then `npm run dev`.
4. API health: `GET http://localhost:4000/api/health`.

## Routes
- `POST /api/auth/register` `{name,email,password}`
- `POST /api/auth/login` `{email,password}`
- `GET /api/auth/me` (Bearer token)
- `GET|PUT /api/preferences`
- `GET|POST /api/apps`; `GET|PUT|DELETE /api/apps/:id`
- `GET|POST /api/fs`; `GET|PUT|DELETE /api/fs/:id`
- `POST /api/assistant` `{prompt}`

All routes except auth register/login and health require `Authorization: Bearer <token>`.

## Socket.IO
Connect with `io("http://localhost:4000",{auth:{token}})`. Events:
- client -> server: `app:opened`, `window:moved`, `desktop:sync`
- server -> same user's other sessions: `app:opened`, `window:moved`, `desktop:sync`
Events are scoped to the authenticated user room.

## Notes
This is a runnable starter backend. The assistant route uses a deterministic app-intent matcher; connect a trusted LLM provider server-side if you want generated app code. The virtual filesystem stores text content in MongoDB and is not a host OS filesystem. Add tests, observability, backups, and deployment-specific rate limits before production.
