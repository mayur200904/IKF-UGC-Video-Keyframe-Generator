# Hiveminds Studio Wireframe

This directory is a static HTML prototype. It has no database connection, API calls, credentials, or private media dependencies.

## Run locally

From the repository root:

```bash
cd wireframe
python3 -m http.server 4173
```

Open [http://localhost:4173/](http://localhost:4173/).

## Publish a shareable link

The simplest option is Vercel’s static deployment:

```bash
npx vercel --prod ./wireframe
```

Sign in when the CLI prompts you. Vercel will return an HTTPS URL that can be shared with reviewers. No environment variables are required for this prototype.

Alternatively, import the repository into Vercel and set the project root to `wireframe/`; leave the build command empty and use the default output directory.

This is a presentation prototype only. A public deployment should not be treated as the production Next.js application until authentication, workspace ownership, media access, and Supabase integration are implemented.
