# Runner host on an Ubuntu VDS (Piston + project runner)

The Site stays on Sites. A separate Ubuntu server runs code execution 7/24:

```
Browser ──► Site (Sites) ──HTTPS + bearer key──► runner.<domain> (Caddy, TLS)
                                                   └► 127.0.0.1:2001 piston-gateway ─► 127.0.0.1:2000 Piston (Python/C#/Java)
                                                                      └► 127.0.0.1:2002 project-gateway ─► throwaway Docker jobs
```

Only ports 22, 80 and 443 are open. Piston and both gateways listen on loopback. The bearer key exists only in
`/etc/realdev/runner.env` on the server (root, 0600) and in the Site's secrets.

Deploys are automatic: a merge into the `production` branch runs the tests and build, then GitHub Actions connects over
SSH with a deploy-only key, deploys that exact commit, runs a health check (unauthenticated request refused; Python, C#
and Java programs print 42; both project assignments available) and rolls back to the previous release if the check fails.

## Before you start

- Ubuntu 22.04 or 24.04, 4 vCPU / 8 GB RAM is plenty for a pilot.
- **Use a server that hosts nothing sensitive.** Piston runs privileged and the project gateway uses the Docker socket;
  both execute untrusted learner code. Do not put databases, other people's sites, cloud credentials or private keys
  on the same machine.
- SSH into the server with a key and disable password login for SSH (`PasswordAuthentication no`).

## 1. DNS

Create an `A` record, for example `runner.melisauyar.com` → the server's IPv4 address. If the DNS provider can proxy
traffic (for example Cloudflare's orange cloud), set it to **DNS only**: Caddy obtains the certificate itself and GitHub
Actions connects to this name over SSH. Wait until `ping runner.melisauyar.com` shows the server's address.

## 2. Deploy key (on your own computer)

```
ssh-keygen -t ed25519 -N "" -C "github-actions realdev deploy" -f realdev-deploy
```

`realdev-deploy.pub` goes to the server in step 4. `realdev-deploy` (private) goes into a GitHub secret in step 5 and
should then be deleted from your computer. On the server this key can only request "deploy commit X"; it cannot open a
shell.

## 3. Production branch

Merge `main` into `production` with a pull request on GitHub (create the branch from `main` the first time). The deploy
job is skipped until step 5 sets `RUNNER_DOMAIN`, so this merge only runs the tests.

## 4. Set up the server (once)

On the server:

```
curl -fsSL https://raw.githubusercontent.com/melisau/RealDev/production/deploy/runner/setup-server.sh -o setup-server.sh
less setup-server.sh   # read it before running it as root
sudo RUNNER_DOMAIN=runner.melisauyar.com ACME_EMAIL=you@example.com \
     DEPLOY_PUBLIC_KEY="$(cat realdev-deploy.pub)" bash setup-server.sh
```

(Copy `realdev-deploy.pub` to the server first, or paste its single line instead of `$(cat …)`.)

The script installs Docker, enables the firewall (22/80/443), creates the `deploy` user restricted to the deploy
command, generates the bearer key, deploys the current `production` commit and installs Python 3.12, Mono 6.12 (C#) and
Java 15 into Piston. The first run can take 10–15 minutes. At the end it prints the SSH host-key lines for step 5.

## 5. GitHub settings

Repository → Settings → Secrets and variables → Actions:

| Kind | Name | Value |
|---|---|---|
| Secret | `RUNNER_SSH_KEY` | the whole private key file `realdev-deploy` |
| Secret | `RUNNER_SSH_KNOWN_HOSTS` | the host-key lines printed by the setup script |
| Variable | `RUNNER_DOMAIN` | `runner.melisauyar.com` |

Recommended: Settings → Branches → add a rule for `production` that requires a pull request and the **Tests and
production build** check. Optionally add required reviewers to the `production` environment.

## 6. Connect the Site

On the server, view the key (only you see it): `sudo cat /etc/realdev/runner.env`.

In the Site's runtime settings:

- `PISTON_URL` = `https://runner.melisauyar.com`
- `PROJECT_RUNNER_URL` = `https://runner.melisauyar.com`
- `PISTON_API_KEY` = the value after `PISTON_API_KEY=` — store it as a **secret**.
- **Remove the old tunnel binding `CUSTOMER_HTTP_PISTON`** (and `CUSTOMER_HTTP_PROJECT_RUNNER` if present): bindings take
  precedence over the URLs.

Publish a new Site version. Then run a Python program in the code lab and submit a project.

## 7. Check it

- GitHub → Actions → **Deploy runner (production)** → Run workflow: the run must end green.
- From your computer: `PISTON_URL=https://runner.melisauyar.com PISTON_API_KEY=<key> node scripts/verify-piston.mjs`
  (all three languages PASS). Do not paste the key into shared terminals or chat.

## Daily use

- Work as before: pull request → `main`. When you want it live, open a pull request `main` → `production` and merge it.
- Roll back: revert the bad merge on `production` (that deploys the revert), or on the server run
  `sudo /opt/realdev/bin/deploy-runner.sh <older production sha>`.
- Logs: `sudo docker compose -p realdev-runner logs -f piston-gateway project-gateway caddy`.
- The deployed commit: `cat /opt/realdev/deployed-sha`.
- `deploy-runner.sh` and `ssh-deploy.sh` are installed as pinned copies. After changing them, merge to `production` and
  re-run `setup-server.sh` (it keeps the existing key).
- Rotate the key: delete `/etc/realdev/runner.env`, re-run the setup script, update `PISTON_API_KEY` on the Site, publish.
