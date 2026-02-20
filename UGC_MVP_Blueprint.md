# AI UGC Ad Generation Tool — Blueprint & Implementation Reference

> **Last updated:** 2026-02-19
> This is a living document. Update it whenever features are added or changed so it remains the single source of truth for humans and AI agents.

---

## 1) Product Goal

Build an internal tool for marketing teams to create UGC ad planning assets:

1. Generate **3 full-ad video prompt options** (A / B / C).
2. After user selects one option, generate **exactly 4 keyframes**.
3. Export a ZIP bundle of prompts + keyframes.

**Current non-goal:** No direct final-video rendering.

---

## 2) User Experience (Implemented)

### Landing page
- **5 actor cards** displayed (face image + short description).
  - Shows the 5 most-recently-used actors; fills remaining slots with default actors.
- Header bar with **"View Actors"** and **"History"** buttons.

### Composer (input)
- Select an actor card (or open actors panel to browse / create custom actors).
- Fill out brief fields: **user prompt, product name, product features, CTA**.
- Upload one product image (PNG / JPEG / WEBP, ≤ 10 MB).
- Choose language (default: Hinglish).
- Composer section is scrollable (max-height 40 vh) so it never pushes content off-screen.

### Generation flow
1. Click **Generate** → creates project + saves brief + uploads image + triggers prompt generation.
2. Three prompt options appear as cards with **Copy** button and **Use This Prompt** selector.
3. Select one option → triggers keyframe generation.
4. Four keyframe images appear with per-frame **Download** button.
5. **Export ZIP** button exports prompts + keyframes as a downloadable archive.

### Extras
- **History panel** — slide-out showing all past projects with summary (has brief?, prompt count, selected option, keyframe count). Click to reload any project.
- **Actors panel** — slide-out showing all actors (default + custom). Inline form to **create a custom actor** (name, description, face image, optional reference image). Delete button for custom actors (defaults are protected).
- Project state persists in `localStorage` so a page refresh resumes where you left off.

---

## 3) Scope Decisions

| Decision | Value |
|---|---|
| Default actors | 5 (Priya, Anjali, Kavita, Arjun, Ramesh) |
| Custom actors | Users can create unlimited custom actors |
| Product image | Single image per project (white background preferred) |
| Language | Multilingual — default `hinglish` |
| Prompt options | 3 per generation (A / B / C) |
| Keyframes | Exactly 4 per selected option |
| Scene order | Hook → Feature → Trust → CTA |
| Scene duration target | 8 seconds each (≈ 32 s total ad) |
| Data retention | 30 days |
| User segment | Internal team only |

---

## 4) Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, single-file `App.jsx` |
| Backend | Express.js 5, Node ≥ 20, ES modules |
| Database | Supabase Postgres (primary), file-based JSON fallback |
| AI — text | Gemini 2.5 Flash (`gemini-2.5-flash`) |
| AI — images | Gemini 3 Pro Image Preview |
| Validation | Zod schemas |
| Upload handling | multer (10 MB limit) |
| Static files | Express static serving from `backend/storage/` |
| Export | archiver (ZIP) |

---

## 5) Repository Layout (Actual)

```text
UGC_Video_Gen/
├── UGC_MVP_Blueprint.md          ← this file
├── backend/
│   ├── package.json
│   ├── .env                      ← PORT, BASE_URL, GEMINI_API_KEY, DATABASE_URL, etc.
│   ├── data/                     ← JSON data files (file-based store)
│   │   ├── actors.json
│   │   ├── projects.json
│   │   └── jobs.json
│   ├── src/
│   │   ├── server.js             ← Express app, all REST endpoints
│   │   ├── config.js             ← env-based config object
│   │   ├── jobs.js               ← JobRunner — async job queue
│   │   ├── generators.js         ← helper utilities
│   │   ├── openapi.js            ← OpenAPI spec serving
│   │   ├── providers/
│   │   │   └── geminiProvider.js ← Gemini API integration
│   │   └── store/
│   │       ├── index.js          ← createStore() factory
│   │       ├── fileStore.js      ← JSON-file persistence
│   │       ├── postgresStore.js  ← Postgres persistence
│   │       └── postgresSchema.js ← DDL statements
│   └── storage/
│       ├── actors/               ← actor face & reference images
│       ├── uploads/              ← product images (per-project dirs)
│       ├── keyframes/            ← generated keyframes (per-project dirs)
│       └── exports/              ← ZIP exports
└── frontend/
    ├── package.json
    ├── vite.config.js            ← dev proxy to backend:4000
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               ← entire UI (single-file)
        └── styles.css            ← all styling
```

---

## 6) API Endpoints (Implemented)

### Actors
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/actors` | List all actors (default + custom) |
| `GET` | `/v1/actors/recent` | 5 most recently used actors (fills w/ defaults) |
| `POST` | `/v1/actors` | Create custom actor (multipart: `face_image`, `reference_image`) |
| `DELETE` | `/v1/actors/:actorId` | Delete a custom actor (defaults are protected) |

### Projects
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/projects` | Create project (name, actor_id, language) |
| `GET` | `/v1/projects` | List all projects (summary) |
| `GET` | `/v1/projects/:projectId` | Get full project detail |

### Brief & Generation
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/projects/:projectId/brief` | Save brief (user_prompt, product_name, product_features, cta) |
| `POST` | `/v1/projects/:projectId/product-image` | Upload product image (multipart) |
| `POST` | `/v1/projects/:projectId/generate-prompt-options` | Trigger prompt-options job (async, 202) |
| `POST` | `/v1/projects/:projectId/select-prompt-option` | Save selection (A / B / C) |
| `POST` | `/v1/projects/:projectId/generate-keyframes` | Trigger keyframe job (async, 202) |

### Jobs & Export
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/jobs/:jobId` | Poll job status |
| `GET` | `/v1/projects/:projectId/export` | Download ZIP (prompts + keyframes) |

### Other
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/openapi.json` | OpenAPI spec |

**Job statuses:** `queued` → `running` → `completed` | `failed` | `needs_review`

---

## 7) Database Schema (Postgres)

### actors
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | `actor_01` … or `actor_{uuid12}` for custom |
| name | TEXT NOT NULL | |
| short_description | TEXT | |
| image_url | TEXT | face photo URL |
| reference_image_url | TEXT | full-length reference photo URL |
| is_default | BOOLEAN NOT NULL DEFAULT FALSE | `TRUE` for seed actors |
| created_at | TIMESTAMPTZ | |

### projects
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT NOT NULL | |
| actor_id | TEXT → actors(id) | |
| language | TEXT DEFAULT 'en' | |
| product_image_path | TEXT | local disk path |
| product_image_url | TEXT | `/storage/uploads/…` |
| brief | JSONB | normalized brief |
| prompt_options | JSONB DEFAULT '[]' | 3 options |
| selected_option_id | TEXT | A / B / C |
| scene_plan | JSONB DEFAULT '[]' | 4-scene plan |
| keyframes | JSONB DEFAULT '[]' | 4 keyframe URLs |
| created_at / updated_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | +30 days |

### jobs
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| project_id | UUID → projects(id) | |
| type | TEXT | `generate_prompt_options` / `generate_keyframes` |
| idempotency_key | TEXT | dedup |
| status | TEXT DEFAULT 'queued' | |
| error | TEXT | |
| result | JSONB | |
| created_at / updated_at / started_at / completed_at | TIMESTAMPTZ | |

---

## 8) AI Pipeline Details

### 8.1 Prompt Option Generation (Gemini 2.5 Flash)
- **Input:** structured brief (user_prompt, product_name, product_features, cta, actor, language).
- **Output:** 3 JSON options (A/B/C), each with 4 scenes (Hook → Feature → Trust → CTA).
- Each scene contains: `objective`, `dialogue`, `actions`, `shot_type`, `product_visibility`.

### 8.2 Keyframe Generation (Gemini 3 Pro Image Preview)
- **Input:** selected option's scene plan + product image (inline) + actor reference image (inline) + detailed image prompt.
- **Output:** 4 keyframe images (one per scene).
- **Key constraints baked into prompt:**
  - Show EXACTLY ONE instance of the product per frame (never duplicate).
  - Match actor's physical appearance from reference photo.
  - Maintain visual continuity across all 4 frames.
  - Product clearly visible in every frame.
  - Professional photographic quality.

### 8.3 Actor Reference Images
- Each actor has a **face image** (headshot) shown in UI cards and a **reference image** (full-body) sent to the image model for appearance matching.
- Stored on disk at `backend/storage/actors/`.

---

## 9) Frontend Architecture

Single-file React app (`App.jsx`, ~1000+ lines). No router — all state managed via `useState`.

### Key state variables
- `form` — actor, language, prompt, product name, features, CTA.
- `project` — current project object from backend.
- `actors` — actor list shown on landing (from `/v1/actors/recent`).
- `step` — pipeline stage (`idle` → `creating` → `prompts_loading` → `prompts_ready` → `keyframes_loading` → `keyframes_ready`).
- `historyOpen` / `actorsPanelOpen` — slide-out panel states.

### Panels
1. **History panel** — lists all projects, click to reload.
2. **Actors panel** — browse all actors, inline create form (name + description + face image + optional reference image), delete custom actors.

### Styling
- Dark theme, card-based layout.
- Scrollable composer section.
- Centered generate button.
- Responsive panels with overlay backdrop.

---

## 10) Configuration (.env)

```env
PORT=4000
BASE_URL=http://localhost:4000
GEMINI_API_KEY=<key>
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.0-flash-preview-image-generation
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>
DATABASE_SSL_ENABLED=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
ALLOW_MOCK_FALLBACK=false
```

---

## 11) Running the Project

### Backend
```bash
cd backend
npm install
npm run start       # starts Express on PORT (default 4000)
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # Vite dev server with proxy to backend
```

### Important Notes
- **Restart the backend** after any server-side code changes (no hot reload).
- Frontend dev server proxies `/v1/*`, `/storage/*`, `/health` to `http://localhost:4000`.
- File-based store (`data/*.json`) is used when `DATABASE_URL` is not set.

---

## 12) Deployment Notes

**Recommended setup (not yet deployed):**
- **Frontend** → Vercel (static SPA).
- **Backend** → Railway or Render (persistent filesystem for storage/).
- **Database** → Supabase Postgres (already configured).

**Why not both on Vercel:**
- Serverless functions have ephemeral filesystem (storage/ would be lost).
- Generation jobs can take 30-60 s (beyond serverless timeouts).
- In-memory job queue can't be shared across cold starts.

---

## 13) Feature Changelog

| Date | Feature | Details |
|---|---|---|
| Initial | Core pipeline | Project creation, brief, prompt generation, selection, keyframe generation, export |
| Session 1 | UI improvements | Scrollable composer, centered generate button |
| Session 1 | CTA field | Added CTA to frontend form (backend already required it) |
| Session 1 | History panel | `GET /v1/projects` endpoint + slide-out History UI |
| Session 1 | Real actor images | Replaced placeholder actors with 5 real face + reference JPGs |
| Session 1 | Reference image pipeline | Actor reference photos sent to Gemini for appearance matching |
| Session 1 | Single-product constraint | Prompt explicitly prevents duplicate products in frames |
| Session 1 | Custom actors | Create/delete custom actors, recent-actors landing, actors panel |

---

## 14) Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Inconsistent multilingual tone | Language-specific templates, validation |
| Product not visible in frames | Hard `product_visibility` constraints in prompts |
| Duplicate product in frames | Explicit single-product-per-frame constraint |
| Weak prompt quality | Enforce objective coverage, 4-scene structure |
| Slow model response | Async job queue, polling, progress UI |
| Actor appearance mismatch | Reference image sent inline to image model |

---

## 15) Definition of Done (MVP)

- [x] Select actor, add prompt, upload product image
- [x] Generate 3 full-ad prompt options (A/B/C)
- [x] Copy and select prompt option
- [x] Generate 4 keyframes from selected option
- [x] Download individual keyframes
- [x] Export ZIP bundle
- [x] History panel for past projects
- [x] Custom actor creation and management
- [x] 5 most-recently-used actors on landing page
- [x] Actor reference images integrated into generation pipeline
- [ ] Deployment to cloud (deferred)
- [ ] Authentication / role checks (deferred)
- [ ] Automated tests (deferred)
