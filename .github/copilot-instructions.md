<!--
Guidance for AI coding agents working on the UPPet mobile app repository.
Keep this file concise and concrete — reference files and examples in the repo.
-->

# Copilot / AI Agent Instructions for UPPet

Summary

- This repo implements a small Node/Express backend (in `backend/`) using Mongoose/MongoDB and a minimal frontend placeholder in `frontend/`.
- Primary patterns: CommonJS (`require` / `module.exports`), Mongoose models in `backend/models`, controllers in `backend/controller`, and route files in `backend/routes`.

Quick start (how humans and agents should run the app)

- Install dependencies at repo root: `npm install`.
- Development: `npm run dev` (uses `nodemon` to run `backend/script.js`).
- Start (production-like): `npm start` (runs `node backend/script.js`).
- Environment: `dotenv` is used. Set `MONGODB_URI` and `PORT` (defaults: `mongodb://localhost:27017/sp2_uppet`, port `3000`). See `backend/script.js` and `backend/config/database.js`.

Architecture & important files

- `backend/script.js`: Express app entry. Currently it sets up `express.json()` and connects to MongoDB. Note: route mounting is not present — if you add route files, also mount them here (example below).
- `backend/config/database.js`: DB connection helper (exports `connectToDatabase(dbURI)`).
- `backend/models/*.js`: All Mongoose schemas live here. Examples: `Pet.js`, `Adopter.js`, `AdoptionApplication.js`.
- `backend/controller/`: Controllers should house request handlers. Route files in `backend/routes/` should import controllers and export an Express `Router`.
- `backend/middleware/`: Middleware (e.g., `authMiddleware.js`) belongs here.
- `database/`: CSV fixtures and `seed.js` (currently empty) — useful for seeding/testing data. Do not assume `seed.js` is wired up.

Conventions and patterns to follow

- Use CommonJS module style (require/module.exports) — match existing files.
- Keep models-only code in `backend/models`, controller logic in `backend/controller`, and routing in `backend/routes`.
- Mongoose patterns observed:
  - Object references use `mongoose.SchemaTypes.ObjectID` and `ref: "ModelName"` (see `Pet.js` and `AdoptionApplication.js`).
  - Frequently add `index: true` on foreign-key fields (used for queries). Follow existing indexing where appropriate.
  - Enum fields are used widely (follow exact string values from schemas, e.g., `status` in `AdoptionApplication` uses `"Pending"|"Approved"|"Rejected"|"Cancelled"`).

Example: adding a new route + controller

1. Create controller `backend/controller/petController.js` exporting handler functions (e.g., `createPet`, `getPetById`).
2. Create route `backend/routes/petRoute.js`:
   const express = require('express');
   const router = express.Router();
   const petController = require('../controller/petController');
   router.post('/', petController.createPet);
   router.get('/:id', petController.getPetById);
   module.exports = router;
3. Mount the route in `backend/script.js` (example):
   const petRoute = require('./routes/petRoute');
   app.use('/api/pets', petRoute);

Integration & external dependencies

- MongoDB via `mongoose` (see `package.json` and `backend/config/database.js`).
- `dotenv` is loaded in `backend/script.js`; prefer environment variables for secrets and URIs.

Known issues & gotchas (observed by inspection)

- Several route/controller/middleware files are present but empty (for example `backend/routes/UserRoute.js`, `backend/controller/userController.js`, `backend/middleware/authMiddleware.js`). Expect missing wiring when adding features.
- Small typos in models to watch for (fix before running):
  - `backend/models/Messages.js` uses `mongooose.SchemaTypes.ObjectID` (typo) — should be `mongoose`.
  - `backend/models/ChatThread.js` contains an `index: true` placed outside a field definition — validate schema definitions.
  - `backend/models/Notification.js` sets `index: -1` on `timeStamp` (unusual) — verify intent.
- `database/seed.js` is empty while CSV fixtures exist under `database/` — seeding is not automated yet.

Testing, debugging, and development notes

- Run with `npm run dev` and watch the console for DB connection logs from `backend/config/database.js`.
- If you add routes, ensure you mount them in `backend/script.js` and restart `nodemon` or the server.
- Before committing model changes, run a quick `node` REPL script to `require` your model and confirm `mongoose.model('Name')` compiles without errors.

Editing guidance for AI agents

- Prefer small, focused PRs: one feature or fix per change (e.g., add a single route + controller + tests if later added).
- When creating new schema fields, mirror index and enum conventions present in other models.
- Preserve CommonJS style and `express.json()` usage; do not switch to ESM unless the repo is migrated project-wide.
- If you modify `backend/script.js` to mount routes, do not remove the DB connect call or `express.json()`.

If anything here is ambiguous or you want more examples (controller templates, common queries, or a seeding script), please ask and I will expand this file with concrete snippets.
