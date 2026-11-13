#!/usr/bin/env bash
# Forced command for the GitHub Actions deploy key (see authorized_keys written by setup-server.sh).
# The key can do exactly one thing: ask for a deploy of one commit SHA. Anything else is refused.
set -euo pipefail
SHA="${SSH_ORIGINAL_COMMAND:-}"
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "refused: expected a commit sha" >&2; exit 2; }
exec sudo -n /opt/realdev/bin/deploy-runner.sh "$SHA"
