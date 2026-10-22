#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# handbook-parity.sh — checks a term across both language sets.
#
# The Handbook is one document in two languages. A change applied to
# handbook/pt/ and not to handbook/en/ is a change that has not landed,
# and the failure is silent: both files parse, both render, and the
# commit message says the work is done.
#
# On 2026-08-15 the restaurant-name correction went into the Portuguese
# set only. Nobody noticed for five days, and what surfaced it was a
# person re-reading the document for an unrelated reason.
#
# Run before any commit that claims a set-wide edit:
#
#   scripts/handbook-parity.sh ama
#   scripts/handbook-parity.sh 'Horta ao Prato' 'Garden to Plate'
#
# With one argument, the same term is counted in both sets. With two,
# the first is the Portuguese term and the second its English
# counterpart — the usual case, since the sets are a translation pair.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PT_DIR="$HERE/handbook/pt"
EN_DIR="$HERE/handbook/en"

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo "usage: $(basename "$0") <term> [english-term]" >&2
  exit 64
fi

PT_TERM="$1"
EN_TERM="${2:-$1}"

count_in() {  # dir, term  -> matching lines
  grep -rn --include='*.md' -F -- "$2" "$1" 2>/dev/null || true
}

PT_HITS="$(count_in "$PT_DIR" "$PT_TERM")"
EN_HITS="$(count_in "$EN_DIR" "$EN_TERM")"

# index.md in both sets is the generated contents page. Its lines are document
# titles copied out of the documents, so a hit there is an echo of a heading
# already counted below it — and a term that appears ONLY in a title would be
# reported as present in both sets on the strength of two generated files.
PT_HITS="$(printf '%s\n' "$PT_HITS" | grep -v '/index\.md:' || true)"
EN_HITS="$(printf '%s\n' "$EN_HITS" | grep -v '/index\.md:' || true)"

# 00_* in en/ are working notes about the translation, not the Handbook
# itself; counting them would report parity that the documents do not have.
EN_HITS="$(printf '%s\n' "$EN_HITS" | grep -v '/00_' || true)"

pt_n=$(printf '%s' "$PT_HITS" | grep -c . || true)
en_n=$(printf '%s' "$EN_HITS" | grep -c . || true)

printf '\n  pt/  "%s"  → %s line(s)\n' "$PT_TERM" "$pt_n"
printf '%s\n' "$PT_HITS" | sed 's|^|      |' | grep -v '^ *$' || true
printf '\n  en/  "%s"  → %s line(s)\n' "$EN_TERM" "$en_n"
printf '%s\n' "$EN_HITS" | sed 's|^|      |' | grep -v '^ *$' || true

echo
if [ "$pt_n" -eq 0 ] && [ "$en_n" -eq 0 ]; then
  echo "  ABSENT — the term appears in neither set."
  exit 1
elif [ "$pt_n" -eq 0 ] || [ "$en_n" -eq 0 ]; then
  echo "  ⚠️  ONE-SIDED — present in one language set and missing from the other."
  echo "     This is the 2026-08-15 failure. Fix before committing."
  exit 1
else
  echo "  Present in both sets. Counts need not match — the documents differ in"
  echo "  structure — but read the lines above and confirm the change landed twice."
fi
