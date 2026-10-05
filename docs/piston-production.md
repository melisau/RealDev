# Production Piston connection

## Current activation status

The local Piston Docker service supports Python, C# and Java and binds to `127.0.0.1:2000` only. Real execution smoke tests pass in all three languages. The live Site has no runner URL or registered private tunnel. It remains disconnected until an always-on host or a registered Sites tunnel is supplied. This repository does not provision a paid server, register a tunnel, or change the Site audience.

## Runner boundary

Keep Docker's port on loopback. Do not publish port 2000 or the Piston package-management API. The existing Docker service is privileged: its approved current use is localhost only. Installing it on a new host requires reviewing that host's isolation and privileges. Use a dedicated runner machine with no application database, cloud credentials, private repository keys or other tenants. Do not place untrusted code execution beside the application server.

`scripts/piston-gateway.mjs` is a separate Node 22+ process listening on `127.0.0.1:2001`. A stable HTTPS reverse proxy or registered private tunnel should forward to this gateway. It requires a secret bearer token, permits only runtime listing and execution, rebuilds execution limits, excludes package management and arbitrary additional files, bounds request/output bytes, and permits two simultaneous upstream requests and 60 requests per minute by default. It does not enable browser CORS. Authentication belongs to the server connection; never put this token in browser JavaScript.

## Prepare a host

1. Supply an always-on dedicated host and a stable HTTPS origin or an exact registered Sites logical tunnel ID. Free temporary tunnel URLs are not a durable deployment plan.
2. Review the privileged Docker configuration before installing Piston there. Install the language packages with the existing setup script or Piston's official package API, accessible locally only. Keep runtime provisioning outside the public gateway.
3. Generate a separate cryptographically random 32-byte secret and put its hexadecimal form into the host's secret manager as `PISTON_API_KEY`. Generate/store it through the secret manager or write directly into an owner-readable secret file; do not print it to shared terminal output. Keep it out of terminal logs, Git, public files and chat. An example environment file is deliberately not included.
4. Run `node scripts/piston-gateway.mjs` with that secret set. Use a supervisor to restart the gateway and Docker after reboot. Set `PISTON_GATEWAY_PORT` if 2001 is already in use. `PISTON_REQUESTS_PER_MINUTE` may be set from 1 through 600.
5. Configure a stable TLS reverse proxy to forward only to `127.0.0.1:2001`, with a 128 KiB request cap and at least a 20-second upstream timeout. If using a private tunnel, register it with Sites first. Do not invent or substitute a Cloudflare UUID for a Sites tunnel ID. Public-facing host firewalls should allow HTTPS only; the loopback ports must stay closed externally. Do not expose this gateway over plain public HTTP.

## Apply to the existing Site

Preserve project `appgprj_6ac365c4fd488191880cf599feb03233` and its current audience. Use one transport:

- HTTPS gateway: set the production runtime value `PISTON_URL` to its origin (for example `https://runner.example.com`, no path, embedded credentials, query or fragment). Set `PISTON_API_KEY` as a **secret** with the same value as the gateway. Non-loopback connections require HTTPS and a secret of at least 32 characters. The client does not follow redirects.
- Sites private HTTP tunnel: bind the exact registered tunnel ID with alias `piston`, exposed to the Worker as `CUSTOMER_HTTP_PISTON`. Point it at the authenticated gateway and set the same secret `PISTON_API_KEY`. The client prefers this binding to `PISTON_URL`.

Deploy a saved Site version after setting runtime values or bindings. Never store runtime secrets or tunnel IDs in `.openai/hosting.json`. Do not use the development web server as the gateway: it has a synthetic local identity and is not a production authentication boundary.

## Validate before announcing it connected

Set `PISTON_URL` and `PISTON_API_KEY` in a protected environment and run `node scripts/verify-piston.mjs`. All three real programs must return `42`. Verify requests without the key fail, package-management routes fail, redirect destinations cannot receive the key, and resource/concurrency limits are enforced. Then sign into the live Site, load its runtime list and execute/save one program in each language; check saved history after reload and isolation with a second account.

Free-form Piston output is stored as **executed, unscored**. Successful execution alone does not imply a correct answer or mastery. Authored multi-language tasks with independent tests must be implemented separately before those runs can contribute to skill evidence.

## Operations

Monitor runtime availability, authentication failures, saturation, execution errors, disk use and host patching. Keep backups of configuration without exposing secrets; retain application history in the existing account database. Rotate the gateway secret on both ends together. If the runner is retired, remove its production URL/secret or tunnel binding and redeploy; the Site will report it disconnected.

Official runner documentation: https://github.com/engineer-man/piston
