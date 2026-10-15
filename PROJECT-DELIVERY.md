# Project submission acceptance tests

The Interview and projects page accepts a bounded source bundle for three original educational templates. This is separate from AI review of a written report. It is not an arbitrary GitHub repository builder, React UI tester or complete game certification.

| Template | Accepted source | Acceptance scope |
| --- | --- | --- |
| Python reservation API | app.py, store.py | Real HTTP/SQLite: auth, validation, owner isolation, SQL inputs, concurrent slots, replay, restart persistence |
| .NET support board | src/Program.cs, src/Store.cs, src/Models.cs | Real ASP.NET Core/SQLite: auth, validation, owner isolation, SQL inputs, statuses, optimistic versions, restart persistence |
| Unity quest | Assets/Learner/QuestState.cs, Assets/Learner/QuestBehaviour.cs | Real Editor: four EditMode and four PlayMode checks for state, migration, events, pooling and scenes |

The API selects the suite and computes the score from eight test outcomes. A result must match the submission SHA-256, assignment, engine and suite version. User-supplied scores are ignored. Pending, disconnected and malformed results never enter skill evidence. Submissions are account-scoped and included in export/deletion. Passing this finite suite proves behavior on these checks, not expertise.

## Local setup

Use Docker Desktop with Linux containers. These project jobs do not require privileged containers. Existing Piston setup remains separate.

```powershell
docker pull python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1
docker build -f delivery/runner/Dockerfile.dotnet -t realdev-project-dotnet:20261015 delivery/runner
docker build -f delivery/runner/Dockerfile.tester -t realdev-project-tester:20261015 delivery/runner
npm run dev:projects
```

The preview generates its authentication token in process memory. The runner listens on 127.0.0.1:2002; the preview on 127.0.0.1:4317 uses an isolated local account. Stop both with Ctrl+C. To run the gateway separately, supply PROJECT_RUNNER_API_KEY through an untracked environment file or process secret store; at least 32 characters are required. Never put a real token in commands, GitHub or screenshots.

Download a starter bundle in the page, then unpack/pack the exact allowlisted files:

```powershell
npm run project:unpack -- --file starter.realdev.json --directory my-delivery
npm run project:pack -- --assignment booking-api --directory my-delivery --out answer.realdev.json
```

Upload the resulting JSON or select the template folder. Limits are 60 KB per file and 120 KB total. No ZIP extraction, learner dependency installation, custom shell command or arbitrary path is accepted.

## Isolation and trusted tests

API/.NET learner and tester use separate containers, PID spaces and filesystems. Only their isolated loopback network namespace is shared; neither has external network access. Tests own their random inputs and directly inspect SQLite through a read-only volume. Learner containers run as a non-root user with dropped capabilities, no new privileges, read-only root filesystem and bounded CPU, memory, processes, output and time. Source is read-only. Temporary containers, source directories and database volumes are removed in finally blocks. The gateway has a small authenticated queue and two-job concurrency cap. This educational single-host service still needs operational hardening, monitoring and workload testing before broad public use.

Unity needs an operator-prepared activated Unity 2022.3.50f1 Linux image with Test Framework 1.1.33. Build delivery/runner/Dockerfile.unity using UNITY_BASE_IMAGE and set PROJECT_UNITY_IMAGE to that dedicated image. Do not mount a personal Unity home, password, license credential directory or Docker socket into a student job. The application reports Unity unavailable until this image exists. In-process engine tests are educational acceptance evidence, not a tamper-proof exam.

## Hosted connection

Set PROJECT_RUNNER_URL to the authenticated HTTPS gateway origin and PROJECT_RUNNER_API_KEY as a secret through Sites environment tools, or use a registered project_runner private HTTP binding. An explicit URL takes precedence over the legacy Piston binding. Never expose Docker or the unauthenticated raw runner API. Preserve existing Firebase, VAPID and Piston settings. Localhost alone is not reachable from the hosted Site. A PC-based tunnel requires the computer, Docker, runner and tunnel to remain awake; a domain does not solve uptime. Do not label live tests ready until GET /api/deliveries reports the selected runtime available.

## Verified on 15 October 2026

Real Docker reference runs: Python 8/8 and .NET 8/8. Incomplete starter projects: both 0/8. Installed Unity 2022.3.50f1 reference run: four EditMode and four PlayMode tests passed. The installed-editor fixture run is not a live student sandbox, and no licensed isolated Unity image was connected by this change. Server integration tests additionally reject forged/stale reports and cross-account access.

Official technical references: [ASP.NET Core integration testing](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests), [Docker run](https://docs.docker.com/engine/containers/run/), [Unity test runner command line](https://docs.unity3d.com/Packages/com.unity.test-framework@1.1/manual/reference-command-line.html). Contracts, fixtures and test cases are original project material.
