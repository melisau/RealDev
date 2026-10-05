# RealDev / Real Developer

Bilingual (Turkish/English) developer practice app with account-backed assessment, personal learning routes, notes and topic search.

## Implemented

- Eight-task initial assessment and 19-task catalog across nine areas.
- Choice answer keys and code-expression tests with expected/actual results.
- Written explanations and optional browser dictation, confidence and hint tracking.
- Evidence map distinguishes unmeasured, initial evidence, practice needed and two independent examples. Repeating one task does not increase distinct evidence.
- Personal daily routes based on goals, available minutes, gaps and 1/3/7-day review intervals.
- Persistent profile, answer history, question notes and resolved/open personal gap list.
- Turkish/English topic search, including data structures, API, React, Git and C#.
- Responsive dark/light themes.

## Local development

Requires Node.js 22.13+ (Node 24 recommended for the built-in SQLite preview adapter).

```sh
npm ci
npm test
npm run dev
```

Open http://127.0.0.1:4317. Preview uses a fixed **local-only identity** and isolated SQLite file in `.local/preview.sqlite`. It binds to loopback. Never expose this development server publicly. The identity adapter is excluded from the production Worker.

```sh
npm run db:generate   # after changing db/schema.ts
npm run build        # dist/server/index.js Worker bundle
```

## Architecture and security

- `web/`: existing vanilla frontend; assessment.js owns new learning flows.
- `server/catalog.mjs`: versioned bilingual tasks and official references.
- `server/assessment.mjs`: deterministic scoring, restricted expression interpreter, evidence and routes.
- `server/api.mjs`: identity, ownership, input checks, idempotent recording and notes.
- `db/schema.ts`, `drizzle/`: schema and generated migrations.
- `scripts/`: build, local preview and test-only SQLite adapter.
- `tests/`: grading, route, storage, ownership, notes, retry and failure tests.

Production runs on the existing private Sites project. The hosting manifest declares logical D1 binding DB. Sites provisions storage and applies migrations before publishing. The oai-authenticated-user-id header is trusted **only behind the Sites authenticated dispatcher**, which owns sign-in and identity forwarding. Every user query is scoped to that ID. Service credentials without a user identity cannot access account APIs. Browser mutations require same-origin JSON. User IDs are never accepted from request bodies.

The Worker bundles frontend assets. Dependencies, generated output, local databases and secrets are excluded from Git. Profile, attempts and notes live in D1. Browser storage is used by theme/language preferences and retained legacy prototype modules, not the new learning records.

## Assessment boundaries

This is formative practice, not certification or an overall employment ranking. Choice tasks use authored answer keys. Code tasks accept a restricted side-effect-free expression subset: numbers, n, comparisons, arithmetic and logical operators. No arbitrary user program is executed. Passing tests demonstrates behavior on the displayed inputs, not all possible inputs.

Written/spoken explanations are saved alongside explicit self-review criteria. They are **not AI-graded for technical accuracy**. Dictation depends on browser permission/support and may use the browser provider's recognition service. This app does not store audio.

Coverage is limited. AI/data/mobile goals currently use shared foundation tasks; specialist competency is not claimed. News, legacy error-lab and GitHub cards retain the earlier prototype behavior. News is curated static content, not a live feed. Legacy local prototype scores are not imported as verified evidence.

## Publishing

Use the existing Sites project, preserve its audience, and deploy the exact pushed SHA with its Worker archive and migrations. Source is mirrored to git@github.com:melisau/RealDev.git. GitHub hosting does not independently deploy the live site.
