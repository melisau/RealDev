# RealDev

Turkish/English developer practice with persistent accounts, evidence-based assessment, topic search and personal learning routes.

## Learning and account features

- Eight-task initial scan and 168 bilingual assessment questions across 13 areas, including the latest 52 original sourced scenarios (8 October 2026). Topic tags are searchable; answers retain the individual question version. Choice results alone do not certify expertise. See [project status and remaining work](PROJECT-STATUS.md).
- Question notes, saved-question library, written explanations and answer/code history.
- Four resumable projects (API service, search/offline sync, event ingestion/retrieval, and a versioned API/data service), each with implementation, debugging and transfer stages. Twelve executable Python/C# tasks use five independent cases each; the new SQLite tasks cover repeatable schema migrations, owner-scoped keyset pagination, idempotent batch ingestion, rollback and log-based debugging. Prerequisites are checked on the server; every submission is persisted under its owner.
- Eleven sourced technical code reviews across API retries, SQL migrations, pagination incidents, React, .NET, Kubernetes, Unity, AI, data and game physics. Open-ended review responses use explicit self-review criteria and are not presented as automatically verified correctness.
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

The production connection is prepared with `scripts/piston-gateway.mjs`: loopback-only, secret bearer authentication, two permitted routes, enforced execution limits, bounded request/output and a concurrency/rate cap. HTTPS connections use `PISTON_URL` plus secret `PISTON_API_KEY`; public plain HTTP and redirects are rejected. A private Sites binding can use the same authenticated gateway. `scripts/verify-piston.mjs` performs real smoke tests for all three languages. See [deployment and activation checklist](docs/piston-production.md). A stable host or registered private tunnel is still required; no temporary public runner is automatically created.

Nine authored Python/C#/Java tasks cover positive-only aggregation, stable deduplication debugging and game-health bounds transfer. Each language has all three tasks and each submission is run against five server-defined stdin/output cases in separate Piston executions. Three additional Python/SQLite project tasks cover repeatable schema migration, stable owner-scoped pagination and idempotent event batches. Each of those is run against five independent JSON request/expected response cases with real in-memory SQLite. The server ignores client grades, checks compile/run exit conditions and saves verified results in account code history. Only current-suite, server-verified authored results enter the skill map. Equivalent tasks in different languages share one evidence family, preventing three language ports from becoming three independent mastery claims; the latest result is used. Free-form runs remain unscored. A failed or missing runner saves no result. Per-account authored submissions are capped at 12 per 15 minutes, in addition to gateway concurrency/rate limits. `scripts/verify-polyglot.mjs` checks both buggy starters and working fixtures using a real runner. The live runner activation constraint still applies.

## Search visibility and routes

The Site has distinct clean URLs for the workspace areas and public previews. Only the public landing page and two sample pages are indexable; account-specific work areas send `noindex, nofollow`. Each route receives its own title, description, Open Graph metadata and canonical URL. `/robots.txt` and `/sitemap.xml` are generated from the public routes. Legacy hash links continue to open the matching clean route.

## Architecture and publishing

- `web/`: vanilla UI; `assessment.js` owns scans/notes, `learning.js` owns account controls, projects, AI feedback and audio.
- `server/`: authenticated API, account lifecycle, curated catalogs, evidence, live feeds and server-only AI adapter.
- `sandbox/`: QuickJS, authored practical tasks and optional Piston client.
- `db/schema.ts`, `drizzle/`: D1 schema and generated migrations.
- `tests/`: ownership, atomic deletion, source freshness, project prerequisites, sandbox execution, quote validation, quotas and audio consent.

The published Site is public; anyone with its URL can open the public landing page and samples. Personal learning features require a verified account. Sites provisions logical D1 binding `DB` and applies source migrations before deployment. Identity headers are trusted only behind the Sites authenticated dispatcher. Every personal query is owner-scoped; user IDs and grades from request bodies are never trusted. Mutations require same-origin requests. JSON and audio bodies are bounded while streaming. Service keys never reach browser assets, source control or exports.

Publish the exact pushed source SHA with its Worker archive. Source is mirrored to `melisau/RealDev`; GitHub does not independently deploy the Site. `.env*`, local databases, verification screenshots and generated bundles are ignored. Production activation still requires available API credit and a stable Piston host/registered private tunnel. Unrestricted real-world IDE execution, private GitHub OAuth and native mobile packaging are separate future work.
