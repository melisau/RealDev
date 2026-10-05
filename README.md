# RealDev

Turkish/English developer practice with persistent accounts, evidence-based assessment, topic search and personal learning routes.

## Learning and account features

- Eight-task initial scan, broad choice/error scenarios, safe expression tests, confidence and hint tracking.
- Question notes, saved-question library, written explanations and answer/code history.
- Three resumable projects (API service, search/offline sync, event ingestion/retrieval), each with implementation, debugging and transfer stages. Nine new executable tasks include edge cases and expected/actual output. Prerequisites are checked on the server; every submission is persisted under its owner.
- Eight sourced technical code reviews across SQL, React, .NET, Kubernetes, Unity, AI, data and game physics.
- Optional AI evaluation of written explanations using explicit rubric criteria and verbatim learner quotes. Scores are computed from the validated rubric and labeled **AI provisional**, separate from independently verified test evidence.
- Evidence distinguishes task modalities. Five choice answers alone never establish depth; repeated tasks use their latest result. Stronger test support requires project, transfer and code/debug evidence. This is formative practice, not a professional certification.
- Account JSON export includes profile, attempts, hints, notes, library, GitHub selection, code, practical submissions and AI usage counts. Deletion is atomic and scoped to the signed-in owner. Learning reset preserves the profile; account deletion removes all RealDev personal records. Typed confirmation is mandatory. Neither operation deletes the ChatGPT account or shared public-source cache.
- Microphone recording or audio file upload can be transcribed on the server. Browser SpeechRecognition is not required. Explicit consent is required before audio or private explanations are sent to OpenAI. Audio is not saved in RealDev storage; transcripts remain editable before submission.
- Responsive dark/light themes and Turkish/English UI.

## Live news and GitHub

Official OpenAI, GitHub, .NET and Kubernetes feeds use a 15-minute cache and a 60-second refresh cooldown. Failed refreshes show the last successful check and error. Unverified data older than 24 hours is excluded from the current list and available in an explicitly labeled archive.

AI news summaries are generated **from the title and RSS excerpt**, not the full article. Each summary sentence includes a verbatim source quote; the server rejects invented quotations. Summaries are cached by source-text hash, language and model, so a changed excerpt invalidates its cache. Stale feed entries cannot receive a new AI summary. Quotes validate traceability, not semantic correctness; the original source remains available.

Public GitHub integration reads commits, pull requests, Actions and languages. It grants no private repository access, pushes or workflow execution.

## Local development

Requires Node 22.13+; Node 24 is recommended for the built-in SQLite adapter.

```sh
npm ci
npm test
npm run build
npm run dev
```

Preview defaults to `http://127.0.0.1:4317` with an isolated local identity and SQLite database. `REALDEV_PORT` selects another loopback port and a separate preview database. Never expose this development identity adapter publicly. It is excluded from the production Worker.

The preview loads ignored `.env.local` when present. Production uses Site runtime secrets. Required secret for AI: `OPENAI_API_KEY`; optional settings: `OPENAI_TEXT_MODEL` (default `gpt-4.1-mini`) and `AI_DAILY_LIMIT` (default 20 requests per user/day per text or audio category, including failed attempts). Transcription uses `gpt-4o-mini-transcribe`. API usage requires available OpenAI API credit, separate from a ChatGPT subscription. Missing credentials, exhausted credit, rate limits and invalid/ungrounded responses have explicit errors; no placeholder output is presented as AI-generated. Model responses use `store:false`; provider data handling is governed by its own policy.

## Code execution

Authored JavaScript tasks run in bounded QuickJS with 16 MB heap, 256 KB stack and 350 ms execution budget, no host network, filesystem, DOM or account access. The server reruns submitted code against authored tests; client-provided grades are ignored. Passing test fixtures is evidence for the task contract, not exhaustive proof.

Optional Piston supports free-form Python, C# and Java. Run `scripts/start-piston.ps1` after reviewing `docker-compose.piston.yml`; it binds to localhost only. Production needs an authenticated private `piston` HTTP tunnel (`CUSTOMER_HTTP_PISTON`) or a private runner configuration. Piston runs are bounded, persisted and unscored. Local Docker availability is not evidence of a connected production runner.

## Architecture and publishing

- `web/`: vanilla UI; `assessment.js` owns scans/notes, `learning.js` owns account controls, projects, AI feedback and audio.
- `server/`: authenticated API, account lifecycle, curated catalogs, evidence, live feeds and server-only AI adapter.
- `sandbox/`: QuickJS, authored practical tasks and optional Piston client.
- `db/schema.ts`, `drizzle/`: D1 schema and generated migrations.
- `tests/`: ownership, atomic deletion, source freshness, project prerequisites, sandbox execution, quote validation, quotas and audio consent.

The existing Site remains owner-private. Sites provisions logical D1 binding `DB` and applies source migrations before deployment. Identity headers are trusted only behind the Sites authenticated dispatcher. Every personal query is owner-scoped; user IDs and grades from request bodies are never trusted. Mutations require same-origin requests. JSON and audio bodies are bounded while streaming. Service keys never reach browser assets, source control or exports.

Publish the exact pushed source SHA with its Worker archive. Source is mirrored to `melisau/RealDev`; GitHub does not independently deploy the Site. `.env*`, local databases, verification screenshots and generated bundles are ignored. The remaining production activation constraint is available API credit; unrestricted real-world IDE execution, private GitHub OAuth and native mobile packaging are separate future work.
