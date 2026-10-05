# RealDev / Real Developer

Bilingual (Turkish/English) developer practice app with account-backed assessment, personal learning routes, notes and topic search.

## Implemented

- Eight-task initial assessment and 19-task catalog across nine areas.
- Choice answer keys and code-expression tests with expected/actual results.
- Written explanations and optional browser dictation, confidence and hint tracking.
- Evidence map distinguishes unmeasured, initial evidence, practice needed and two independent examples. Repeating one task does not increase distinct evidence.
- Personal daily routes based on goals, available minutes, gaps and 1/3/7-day review intervals.
- Persistent profile, answer history, question notes and resolved/open personal gap list.
- Saved question library: revisit the original question, inspect a previous answer and retry. Notes start collapsed; explanation criteria appear only for a submitted explanation and remain collapsed until opened.
- Turkish/English topic search, including data structures, API, React, Git and C#.
- Responsive dark/light themes.
- ChatGPT sign-in with first-use registration: display name, technologies, goals and daily time persist per user. The current deployment remains owner-private.
- Four editable JavaScript/debug exercises and a free playground using QuickJS in a Web Worker; saved code history is account-scoped.
- Specialty code tasks and interview/project practice for AI, data, mobile, frontend, API, .NET, DevOps and Unity. Only server-verified authored tasks add skill evidence; open-ended project responses are saved as notes and are not auto-graded.
- Optional account-scoped Piston execution for free-form Python, C# and Java. These runs are persisted with bounded output and explicitly excluded from skill scoring.
- Official live RSS feeds (OpenAI, GitHub, .NET and Kubernetes), cached 15 minutes with explicit stale/error status. Summaries are source excerpts, not generated claims.
- Public GitHub repository selector with commits, pull requests and Actions runs, cached five minutes.

## Local development

Requires Node.js 22.13+ (Node 24 recommended for the built-in SQLite preview adapter).

```sh
npm ci
npm test
npm run build
npm run dev
```

Open http://127.0.0.1:4317. Preview uses a fixed **local-only identity** and isolated SQLite file in `.local/preview.sqlite`. It binds to loopback. Never expose this development server publicly. The identity adapter is excluded from the production Worker.

To start the local Piston service on Docker Desktop, review `docker-compose.piston.yml` and run `./scripts/start-piston.ps1` in PowerShell. It binds only to `127.0.0.1:2000`, disables networking for code jobs and limits concurrent jobs, runtime, CPU, memory, output, processes, open files and file sizes. Piston requires a privileged Linux container for its Isolate/cgroup setup; Docker Desktop's Linux VM is the trust boundary. The script installs the Python, C# and Java packages that the Piston package index offers. Start `npm run dev` after Piston is ready. The local preview config points to `http://127.0.0.1:2000` by default; set `PISTON_URL` to override it.

Production Piston execution requires an authenticated private HTTP tunnel binding named `piston` (mapped to `CUSTOMER_HTTP_PISTON`) or another private `PISTON_URL` service configuration. The Site UI reports unavailable runtimes when that service is not connected; the browser never contacts the runner directly.

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

This is formative practice, not certification or an overall employment ranking. Choice tasks use authored answer keys. Code tasks accept a restricted side-effect-free expression subset: numbers, n, comparisons, arithmetic and logical operators. The assessment expression interpreter never executes arbitrary host JavaScript. A separate practice workspace runs JavaScript inside a QuickJS WebAssembly engine in a disposable Web Worker: 16 MB QuickJS heap, 256 KB stack, 350 ms interrupt budget, five-second worker cutoff, bounded input/output, and no exposed host networking, filesystem, DOM or account APIs. Browser test reports are explicitly unverified and excluded from server assessment scoring. Passing tests demonstrates behavior on the displayed inputs, not all possible inputs.

Written/spoken explanations are saved alongside explicit self-review criteria. They are **not AI-graded for technical accuracy**. Dictation depends on browser permission/support and may use the browser provider's recognition service. This app does not store audio.

Coverage is formative. AI/data/mobile/game-oriented tasks and additional area-specific interview/project scenarios broaden practice, but this is not a certification: several specialty prompts remain choice-based, open responses are not technically graded, and test cases cannot establish general expertise. Piston code is run and recorded, but free-form results do not add skill evidence. Remaining work includes broader real project/debugging evaluations, technical grading of explanations, private GitHub OAuth, access policy, account export/deletion and richer IDE diagnostics. Public news/GitHub data can be temporarily unavailable or rate-limited; cached stale data is labeled. Legacy local prototype scores are not imported as verified evidence.

## Publishing

Use the existing Sites project, preserve its audience, and deploy the exact pushed SHA with its Worker archive and migrations. Source is mirrored to git@github.com:melisau/RealDev.git. GitHub hosting does not independently deploy the live site.
