# UGC Backend MVP

Backend for UGC ad pipeline:
1. Generate `3 full-ad prompt options`
2. User selects one option
3. Generate `exactly 4 keyframes`

## Run
```bash
cd backend
npm install
npm run start
```

Default server values:
- `PORT=4000`
- `BASE_URL=http://localhost:4000`

Gemini requirements:
- Set `GEMINI_API_KEY`
- Set `GEMINI_IMAGE_MODEL` to your image model (for example `gemini-3-pro-image-preview`)
- If `ALLOW_MOCK_FALLBACK=false`, generation jobs fail when Gemini is unavailable.

## Persistence modes

### 1) File store (default)
If `DATABASE_URL` is not set, data is stored locally:
- `backend/data`
- `backend/storage`

### 2) Supabase Postgres
Set these in `backend/.env`:
```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
DATABASE_SSL_ENABLED=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

Notes:
- On startup, schema and actor seed data are created automatically.
- Recommended first connection is the Supabase `pooler` URL (`:6543`) for app traffic.
- Keep `DATABASE_SSL_REJECT_UNAUTHORIZED=false` unless you manage cert validation yourself.

## API Flow
1. `GET /v1/actors`
2. `POST /v1/projects`
3. `POST /v1/projects/:projectId/product-image` (multipart field: `product_image`)
4. `POST /v1/projects/:projectId/brief`
5. `POST /v1/projects/:projectId/generate-prompt-options`
6. `GET /v1/jobs/:jobId` until `completed`
7. `GET /v1/projects/:projectId/prompt-options`
8. `POST /v1/projects/:projectId/select-prompt-option`
9. `POST /v1/projects/:projectId/generate-keyframes`
10. `GET /v1/jobs/:jobId` until `completed`
11. `GET /v1/projects/:projectId/keyframes`
12. `GET /v1/projects/:projectId/export`

## Notes
- Keyframes are generated via Gemini image output when configured.
- Job execution is async via an internal queue.
- Set `Idempotency-Key` header on generate/regenerate endpoints to dedupe retries.
