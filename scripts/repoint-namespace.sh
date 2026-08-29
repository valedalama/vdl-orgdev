#!/bin/sh
# Repoint every hard-coded `ludwa6/vdl-orgdev` reference after the repo is
# transferred to a Vale da Lama GitHub organisation.
#
#   ./scripts/repoint-namespace.sh vale-da-lama          # show what would change
#   ./scripts/repoint-namespace.sh vale-da-lama --write  # change it
#
# Run it AFTER `gh api -X POST repos/ludwa6/vdl-orgdev/transfer -f new_owner=<ORG>`,
# never before: until the transfer lands, the old links are the working ones.
#
# It touches this repo and the OrgMap Lab schemas next door. It deliberately does
# NOT touch the vault: dated day-notes are a record of what was true on the day,
# and rewriting them would falsify the record. The living notes are repointed by
# hand -- the migration plan lists exactly which.
set -eu

ORG=${1:-}
MODE=${2:-}
[ -n "$ORG" ] || { echo "usage: $0 <new-org> [--write]" >&2; exit 2; }

REPO=$(cd "$(dirname "$0")/.." && pwd)
LAB="$HOME/dev/orgmap-lab"

# path:relative-to-what
TARGETS="
$REPO/README.md
$REPO/README.pt.md
$REPO/index.html
$LAB/README.md
$LAB/schemas/vdl-current.json
$LAB/schemas/vdl-target.json
"

hits=0
for f in $TARGETS; do
  [ -f "$f" ] || { echo "skip (missing): $f"; continue; }
  n=$(grep -c -E 'ludwa6/vdl-orgdev|ludwa6\.github\.io/vdl-orgdev' "$f" || true)
  [ "$n" -gt 0 ] || continue
  hits=$((hits + n))
  echo "$n  $f"
  grep -n -E 'ludwa6/vdl-orgdev|ludwa6\.github\.io/vdl-orgdev' "$f" | sed 's/^/      /'
  if [ "$MODE" = "--write" ]; then
    # ludwa6.github.io first: the broader pattern would otherwise eat its prefix
    sed -i '' \
      -e "s|ludwa6\.github\.io/vdl-orgdev|$ORG.github.io/vdl-orgdev|g" \
      -e "s|ludwa6/vdl-orgdev|$ORG/vdl-orgdev|g" "$f"
  fi
done

echo
if [ "$MODE" = "--write" ]; then
  echo "rewrote $hits reference(s) to $ORG"
  echo "next:  git -C $REPO remote set-url origin git@github.com:$ORG/vdl-orgdev.git"
  echo "       and repoint 00 - Inbox/discussion-1-nita-vdl-orgdev.md before posting it"
else
  echo "$hits reference(s) would change. Re-run with --write to apply."
fi
