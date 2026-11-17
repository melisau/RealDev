#!/bin/sh
# Daily RealDev backup: a consistent SQLite copy, kept locally and optionally
# copied off-site with rclone. See docs/vds-deploy.md ("Backup").
#
# Usage: backup.sh [path/to/backup.env]   (default /opt/realdev/backup.env; optional)
#
# Needs only Docker on the host. The copy is made inside the running container
# with VACUUM INTO, so the server keeps serving and no -wal file is missed.
set -eu

ENV_FILE="${1:-/opt/realdev/backup.env}"
if [ -r "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

CONTAINER="${BACKUP_CONTAINER:-realdev}"
IMAGE="${BACKUP_IMAGE:-realdev:local}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/realdev}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
BACKUP_REMOTE="${BACKUP_REMOTE:-}"
BACKUP_REMOTE_KEEP_DAYS="${BACKUP_REMOTE_KEEP_DAYS:-60}"
BACKUP_RCLONE_CONFIG="${BACKUP_RCLONE_CONFIG:-/opt/realdev/rclone.conf}"
RCLONE_IMAGE="${BACKUP_RCLONE_IMAGE:-rclone/rclone:1.68.2}"

STAMP="$(date -u +%Y-%m-%dT%H%MZ)"
NAME="realdev-$STAMP.sqlite"
umask 077
mkdir -p "$BACKUP_DIR/db"

log() { echo "$(date -u +%FT%TZ) backup: $*"; }
cleanup() { docker exec "$CONTAINER" rm -f "/data/$NAME" >/dev/null 2>&1 || true; }
fail() { cleanup; rm -f "$BACKUP_DIR/db/$NAME"; log "FAILED: $*"; exit 1; }
trap cleanup EXIT

log "copying database from container $CONTAINER"
docker exec -e NAME="$NAME" "$CONTAINER" node -e "
const {DatabaseSync}=require('node:sqlite');
const d=new DatabaseSync(process.env.REALDEV_DB_FILE);
d.exec('PRAGMA busy_timeout=5000');
d.exec(\"VACUUM INTO '/data/\"+process.env.NAME+\"'\");
d.close();" || fail "VACUUM INTO"
docker cp "$CONTAINER:/data/$NAME" "$BACKUP_DIR/db/$NAME" >/dev/null || fail "docker cp"
chmod 600 "$BACKUP_DIR/db/$NAME"
cleanup

# The copy must open cleanly before it counts as a backup. The backup folder is
# root-only, so the check runs as root in a throwaway container with no network.
check="$(docker run --rm --network none --user 0 -v "$BACKUP_DIR/db:/b" -e NAME="$NAME" --entrypoint node "$IMAGE" -e "
const {DatabaseSync}=require('node:sqlite');
const d=new DatabaseSync('/b/'+process.env.NAME,{readOnly:true});
const ok=d.prepare('PRAGMA integrity_check').get().integrity_check;
const n=d.prepare('SELECT COUNT(*) c FROM accounts').get().c;
console.log(ok+' accounts='+n);")" || fail "integrity check"
case "$check" in ok\ *) log "integrity $check" ;; *) fail "integrity check: $check" ;; esac

gzip -9 "$BACKUP_DIR/db/$NAME" || fail "gzip"
FILE="$BACKUP_DIR/db/$NAME.gz"

log "pruning local copies older than $BACKUP_KEEP_DAYS days"
find "$BACKUP_DIR/db" -name 'realdev-*.sqlite.gz' -type f -mtime +"$BACKUP_KEEP_DAYS" -delete

if [ -n "$BACKUP_REMOTE" ]; then
  [ -r "$BACKUP_RCLONE_CONFIG" ] || fail "cannot read $BACKUP_RCLONE_CONFIG"
  rclone() {
    docker run --rm -v "$BACKUP_RCLONE_CONFIG:/config/rclone/rclone.conf:ro" \
      -v "$BACKUP_DIR:/data:ro" "$RCLONE_IMAGE" "$@"
  }
  remote() { case "$BACKUP_REMOTE" in *:) echo "$BACKUP_REMOTE$1" ;; *) echo "${BACKUP_REMOTE%/}/$1" ;; esac; }
  log "copying to off-site remote $BACKUP_REMOTE"
  rclone copy "/data/db/$NAME.gz" "$(remote db)" || fail "off-site copy"
  # A crypt remote has no comparable hash, so compare sizes.
  rclone check --one-way --size-only "/data/db" "$(remote db)" --include "$NAME.gz" >/dev/null 2>&1 \
    || fail "off-site copy does not match the local file"
  log "pruning off-site copies older than $BACKUP_REMOTE_KEEP_DAYS days"
  rclone delete --min-age "${BACKUP_REMOTE_KEEP_DAYS}d" "$(remote db)" || fail "off-site prune"
fi

log "done: $(du -h "$FILE" | cut -f1) in $FILE"
