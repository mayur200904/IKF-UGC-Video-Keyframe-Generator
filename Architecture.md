# AI UGC Video Generator Architecture

Status: target architecture and migration guide

This document is the product and technical source of truth for the AI UGC Video Generator. It translates the supplied product brief and campaign-flow references into an implementation contract for a Next.js monolith.

## 1. Product direction

### Product goal

Build a web application where a brand or marketing team can describe a product video and produce short, authentic-looking UGC-style videos with either a consented real-person likeness or synthetic Indian AI actors, Indian-language voiceovers, accurate lip sync, product references, captions, disclosure labels, and exportable assets.

The product is a guided video-generation studio, not only a prompt box. The user should be able to move from source or actor selection to product placement, voice and duration, rendered video, review, and reuse without losing draft state.

### Target users

- Brand and growth teams creating paid social and organic short-form content.
- Agencies producing high-volume video variations for Indian audiences.
- Internal operators reviewing scripts, model output, compliance, cost, and delivery status.

The application is SaaS-ready: authentication and workspace ownership are part of the target domain model. Billing and credit enforcement may follow the core generation pipeline.

### Product positioning

The product combines two market patterns:

- A self-serve AI video studio: product input, source or actor selection, scripts, voice, placement presets, and rendered variants.
- A review-oriented production workflow: structured direction, review gates, approvals, consent/disclosure metadata, and video history.

The first migration prioritizes the AI video studio and preserves the current project, prompt, keyframe, media, and export behavior. Human creator marketplace workflows are future scope unless explicitly added to the product brief. In the visible product UI, video generation is the primary object; campaign/project terminology remains only where required for legacy API and database compatibility.

### Current video-generation modes

The wireframe and target UX expose two selectable generation modes from Overview:

1. **Your likeness** — upload a portrait and short reference video, confirm permission to use the individual’s face and voice, choose a product and placement, then generate a video using the reference performance and voice.
2. **AI actor** — choose an India-based synthetic actor, select the actor-compatible voice and language, add a product and placement direction, then generate a product video.

Both modes use a fixed workspace sidebar, a seven-step generation rail, a persistent preview panel, autosaved draft state, and an asynchronous review/export stage. The three standard shot presets are `present the product`, `use the product`, and `product close-up`; aspect ratio remains a separate output setting.

Video duration presets are 8–10 seconds, 20 seconds, and 30 seconds. Audio follows the selected video duration by default, with an optional custom audio upload. Every completed output includes a visible AI disclosure and provenance metadata. Likeness mode requires an explicit consent acknowledgement in the UX; production must additionally persist consent evidence and enforce access controls.

## 2A. Legacy campaign compatibility flow

The primary campaign journey is a resumable wizard with autosave. Every step supports back navigation, validation, draft restoration, and a visible save state.

```text
New campaign
    |
    v
Campaign setup -> Product -> Creative direction -> AI creator preferences
    |                                                        |
    +---------------------- autosaved draft -----------------+
                                                             v
                                                Generate 3 concepts/scripts
                                                             |
                                                             v
                                                Select or regenerate concept
                                                             |
                                                             v
                                               Review storyboard/keyframes
                                                             |
                                                             v
                                                Generate voice and video jobs
                                                             |
                                                             v
                                             Review -> export/share/duplicate
```

### Step 1 Campaign setup

Collect:

- Campaign name.
- Intended platform: Instagram, TikTok, YouTube Shorts, Facebook, Amazon, or other.
- Objective: awareness, product education, consideration, conversion, or testing.
- Duration preset: 8–10 seconds initially; 20 and 30 seconds later.
- Aspect ratio: 9:16 initially; keep the model extensible for additional formats.
- Number of requested variations or batch size.

Platform presets may recommend duration, safe areas, caption treatment, and CTA style, but the user can override them.

### Step 2 Product

Support both manual entry and product-link ingestion:

- Product image upload.
- Product URL, when available.
- Product name, value/price, description, benefits, features, trust points, and CTA.
- Brand logo and optional brand assets.
- Product usage restrictions and claims that must not be made.

The product reference image is the source of truth for product identity, shape, branding, and physical form. Store product files in Supabase Storage and store durable object paths in the database.

### Step 3 Creative direction

Collect:

- Preferred format: testimonial, product demo, product in action, unboxing, POV product experience, problem-to-solution, or custom.
- Tone: authentic, energetic, premium, educational, humorous, or conversational.
- Campaign vision and audience context.
- Whether captions are required.
- Whether music is required.
- Dos and don’ts.
- Reference URLs, scripts, images, sample videos, and attached materials.
- Brand voice and prohibited language.

### Step 4 AI creator preferences

Collect:

- Synthetic actor/model selection or generated actor profile.
- Language and regional accent.
- Gender, age range, appearance, location, and creator style.
- Product-category expertise.
- Wardrobe or setting constraints when needed.

Only synthetic actors and voices may be used by default. Any real-person face or voice requires documented written consent and must not be silently treated as a synthetic asset.

### Concept generation

Generate exactly three concept options initially. Each concept contains:

- Hook/title.
- Intended audience and angle.
- Script/dialogue.
- Objective and CTA.
- Scene list.
- Voice and language direction.
- Risk or compliance warnings.

The user may select one, regenerate all concepts, or revise the brief before continuing.

### Storyboard and keyframes

The initial pipeline uses four storyboard scenes in this order:

1. Hook.
2. Feature or product demonstration.
3. Trust, proof, or benefit.
4. Recommendation and CTA.

Each scene is reviewable and regenerable independently. The product, actor identity, wardrobe, setting, lighting, camera style, and continuity profile must remain stable unless the user explicitly changes them.

### Video generation

The render pipeline is asynchronous:

1. Validate product, actor, script, language, and compliance constraints.
2. Generate or retrieve the Indian-language voice.
3. Generate the talking-head or actor video with the selected provider.
4. Generate optional B-roll or product scenes.
5. Repair lip sync when required.
6. Stitch scenes and apply captions, AI disclosure, brand logo, and output metadata.
7. Store the final video and all intermediate assets.
8. Return a reviewable version with provider, model, cost, warnings, and provenance metadata.

No final video is considered ready merely because a provider returned a file. The application must mark it `needs_review` when validation, continuity, claim safety, disclosure, or provider quality checks produce warnings.

## 3. Product brief requirements

The following are product requirements supplied in `AI_UGC_Product_Brief_for_hiveminds.docx`. Cost, vendor pricing, legal interpretation, and availability are planning inputs and must be verified before launch.

### Output

- India-first languages: Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, and Indian English.
- Primary output: 9:16 short-form video for Reels, Shorts, and ads.
- Initial duration target: 8–10 seconds.
- Planned duration support: 20 and 30 seconds.
- Initial batch target: 400 videos.
- Highest quality priority: natural voice-to-lip synchronization in Indian languages.

### Initial provider strategy

Provider names are adapters, not domain dependencies. Each adapter must expose a common interface, report usage/cost, support timeouts and retries, and be replaceable without changing campaign or UI code.

| Capability | Initial provider direction | Purpose |
| --- | --- | --- |
| Main talking video | Kling AI Avatar v2 Pro | Recommended quality tier and lip sync |
| Budget talking video | Kling AI Avatar v2 Standard | Bulk testing and lower-cost variants |
| Premium talking video | OmniHuman 1.5 | Higher expression and body movement |
| Product/B-roll scenes | Google Veo 3.1 Fast | Product and scene inserts; stitch clips when needed |
| Indian voice | Sarvam Bulbul v3 | Indian-language voice generation |
| Synthetic actor faces | Nano Banana 2 | Actor-library image generation |
| Lip-sync repair | sync.so lipsync-2-pro | Fallback repair path |

The system must not hard-code a single vendor, model name, cost, or maximum duration into UI logic. Store provider configuration and model capabilities on the server.

### Planning economics

The brief uses 1 USD = ₹96 as a working rate and estimates the following. These are not billing truth until revalidated.

| Plan | Monthly price | 10-second videos | Approximate cost | Approximate margin |
| --- | ---: | ---: | ---: | ---: |
| Starter | ₹9,000 | 25 | ₹4,200 | 53% |
| Growth | ₹17,000 | 60 | ₹10,000 | 41% |
| Pro | ₹24,000 | 90 | ₹15,000 | 38% |
| Enterprise | Custom | 400+ | About ₹166 per 10-second video at the recommended tier | Custom |

Credits are planned as follows:

- 1 credit equals one 10-second video.
- A 20-second video consumes 2 credits.
- A 30-second video consumes 3 credits.
- Actual usage is recorded in a usage ledger and may include retakes, provider retries, voice, B-roll, and repair costs.

The product must support spend limits and operator-visible usage before enabling large batches.

### Compliance and trust requirements

Treat these as product acceptance requirements from the supplied brief, with legal review before launch:

- Show a visible AI-generated label on every generated video.
- Preserve hidden provenance metadata where supported.
- Do not create fake testimonials or unsupported product outcomes.
- Run claim-risk checks before rendering and flag risky content for review.
- Require written consent for real-person faces or voices.
- Keep synthetic actor records distinct from real creator records.
- Log the provider, model, prompt version, asset inputs, and generation result.

## 4. Target technical stack

| Layer | Target |
| --- | --- |
| Application | Next.js stable latest, App Router, TypeScript, React latest |
| Styling | Tailwind CSS v4 |
| UI kit | shadcn/ui components owned in source control |
| Forms | React Hook Form + Zod |
| Client async state | TanStack Query for job polling and mutations |
| Database | Supabase Postgres |
| Database access | Drizzle ORM and Drizzle migrations |
| Media | Supabase Storage with signed/direct uploads |
| Authentication | Supabase Auth, introduced behind workspace ownership |
| Async execution | Inngest durable jobs called from the same Next.js repository |
| AI integrations | Server-only provider adapters |
| Hosting | Vercel Node.js runtime |
| Package manager | npm; preserve the repository’s `package-lock.json` convention |
| Testing | TypeScript, ESLint, Vitest, Testing Library, and Playwright |

Use the stable `next@latest` release when the migration starts and record the resolved version in `package.json`. Do not use a canary release for production without an explicit architecture decision.

## 5. Target repository architecture

The target application is one Next.js codebase. The current `frontend/` and `backend/` directories remain during migration and are not deleted until parity and deployment verification are complete.

```text
/
├── AGENTS.md
├── Architecture.md
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (app)/dashboard/
│   │   ├── (app)/campaigns/[campaignId]/
│   │   └── api/v1/
│   ├── components/
│   │   └── ui/                 # shadcn source components
│   ├── features/
│   │   ├── video-generation/
│   │   ├── campaigns/          # compatibility/migration vocabulary only
│   │   ├── products/
│   │   ├── creators/
│   │   ├── generation/
│   │   └── media/
│   ├── lib/
│   │   ├── validation/
│   │   └── shared/
│   └── server/
│       ├── db/
│       ├── auth/
│       ├── storage/
│       ├── providers/
│       ├── jobs/
│       └── services/
├── drizzle/
├── public/
├── frontend/                   # legacy migration source; do not extend
└── backend/                    # legacy migration source; do not extend
```

### Boundary rules

- `src/app` owns routing, layouts, route handlers, loading states, and error boundaries.
- `src/components/ui` owns shadcn components and reusable primitives.
- `src/features` owns user-facing feature composition and client state.
- `src/server` owns database access, provider calls, storage, jobs, authorization, and secrets.
- Client components may call typed client utilities but may not import `src/server` modules.
- Route handlers validate input, authorize workspace access, invoke a service, and return a stable response.
- Domain services must not import React or UI modules.

## 6. Migration plan

### Phase 0 Documentation and setup

- Create this architecture document and `AGENTS.md`.
- Install the official shadcn skill.
- Scaffold the Next.js App Router application with TypeScript, Tailwind, ESLint, and npm.
- Add `components.json` and establish import aliases.
- Add environment examples without secrets.

### Phase 1 Data and domain parity

- Introspect the existing Supabase schema and preserve `actors`, `projects`, `jobs`, and existing JSON media references.
- Introduce Drizzle schema and migrations without deleting existing tables or rows.
- Port validation and domain types from the legacy server.
- Keep current IDs, Supabase object paths, selected prompt options, and keyframe URLs readable.

### Phase 2 API parity

Move the current Express behavior to Next.js Route Handlers:

| Legacy behavior | Next.js target |
| --- | --- |
| `GET /v1/actors` | `app/api/v1/actors/route.ts` |
| `GET /v1/actors/recent` | `app/api/v1/actors/recent/route.ts` |
| `POST /v1/projects` | `app/api/v1/projects/route.ts` |
| `GET/PATCH /v1/projects/:id` | `app/api/v1/projects/[projectId]/route.ts` |
| Brief and product image routes | `app/api/v1/projects/[projectId]/.../route.ts` |
| Prompt/keyframe generation routes | Same project route group |
| `GET /v1/jobs/:id` | `app/api/v1/jobs/[jobId]/route.ts` |
| Export route | `app/api/v1/projects/[projectId]/export/route.ts` |

Preserve status codes, validation errors, idempotency behavior, and response fields during the parity phase.

### Phase 3 Durable generation

- Replace the process-local `JobRunner` with Inngest functions.
- Keep job state in Postgres and make every job restart-safe.
- Add provider run records, retry counts, usage records, and warnings.
- Make prompt, voice, image, video, stitching, captions, disclosure, and export steps independently observable.
- Never require a Vercel request to remain open while a provider renders.

### Phase 4 UX migration

- Replace the single-page Vite composer with the video-generation workspace and its two modes: `likeness` and `ai_actor`.
- Add autosave, route-based step state, draft restoration, and keyboard-accessible dialogs/sheets.
- Preserve the current actor catalog, project history, prompt option cards, keyframes, and export behavior behind compatibility adapters.
- Add product catalog, product-placement direction, actor/source preferences, voice and duration controls, preview review, and per-scene or per-shot regeneration.

### Phase 5 Cutover

- Run API and UI parity checks against the restored Supabase data.
- Verify migrated projects, actor images, product images, keyframes, and exports.
- Deploy the Next.js application to a staging Vercel project.
- Switch traffic only after health, auth, storage, job, generation, and export checks pass.
- Retain legacy code until the cutover rollback window expires; record the retirement trigger before removal.

## 7. Domain model

These interfaces are the target vocabulary. During parity migration, existing JSON columns may temporarily hold nested values, but new code should normalize stable entities over time.

```ts
type GenerationMode = "likeness" | "ai_actor";

type VideoRecord = {
  id: string;
  workspaceId: string;
  title: string;
  mode: GenerationMode;
  productId: string | null;
  actorId: string | null;
  durationSeconds: 10 | 20 | 30;
  language: string;
  placement: "present" | "use" | "insert";
  status: "draft" | "queued" | "running" | "needs_review" | "completed" | "failed";
  thumbnailAssetId: string | null;
};

type GenerationSource = {
  mode: GenerationMode;
  portraitAssetId: string | null;
  referenceVideoAssetId: string | null;
  consentConfirmed: boolean;
  actorId: string | null;
};

type GenerationFlow = {
  mode: GenerationMode;
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  productId: string | null;
  placement: "present" | "use" | "insert";
  durationSeconds: 10 | 20 | 30;
  audioMode: "reference" | "actor" | "upload";
  language: string;
  voiceId: string | null;
  brief: string;
  status: "idle" | "queued" | "running" | "needs_review" | "completed" | "failed";
};

type Workspace = {
  id: string;
  name: string;
  ownerUserId: string;
  createdAt: Date;
};

type Campaign = {
  id: string;
  workspaceId: string;
  name: string;
  status: "draft" | "brief_ready" | "concepts_ready" | "storyboard_ready" | "rendering" | "review" | "completed" | "failed";
  platform: "instagram" | "tiktok" | "youtube_shorts" | "facebook" | "amazon" | "other";
  durationSeconds: 10 | 20 | 30;
  aspectRatio: "9:16";
  selectedCreatorProfileId: string | null;
};

type Product = {
  id: string;
  workspaceId: string;
  name: string;
  listingUrl: string | null;
  description: string;
  features: string[];
  trustPoints: string[];
  cta: string;
  primaryAssetId: string | null;
};

type CreativeBrief = {
  campaignId: string;
  objective: string;
  format: string;
  tone: string;
  vision: string;
  captions: boolean;
  music: boolean;
  dos: string[];
  donts: string[];
  references: string[];
};

type CreatorProfile = {
  id: string;
  workspaceId: string | null;
  name: string;
  kind: "synthetic" | "real_consent_required";
  language: string;
  accent: string | null;
  imageAssetId: string | null;
  referenceAssetId: string | null;
  consentAssetId: string | null;
};

type PromptOption = {
  id: string;
  campaignId: string;
  optionId: "A" | "B" | "C";
  title: string;
  language: string;
  scenes: StoryboardScene[];
  warnings: string[];
};

type StoryboardScene = {
  id: string;
  promptOptionId: string;
  sceneNumber: number;
  objective: "hook" | "feature" | "trust" | "cta";
  dialogue: string;
  actions: string;
  frameAssetId: string | null;
  status: "draft" | "generating" | "ready" | "needs_review" | "failed";
};

type MediaAsset = {
  id: string;
  workspaceId: string;
  kind: "product" | "actor" | "reference" | "keyframe" | "audio" | "video" | "export";
  storagePath: string;
  contentType: string;
  metadata: Record<string, unknown>;
};

type GenerationJob = {
  id: string;
  workspaceId: string;
  videoId: string | null;
  campaignId: string | null; // legacy compatibility reference; new UI uses videoId
  kind: "script" | "voice" | "image" | "video" | "lip_sync" | "compose" | "export";
  status: "queued" | "running" | "completed" | "failed" | "needs_review";
  progress: number;
  idempotencyKey: string | null;
  error: string | null;
};

type ProviderRun = {
  id: string;
  jobId: string;
  provider: string;
  model: string;
  status: "started" | "completed" | "failed";
  latencyMs: number | null;
  estimatedCostMinor: number | null;
  requestMetadata: Record<string, unknown>;
};

type UsageLedger = {
  id: string;
  workspaceId: string;
  campaignId: string | null;
  jobId: string | null;
  credits: number;
  providerCostMinor: number | null;
  reason: "generation" | "retry" | "retake" | "refund" | "adjustment";
};
```

## 8. API and runtime contracts

The compatibility API remains the first public contract. New Route Handlers must:

- Validate JSON and form-data with Zod.
- Authorize the workspace before reading or mutating project data.
- Use idempotency keys for generation and upload operations.
- Return stable error codes and safe messages.
- Avoid leaking provider responses, secrets, database URLs, or customer media in logs.
- Return job IDs for asynchronous work instead of holding open requests.

The current API surface remains supported during migration:

- Actors: list, recent, create, and delete custom actors.
- Projects: create, list, read, patch, save brief, upload product image, and export.
- Prompt options: generate, list, select, and regenerate.
- Keyframes: generate, list, and regenerate.
- Jobs: read status and result.

## 9. Persistence and media

- Supabase Postgres is the durable source of truth.
- Supabase Storage is the durable source of truth for product, actor, keyframe, audio, video, and export objects.
- Store object paths and metadata, not large binary blobs, in Postgres.
- Use signed upload/download URLs for private media.
- Public URLs are allowed only for deliberately public assets.
- Do not write generated media to local disk in Vercel production.
- Keep existing media object paths and URLs readable during migration.
- Use additive Drizzle migrations and never drop or overwrite existing data without an explicit migration plan.

## 10. Security, privacy, and compliance

- Keep `DATABASE_URL`, service-role keys, provider keys, signing secrets, and Inngest signing keys server-only.
- Only expose values prefixed with `NEXT_PUBLIC_` when they are safe for the browser.
- Enforce workspace ownership on every project, asset, job, usage, and export query.
- Validate file type, file size, content type, and storage path before accepting uploads.
- Use provider timeouts, bounded retries, rate limits, and spend limits.
- Redact secrets, prompts containing sensitive data, and signed URLs from logs.
- Record actor consent metadata separately from synthetic actor metadata.
- Apply AI disclosure and provenance in the final composition pipeline, not as an optional UI decoration.

## 11. UI system

Use shadcn/ui components as source-owned primitives. Prefer composition over one-off controls.

Recommended components include `Button`, `Card`, `Form`, `Input`, `Textarea`, `Select`, `Tabs`, `Dialog`, `Sheet`, `Command`, `Progress`, `Badge`, `Alert`, `Toast`, `Skeleton`, and a stepper built from accessible shadcn primitives.

UI requirements:

- Desktop-first video-generation workspace with responsive tablet and mobile behavior.
- Persistent left workspace sidebar and a generation layout with step rail, main input panel, and preview/output panel.
- Overview must let the user toggle between `likeness` and `ai_actor` before starting a generation.
- The likeness flow must collect portrait, reference video, and consent acknowledgement before generation.
- The AI actor flow must use synthetic Indian actor profiles and actor-compatible voice choices.
- Product placement must expose `present`, `use`, and `insert` presets.
- Video/audio duration is linked by default for 8–10, 20, and 30 second outputs.
- Autosave indicator with saved, saving, offline, and failed states.
- Loading, empty, partial, success, failed, retry, and needs-review states for every generation surface.
- Keyboard-operable dialogs, sheets, menus, selects, and step navigation.
- Screen-reader announcements for job status and validation errors.
- Never hide a failed generation behind an indefinite spinner.

## 12. Environment and deployment

Server-only environment variables:

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
SARVAM_API_KEY=
KLING_API_KEY=
OMNIHUMAN_API_KEY=
GOOGLE_AI_API_KEY=
SYNCSO_API_KEY=
```

Browser-safe environment variables must use the `NEXT_PUBLIC_` prefix and must never contain secrets.

Deployment rules:

- Deploy the Next.js application to Vercel using `next build` and `next start` semantics.
- Use the Node.js runtime for database, storage, provider, and job webhook handlers.
- Keep long-running generation work in Inngest functions.
- Use Supabase migrations and storage configuration as deployment prerequisites.
- Configure staging and production projects separately.
- Verify health, auth, storage, job execution, provider failure, export, and rollback paths before production cutover.

## 13. Verification and acceptance

Documentation and migration work is complete only when:

- The campaign flow and product brief requirements are represented here.
- Existing actors, projects, jobs, media paths, prompt options, keyframes, and exports remain readable.
- The target Next.js boundaries and server/client rules are unambiguous.
- API compatibility, async jobs, retries, provider outages, draft autosave, disclosure, workspaces, and storage behavior are specified.
- `AGENTS.md` agrees with this document.
- No secrets appear in source, documentation, logs, or examples.
- Type checks, lint, unit tests, and relevant Playwright flows pass for implementation changes.
- Legacy code has a documented retention reason and retirement trigger before removal.

## 14. Planning assumptions

- The current backend is Node/Express, not Python; no new Python backend should be introduced.
- The canonical agent file is `AGENTS.md`.
- npm remains the package manager.
- Supabase remains the database and media source of truth.
- Next.js stable latest is resolved at implementation time and recorded in `package.json`.
- SaaS-ready workspace ownership is designed now; billing and credit enforcement may follow the core pipeline.
- Vendor pricing, model availability, legal requirements, and competitor pricing must be revalidated before launch.
