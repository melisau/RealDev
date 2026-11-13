#!/usr/bin/env bash
# Deploys one commit of the production branch to this runner host, checks it, and rolls back on failure.
# Installed to /opt/realdev/bin by setup-server.sh and run as root through sudo by the SSH deploy user.
# Usage: deploy-runner.sh <40-hex commit sha>
set -euo pipefail
umask 022

SHA="${1:-}"
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "usage: deploy-runner.sh <commit sha>" >&2; exit 2; }

BASE=/opt/realdev
SRC="$BASE/src"
RELEASES="$BASE/releases"
BRANCH=production
PROJECT=realdev-runner
PYTHON_IMAGE='python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1'

# Non-secret settings for Compose interpolation: RUNNER_DOMAIN, ACME_EMAIL, DOCKER_GID.
set -a; . /etc/realdev/runner.conf; set +a
[ -r /etc/realdev/runner.env ] || { echo "missing /etc/realdev/runner.env" >&2; exit 2; }

exec 9>/run/lock/realdev-deploy.lock
flock -n 9 || { echo "another deploy is running" >&2; exit 4; }

log(){ printf '[deploy %s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }

log "fetching $BRANCH"
git -C "$SRC" fetch --quiet --prune origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH"
# Only commits that are on the production branch may be deployed.
git -C "$SRC" merge-base --is-ancestor "$SHA" "origin/$BRANCH" || { echo "commit $SHA is not on $BRANCH" >&2; exit 3; }

TARGET="$RELEASES/$SHA"
if [ ! -d "$TARGET" ]; then
  log "unpacking release $SHA"
  mkdir -p "$TARGET.tmp"
  git -C "$SRC" archive "$SHA" | tar -x -C "$TARGET.tmp"
  mv "$TARGET.tmp" "$TARGET"
fi

compose(){ RELEASE="$1" docker compose -p "$PROJECT" -f "$2/deploy/runner/compose.yml" "${@:3}"; }

log "preparing images"
docker pull --quiet "$PYTHON_IMAGE" >/dev/null
docker build --quiet -f "$TARGET/delivery/runner/Dockerfile.dotnet" -t realdev-project-dotnet:20261015 "$TARGET/delivery/runner" >/dev/null
docker build --quiet -f "$TARGET/delivery/runner/Dockerfile.tester" -t realdev-project-tester:20261015 "$TARGET/delivery/runner" >/dev/null
compose "$SHA" "$TARGET" build --quiet

PREVIOUS="$(readlink -f "$BASE/current" 2>/dev/null || true)"
switch_to(){ ln -sfn "$1" "$BASE/current.next" && mv -Tf "$BASE/current.next" "$BASE/current"; }

log "starting $SHA"
switch_to "$TARGET"
compose "$SHA" "$TARGET" up -d --remove-orphans

if ! compose "$SHA" "$TARGET" run --rm --no-deps piston-gateway node deploy/runner/install-runtimes.mjs \
   || ! compose "$SHA" "$TARGET" run --rm --no-deps piston-gateway node deploy/runner/health.mjs; then
  log "health check failed"
  if [ -n "$PREVIOUS" ] && [ -d "$PREVIOUS" ] && [ "$PREVIOUS" != "$TARGET" ]; then
    PREV_SHA="$(basename "$PREVIOUS")"
    log "rolling back to $PREV_SHA"
    switch_to "$PREVIOUS"
    compose "$PREV_SHA" "$PREVIOUS" up -d --remove-orphans || true
  fi
  exit 1
fi

echo "$SHA" > "$BASE/deployed-sha"
log "deployed $SHA"
# Keep the five most recent releases for rollback.
ls -1dt "$RELEASES"/*/ 2>/dev/null | tail -n +6 | while read -r old; do [ "$(readlink -f "$old")" = "$TARGET" ] || rm -rf "$old"; done
docker image prune -f >/dev/null 2>&1 || true
