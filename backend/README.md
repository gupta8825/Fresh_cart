# FreshCart Backend (structure only — not implemented)

Node.js + Express + MongoDB/Mongoose backend scaffold.

## Status
- Folder structure created. No business logic, controllers, schemas, auth, or payments implemented yet.

## Structure
- `src/config/`: database, env, cloud storage configuration.
- `src/controllers/`: receive requests, coordinate responses.
- `src/models/`: MongoDB/Mongoose data models.
- `src/routes/`: API endpoint definitions.
- `src/services/`: business logic + external integrations (email, WhatsApp, AI, PDF).
- `src/middlewares/`: auth, admin, validation, upload, rate-limit, errors.
- `src/validators/`: request validation rules.
- `src/utils/`: ApiError/ApiResponse/asyncHandler/constants/helpers.
- `src/templates/`: message templates.
- `src/app.js`: Express app wiring (planned). `src/server.js`: bootstrap/listen (planned).
- `tests/`: unit + integration (planned). `docs/`: endpoints/design/roadmap (planning only).
- `uploads/`: local dev uploads only; production uses object storage.

## Scripts
- `npm run dev` — planned dev server. `npm start` — planned production start.

## Frontend
- Not modified by this scaffold.
