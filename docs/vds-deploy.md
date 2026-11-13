# VDS deployment

This is the second way to host RealDev, next to the Sites Worker described in the README. The same Worker bundle runs under Node in one container; data lives in a file-backed SQLite database on a Docker volume instead of D1.

| Piece | File |
| --- | --- |
| Image (build, QuickJS self-check, non-root runtime) | `deploy/vds/Dockerfile` |
| Node host: Request/Response bridge, `/healthz`, graceful shutdown | `deploy/vds/server.mjs` |
| `.wasm` import hook for the precompiled QuickJS module | `deploy/vds/register.mjs`, `deploy/vds/wasm-loader.mjs` |
| Compose service, volume and proxy network | `compose.vds.yaml` |
| Environment template | `.env.vds.example` |

## What the container does and does not do

- Listens on `8080` inside the external Docker network `berkdev-proxy` only. It publishes no host port; TLS and the public domain belong to the shared Caddy proxy in `/opt/proxy`.
- Refuses to start without `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY`. Identity comes only from a verified Firebase ID token; the platform identity headers used by Sites are stripped from every request.
- Applies pending `drizzle/*.sql` migrations at startup, each in its own transaction, and records them in `local_migrations`.
- Opens the database in WAL mode with `synchronous=NORMAL` and a 5-second `busy_timeout`.
- Runs read-only as user `node` with `no-new-privileges` and a 512 MB memory limit. Only `/data` (volume) and `/tmp` (tmpfs) are writable.
- Does **not** run untrusted Python/C#/Java or project submissions. Piston and the project runner stay on a separate host (see `docs/piston-production.md`); set their HTTPS URLs and keys here only when such a host exists.
- Does **not** back itself up, rotate logs beyond Docker's defaults, or alert on failure. See the sections below.

## First deployment

1. On the server, clone the repository and check out the commit to deploy.
2. Create the environment file and restrict it:

   ```bash
   cp .env.vds.example .env.vds && chmod 600 .env.vds
   ```

   Fill in `PUBLIC_ORIGIN`, `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY`. Everything else is optional and switches the matching feature on. Write secrets directly into this file; do not pass them as command arguments or paste them into chat.
3. In the Firebase console, add the public domain under Authentication → Settings → Authorized domains (see `docs/firebase-auth.md`).
4. Make sure the proxy network exists (`docker network ls` should list `berkdev-proxy`), then build and start:

   ```bash
   docker compose -f compose.vds.yaml up -d --build
   ```

   The build fails if the precompiled QuickJS module cannot grade a reference solution.
5. Add the site to the shared Caddy configuration and reload Caddy. A minimal site block, to adapt to the existing Caddyfile:

   ```
   realdev.example.com {
       encode zstd gzip
       header {
           Strict-Transport-Security "max-age=31536000"
           X-Frame-Options "DENY"
       }
       reverse_proxy realdev:8080
   }
   ```

   The application itself sends only `X-Content-Type-Options` and `Referrer-Policy`; HSTS and framing protection must come from the proxy.
6. Verify:

   ```bash
   docker inspect --format '{{.State.Health.Status}}' realdev
   ```

   This should print `healthy` within about 30 seconds. Then open the public origin, sign in with a real account and run one JavaScript exercise.

## Updating

```bash
git pull --ff-only
```

```bash
docker compose -f compose.vds.yaml up -d --build
```

Take a backup first when the update contains a new file in `drizzle/`. Migrations only move forward; rolling back to an older image after a schema change means restoring the backup taken before it.

## Backup

`VACUUM INTO` writes a consistent single-file copy while the server keeps running. Do not copy `realdev.sqlite` directly from the volume: without its `-wal` file the copy can miss recent writes.

```bash
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
docker exec -e STAMP="$STAMP" realdev node -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync(process.env.REALDEV_DB_FILE);d.exec('PRAGMA busy_timeout=5000');d.exec('VACUUM INTO \'/data/backup-'+process.env.STAMP+'.sqlite\'');d.close()"
docker cp realdev:/data/backup-$STAMP.sqlite ./realdev-$STAMP.sqlite
docker exec realdev rm /data/backup-$STAMP.sqlite
```

Run this from cron (daily is a reasonable start), keep several generations, and copy them off the server. A backup that has never been restored is not yet proven; rehearse the restore below once on a scratch volume.

The file contains every account's learning data. Store it encrypted and with the same care as `.env.vds`.

## Restore

```bash
docker compose -f compose.vds.yaml stop web
```

```bash
docker run --rm -v realdev_realdev-data:/data -v "$PWD":/backup alpine sh -c "cp /backup/realdev-STAMP.sqlite /data/realdev.sqlite && rm -f /data/realdev.sqlite-wal /data/realdev.sqlite-shm && chown 1000:1000 /data/realdev.sqlite"
```

```bash
docker compose -f compose.vds.yaml start web
```

Replace `realdev-STAMP.sqlite` with the backup's file name. The stale `-wal`/`-shm` files must be removed, otherwise SQLite replays old writes over the restored file. `1000:1000` is the `node` user in the image.

## Reminders

`scripts/dispatch-reminders.mjs` (run hourly by `.github/workflows/reminders.yml`) calls exactly one origin, the `reminderOrigin` constant in that script. For this deployment to send daily reminders:

- that constant must equal this deployment's `PUBLIC_ORIGIN`;
- `REMINDER_DISPATCH_TOKEN` here must equal the GitHub secret `REALDEV_REMINDER_DISPATCH_TOKEN`;
- the VAPID keys must be the ones existing devices subscribed with, otherwise users have to enable reminders again;
- `REMINDER_SCHEDULE_ENABLED=1` only once the above holds.

Only one deployment may be the dispatch target. Do not leave two deployments sending from the same subscriptions. Details: `docs/reminder-delivery.md`.

## Moving data from Sites (D1)

The two deployments have separate databases. Pointing the domain at the VDS does not carry accounts' learning data over. A migration needs a D1 export imported into `/data/realdev.sqlite` while the container is stopped; this repository has no script for it yet.

## Not covered yet

- Automated off-server backups and a rehearsed restore.
- External uptime monitoring and error alerting (the container health check restarts nothing by itself and notifies no one).
- CI does not build this image; a broken Dockerfile is found only at deploy time.
- Load testing against the 512 MB limit and single-process SQLite.
