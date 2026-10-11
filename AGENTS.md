# Agent Instructions

This repository is migrating from a React/Vite frontend and Node/Express backend to one Next.js full-stack application. Read `Architecture.md` before making product, architecture, data, API, provider, deployment, or UI changes.

## Source of truth

- `Architecture.md` is the canonical product and technical architecture document.
- Existing `frontend/` and `backend/` code is legacy migration input until parity and cutover are verified.
- Supabase Postgres and Supabase Storage are the durable data and media sources of truth.
- If code and architecture disagree, stop and identify the mismatch before making a broad change.
- Update `Architecture.md` when a product, schema, provider, runtime, deployment, or workflow decision changes.

## Target stack

All new application work must use:

- Stable latest Next.js with App Router and TypeScript.
- React latest and Server Components by default.
- Client Components only for state, event handlers, browser APIs, file APIs, or interactive UI.
- Tailwind CSS v4 and shadcn/ui.
- Drizzle ORM for typed Postgres access and migrations.
- Zod for all external input and domain validation.
- React Hook Form for multi-step form state.
- TanStack Query for client-side job polling and mutation state.
- Supabase Postgres, Storage, and Auth.
- Inngest durable jobs for AI generation and other long-running work.
- Vercel Node.js runtime for deployment.

Do not introduce Python, Express, Vite, a second backend, or a second frontend in the target architecture. Legacy code may be read or adapted for parity but should not receive new product features.

## Required workflow

1. Read `Architecture.md` and the relevant existing implementation before editing.
2. Identify whether the change is a UI, API, domain, persistence, provider, job, security, or deployment change.
3. Preserve existing Supabase IDs, media paths, response shapes, and data unless a migration explicitly says otherwise.
4. Make the smallest compatible change.
5. Add or update validation and tests at the affected seam.
6. Run relevant type checks, lint, unit tests, and browser tests.
7. Update `Architecture.md` when the change introduces a durable decision.
8. Report what was changed, what was verified, and any remaining risk.

## Next.js boundaries

- Use `src/app` for routes, layouts, loading states, errors, metadata, and Route Handlers.
- Use `src/components/ui` for source-owned shadcn components.
- Use `src/features` for feature-level UI and client composition.
- Use `src/server` for database access, authorization, storage, provider adapters, jobs, and secrets.
- Server-only modules must not be imported by Client Components.
- Route Handlers must validate, authorize, invoke a service, and return a safe stable response.
- Prefer direct server data access from Server Components instead of making a server-side HTTP call to the application’s own Route Handler.
- Use Route Handlers for browser APIs, compatibility endpoints, uploads, webhooks, and public HTTP contracts.
- Do not use local filesystem state as production persistence.

## API and data compatibility

The first migration must preserve the current API behavior:

- `/v1/actors`
- `/v1/projects`
- `/v1/jobs`
- project brief and product-image operations
- prompt option generation, listing, selection, and regeneration
- keyframe generation, listing, and regeneration
- project export

Preserve status codes, error codes, response fields, IDs, idempotency behavior, Supabase object paths, and existing media URLs until a versioned contract change is approved.

Use Drizzle migrations additively. Never drop tables, delete rows, rewrite media, or change IDs as part of an ordinary feature. Do not run destructive database commands without explicit user authorization and a rollback plan.

## AI and job rules

- Provider calls belong in server-only adapters, never in UI components or Route Handler bodies directly.
- Use common interfaces for script, voice, image, video, lip-sync, composition, and export providers.
- Initial provider choices are documented in `Architecture.md`; provider names and prices are configuration, not business logic.
- Use durable Inngest jobs and Postgres job records for all generation work.
- Do not depend on in-memory queues, process-local state, long-running Vercel requests, or local files.
- Every job must have a status, progress, idempotency key where applicable, bounded retry policy, timeout, safe error, and observable provider run.
- Generation responses must support `queued`, `running`, `completed`, `failed`, and `needs_review`.
- Record provider, model, prompt version, inputs, warnings, usage, and estimated cost without recording secrets.
- Apply AI disclosure, provenance, claim-risk checks, and consent rules before final export.

## Security and privacy

- Never commit or print API keys, database URLs, service-role keys, signing keys, access tokens, or private customer media.
- Keep `DATABASE_URL`, provider keys, Supabase service-role keys, and job signing keys server-only.
- Only expose safe browser values with `NEXT_PUBLIC_` prefixes.
- Authorize workspace ownership for every project, product, asset, creator, job, usage, and export read/write.
- Validate file type, file size, content type, storage path, and URL inputs.
- Redact signed URLs, prompts containing sensitive data, and credentials from logs.
- Treat real-person faces and voices as consent-sensitive assets. Synthetic actors are the default.

## shadcn/ui requirements

The official shadcn skill is installed at the Codex skills directory and must be used for shadcn work. The project must use the repository’s `components.json` as the source of truth for aliases, base library, theme, and icon library.

Before adding or changing UI primitives:

1. Inspect `components.json`.
2. Use the shadcn skill and CLI documentation for the component.
3. Search for an existing shadcn component before writing a custom equivalent.
4. Prefer composition of `Button`, `Card`, `Form`, `Input`, `Textarea`, `Select`, `Tabs`, `Dialog`, `Sheet`, `Command`, `Progress`, `Badge`, `Alert`, `Toast`, and `Skeleton`.
5. Keep generated component source in the repository and make intentional local changes.
6. Preserve keyboard navigation, focus management, ARIA semantics, validation announcements, and responsive behavior.

Use the project package manager for shadcn commands. With the current npm convention, examples are:

```bash
npx shadcn@latest info --json
npx shadcn@latest docs button dialog form
npx shadcn@latest add button card dialog form input textarea
```

Do not overwrite locally customized shadcn components without inspecting the diff and receiving explicit approval.

## UX requirements

New user-facing work must use video-generation terminology and must not add new campaign-first screens. The current product UX has two generation modes:

- `likeness`: portrait upload, reference video upload, consent acknowledgement, product, placement, direction, voice, duration, review, and export.
- `ai_actor`: Indian synthetic actor selection, product, placement, creative brief, language, actor-compatible voice, duration, review, and export.

Both modes must include:

- Product image or URL input, product details, benefits, trust points, and CTA.
- Three product-placement presets: present, use, and product close-up.
- Linked video/audio duration presets for 8–10 seconds, 20 seconds, and 30 seconds.
- Indian-language and regional voice preferences.
- Autosaved draft state and visible save status.
- Persistent step rail, preview panel, and fixed workspace sidebar.
- Asynchronous job progress and recoverable error states.
- AI disclosure and provenance review before export.
- Video history, duplicate, download, share, and project reload behavior.

The likeness mode must not continue without an explicit consent acknowledgement. The production application must persist consent evidence and enforce private access for likeness assets. Legacy campaign/project API contracts remain supported behind compatibility adapters.

Every user-facing async action needs explicit loading, empty, partial, success, failed, retry, and needs-review states. Never leave an indefinite spinner without a recovery action.

## Testing and verification

For implementation changes, use the narrowest relevant checks and include regressions:

- TypeScript/type generation.
- ESLint.
- Unit tests for schemas, services, provider adapters, job transitions, and compatibility responses.
- Integration tests for Supabase-backed persistence where configured.
- Playwright flows for likeness video creation, AI actor video creation, draft restore, job polling, product-placement review, export, and failure recovery.
- `git diff --check` for changed text and code.

Do not claim completion from a build alone. Verify the changed user or API seam and state what was not covered.

## Documentation and change discipline

- Keep `Architecture.md` and this file aligned.
- Use exact names for routes, environment variables, job statuses, and domain types.
- Mark vendor prices, model availability, competitor data, and legal assumptions as time-sensitive.
- Do not copy secrets or real customer data into examples.
- Do not create duplicate agent instruction files such as `Agents.md`.
- Preserve unrelated working-tree changes.

## Installed agent skills

The repository includes the requested skills from skills.sh/GitHub:

- `wireframer` from `agilek/wireframer-skill` for standalone clickable prototypes.
- `frontend-design` from `anthropics/skills` for deliberate visual design and UI critique.
- `find-skills` from `vercel-labs/skills` for discovering additional compatible skills.

When using these skills, review their local `SKILL.md` instructions first. Do not copy credentials, customer media, or machine-specific paths into project documentation.
