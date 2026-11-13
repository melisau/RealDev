#!/usr/bin/env bash
# One-time setup of a fresh Ubuntu 22.04/24.04 server as the RealDev runner host. Run as root:
#   sudo RUNNER_DOMAIN=runner.example.com ACME_EMAIL=you@example.com \
#        DEPLOY_PUBLIC_KEY="ssh-ed25519 AAAA... github-actions" bash setup-server.sh
# Safe to re-run: it keeps an existing secret and only refreshes scripts and settings.
set -euo pipefail
umask 022

: "${RUNNER_DOMAIN:?set RUNNER_DOMAIN (DNS A record must already point to this server)}"
: "${ACME_EMAIL:?set ACME_EMAIL for the TLS certificate account}"
: "${DEPLOY_PUBLIC_KEY:?set DEPLOY_PUBLIC_KEY to the public half of the GitHub Actions deploy key}"
[[ "$RUNNER_DOMAIN" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$ ]] || { echo "invalid RUNNER_DOMAIN" >&2; exit 2; }
[[ "$DEPLOY_PUBLIC_KEY" =~ ^ssh-(ed25519|rsa)\ [A-Za-z0-9+/=]+(\ .*)?$ ]] || { echo "DEPLOY_PUBLIC_KEY must be one OpenSSH public key line" >&2; exit 2; }
[ "$(id -u)" = 0 ] || { echo "run as root" >&2; exit 2; }
REPO=https://github.com/melisau/RealDev.git
BASE=/opt/realdev

echo "== packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl git gnupg ufw unattended-upgrades openssl >/dev/null
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
fi
systemctl enable --now docker >/dev/null
dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || true

echo "== firewall (SSH, HTTP, HTTPS only)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

echo "== directories"
install -d -m 0755 "$BASE" "$BASE/bin" "$BASE/releases" /var/lib/realdev /var/lib/realdev/piston
install -d -m 0750 -o 10001 -g 10001 /var/lib/realdev/jobs
install -d -m 0750 /etc/realdev

echo "== settings and secret"
DOCKER_GID="$(getent group docker | cut -d: -f3)"
printf 'RUNNER_DOMAIN=%s\nACME_EMAIL=%s\nDOCKER_GID=%s\n' "$RUNNER_DOMAIN" "$ACME_EMAIL" "$DOCKER_GID" > /etc/realdev/runner.conf
chmod 0644 /etc/realdev/runner.conf
if [ ! -s /etc/realdev/runner.env ]; then
  # Written straight to a root-only file; never echoed. Copy it into the Site's secrets yourself (see the docs).
  ( umask 077; printf 'PISTON_API_KEY=%s\n' "$(openssl rand -hex 32)" > /etc/realdev/runner.env )
  echo "   generated a new PISTON_API_KEY in /etc/realdev/runner.env"
else
  echo "   keeping the existing /etc/realdev/runner.env"
fi
chmod 0600 /etc/realdev/runner.env

echo "== source checkout"
if [ ! -d "$BASE/src/.git" ]; then git clone --quiet --no-checkout "$REPO" "$BASE/src"; fi
git -C "$BASE/src" fetch --quiet --prune origin "+refs/heads/production:refs/remotes/origin/production"
PROD_SHA="$(git -C "$BASE/src" rev-parse origin/production)"

echo "== deploy scripts (pinned copy from production $PROD_SHA)"
for f in deploy-runner.sh ssh-deploy.sh; do
  git -C "$BASE/src" show "$PROD_SHA:deploy/runner/$f" > "$BASE/bin/$f.tmp"
  install -m 0755 -o root -g root "$BASE/bin/$f.tmp" "$BASE/bin/$f"; rm -f "$BASE/bin/$f.tmp"
done

echo "== deploy user"
id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deploy
install -d -m 0700 -o deploy -g deploy /home/deploy/.ssh
printf 'command="/opt/realdev/bin/ssh-deploy.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty %s\n' "$DEPLOY_PUBLIC_KEY" > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys; chmod 0600 /home/deploy/.ssh/authorized_keys
printf 'deploy ALL=(root) NOPASSWD: /opt/realdev/bin/deploy-runner.sh\n' > /etc/sudoers.d/realdev-deploy.tmp
chmod 0440 /etc/sudoers.d/realdev-deploy.tmp
visudo -cf /etc/sudoers.d/realdev-deploy.tmp >/dev/null && mv /etc/sudoers.d/realdev-deploy.tmp /etc/sudoers.d/realdev-deploy

echo "== first deploy of $PROD_SHA (installing Python, C# and Java can take several minutes)"
"$BASE/bin/deploy-runner.sh" "$PROD_SHA"

echo
echo "Done. Next:"
echo " 1. Add this host key line to the GitHub secret RUNNER_SSH_KNOWN_HOSTS:"
for type in ed25519 ecdsa; do [ -f /etc/ssh/ssh_host_${type}_key.pub ] && echo "    $RUNNER_DOMAIN $(cut -d' ' -f1,2 /etc/ssh/ssh_host_${type}_key.pub)"; done
echo " 2. Put the runner key into the Site's secrets (shown only to you):  sudo cat /etc/realdev/runner.env"
echo " 3. Follow docs/runner-vds.md for the Site settings and the GitHub secrets."
