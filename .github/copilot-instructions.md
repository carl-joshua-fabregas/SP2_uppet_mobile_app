<!--
Guidance for AI coding agents working on the UPPet mobile app repository.
Keep this file concise and concrete — reference files and examples in the repo.
-->

# Copilot / AI Agent Instructions for UPPet

## Project Overview

**UPPet** is a peer-to-peer pet adoption platform for Batong Malake, Los Banos, Laguna. It consists of a Node.js/Express backend with MongoDB persistence and a placeholder frontend.

## Tech Stack & Key Dependencies

- **Framework**: Express.js 5.2.1 (CommonJS)
- **Database**: MongoDB 6.21.0 via Mongoose 8.20.1
- **Runtime**: Node.js with nodemon (development)
- **Environment**: dotenv (loads `MONGODB_URI`, `PORT`)

## Quick Start Commands

```bash
npm install                    # Install dependencies
npm run dev                    # Development (nodemon + backend/script.js)
npm start                      # Production (node backend/script.js)
```

**Defaults**: `MONGODB_URI=mongodb://localhost:27017/sp2_uppet`, `PORT=3000`

## Architecture & Core Files

### Backend Structure
- **`backend/script.js`**: Express entry point. Currently mounts only `PetRoutes` at `/api/pet`. Add new routes here.
- **`backend/config/database.js`**: Exports `connectToDatabase(dbURI)` — called during app startup.
- **`backend/models/`**: Mongoose schemas. Key models: `Pet.js` (pets for adoption), `Adopter.js` (users), `AdoptionApplication.js` (app status), `Notification.js`, `ChatThread.js`, `Messages.js`.
- **`backend/controller/`**: Request handlers (e.g., `petController.js`, `AdoptionApplicationController.js`). Follow async/try-catch pattern.
- **`backend/routes/`**: Express routers. Example: `PetRoutes.js` mounts handlers from `petController`.
- **`backend/middleware/`**: Reserved for auth/logging (currently `authMiddleware.js` is empty).
- **`database/`**: CSV seed files and `seed.js` (not wired yet).

### Data Model Overview
- **Adopter** ↔ **Pet** (owner relation via `ownerId` ref)
- **Pet** ← **AdoptionApplication** (petToAdopt ref + status enum)
- **Adopter** ← **Notification** (notifRecipient ref)
- **Adopter** ↔ **ChatThread** (members array)
- **Messages** → ChatThread + Adopter (sender ref)

## Conventions & Patterns

### Module & Schema Style
- **CommonJS only**: `require()`/`module.exports` (do not use ESM).
- **Mongoose ObjectID**: Use `mongoose.SchemaTypes.ObjectID` with `ref: "ModelName"` for relations.
- **Enum fields**: Copy exact string values. Examples:
  - AdoptionApplication `status`: `["Pending", "Approved", "Rejected", "Cancelled"]`
  - Notification `notifType`: `["New Notification", "Approved", "Rejected", "Cancelled", "Applied"]`
  - Pet `sex`: `["Male", "Female"]`
  - Messages media `type`: `["image", "video"]`

### Indexing Pattern
- Add `index: true` on frequently queried foreign-key fields (e.g., `petToAdopt`, `applicant` in AdoptionApplication).
- **Exception**: `Notification.timeStamp` uses `index: -1` (descending — likely for sorting newest first).

### Controller Pattern
```javascript
const modelName = require("../models/ModelName");

const createItem = async (req, res) => {
  try {
    const newItem = new modelName({...});
    const saved = await newItem.save();
    return res.status(200).json({ message: "Success", body: saved });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", body: err.message });
  }
};
```

### Route Pattern
```javascript
const express = require("express");
const router = express.Router();
const controller = require("../controller/itemController");

router.get("/all", controller.findAll);
router.get("/:id", controller.findByID);
module.exports = router;
```
Then mount in `script.js`: `app.use("/api/item", require("./routes/itemRoutes"));`

## Known Issues & Constraints

1. **Incomplete routes**: `UserRoute.js`, `AdopterApplication.js routes` are empty or not mounted.
2. **Empty middleware**: `authMiddleware.js` exists but is not applied to any route.
3. **Database schema issues** (fix if encountered):
   - `Messages.js` may have typos in ObjectID references.
   - `Notification.js` uses `index: -1` (confirm it's intentional).
4. **No seeding**: CSV fixtures exist but `seed.js` is not connected. Manual seeding required.
5. **Middleware placement**: `express.json()` is called *after* route mounting in `script.js` — move it before routes for proper parsing.

## Development Workflow

1. **After model changes**: Test schema compilation with `node -e "require('./backend/models/YourModel.js')"`
2. **When adding routes**: Mount in `script.js`, restart `npm run dev`.
3. **Database logs**: Check console for connection/query errors during `npm run dev`.
4. **Testing**: Manually call endpoints or add integration tests (none exist yet).

## Editing Guidelines

- Keep changes focused and self-contained (one feature = one controller + one route).
- Mirror existing code style (error messages, response structure, async patterns).
- Do not remove `connectToDatabase()` or `express.json()` from `script.js`.
- When adding fields to schemas, include `index: true` for frequently filtered fields.
- Preserve CommonJS throughout (no ESM migration without full repo alignment).

## Example: Adding an Adopter Route

1. **Create `backend/controller/adopterController.js`**:
   ```javascript
   const Adopter = require("../models/Adopter");
   const createAdopter = async (req, res) => {
     try {
       const adopter = new Adopter({...req.body});
       const saved = await adopter.save();
       return res.status(200).json({ message: "Adopter created", body: saved });
     } catch (err) {
       return res.status(500).json({ message: "Server Error", body: err.message });
     }
   };
   module.exports = { createAdopter };
   ```

2. **Create `backend/routes/adopterRoutes.js`**:
   ```javascript
   const express = require("express");
   const router = express.Router();
   const { createAdopter } = require("../controller/adopterController");
   router.post("/", createAdopter);
   module.exports = router;
   ```

3. **Mount in `backend/script.js`** (after MongoDB connect, before `app.listen`):
   ```javascript
   const adopterRouter = require("./routes/adopterRoutes");
   app.use("/api/adopter", adopterRouter);
   ```
