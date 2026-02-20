# Frontend (React + Vite)

UGC MVP frontend connected to backend APIs.

## Run

```bash
cd frontend
npm install
npm run dev
```

Set API base (optional, defaults to `http://localhost:4000`):

```bash
cp .env.example .env
```

## Flow Covered

1. Fetch actor catalog
2. Create project
3. Upload product image
4. Save brief
5. Generate prompt options + poll job
6. Select prompt option
7. Generate keyframes + poll job
8. Download keyframes
9. Export ZIP
10. Regenerate prompts/keyframes
