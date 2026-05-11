# Transcribe

A meeting transcript processor that turns raw transcripts into structured notes with summaries, key decisions, action items, and follow-up emails.

Built as a deployable app template for the [Jobgraph](https://app.jobgraph.com) platform.

## Development

```bash
npm install
npm run dev
```

In local mode (no `VITE_DEPLOYMENT_ID`), the app uses mock data for processing.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_DEPLOYMENT_ID` | Jobgraph deployment ID. Omit for local dev (uses mock data). |

## Deploy to Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist
```

Or connect the repo to Cloudflare Pages with build command `npm run build` and output directory `dist`.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Cloudflare Pages (hosting)
- Jobgraph API (config + processing)
