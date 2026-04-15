#!/usr/bin/env bash
#
# Sync main with santifer/career-ops without registering a git remote.
#
# Fetches santifer's main directly by URL into FETCH_HEAD, creates a local
# sync branch, and merges there so your own main stays untouched until you
# review. No persistent remote is ever added, so there is nothing for
# `gh pr create` (or any other tool) to latch onto and accidentally route
# PRs to santifer.
#
# Usage:
#   bash scripts/sync-upstream.sh
#
# Exit codes:
#   0  - merge clean, sync branch ready to review
#   1  - preconditions failed (dirty tree, wrong branch, etc.)
#   2  - merge had conflicts, left in place for manual resolution

set -euo pipefail

UPSTREAM_URL="https://github.com/santifer/career-ops.git"
UPSTREAM_BRANCH="main"
SYNC_BRANCH="sync/upstream-$(date +%Y-%m-%d)"

# -- preconditions ----------------------------------------------------------

cat <<'BANNER'
==> Upstream sync starting.
==> READ FORK_NOTES.md before resolving any conflicts.
==> Invariants: (1) English is primary language (file names too),
==>             (2) job-board/ATS domain is additive,
==>             (3) local features preserved unless explicitly superseded.
BANNER

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: not inside a git working tree." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: working tree has uncommitted changes. Commit or stash first." >&2
  exit 1
fi

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "ERROR: must be on 'main' to start a sync (currently on '$CURRENT_BRANCH')." >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/$SYNC_BRANCH"; then
  echo "ERROR: branch '$SYNC_BRANCH' already exists. Delete it or rerun tomorrow." >&2
  exit 1
fi

# -- bring local main in line with origin first -----------------------------

echo "==> Updating local main from origin"
git pull --ff-only origin main

# -- fetch santifer's main by URL (no remote added) ------------------------

echo "==> Fetching $UPSTREAM_URL $UPSTREAM_BRANCH"
git fetch "$UPSTREAM_URL" "$UPSTREAM_BRANCH"

if git merge-base --is-ancestor FETCH_HEAD HEAD; then
  echo "==> Already up to date with santifer/$UPSTREAM_BRANCH. Nothing to do."
  exit 0
fi

# -- do the merge on a throwaway branch, not on main ------------------------

echo "==> Creating sync branch: $SYNC_BRANCH"
git switch -c "$SYNC_BRANCH"

echo "==> Merging FETCH_HEAD into $SYNC_BRANCH"
if git merge --no-ff --no-edit FETCH_HEAD; then
  cat <<EOF

==> Merge clean on '$SYNC_BRANCH'.

Next steps (review, then create a PR):
  # inspect what changed
  git log --oneline main..$SYNC_BRANCH
  git diff main..$SYNC_BRANCH

  # when happy, push the sync branch and create a PR
  git push origin $SYNC_BRANCH
  gh pr create --repo nkim500/career-ops --base main --head $SYNC_BRANCH --title "sync: upstream santifer/career-ops $(date +%Y-%m-%d)"

  # after PR is merged on GitHub, clean up locally
  git switch main
  git pull --ff-only origin main
  git branch -d $SYNC_BRANCH
EOF
  exit 0
else
  cat <<EOF

==> Merge has conflicts on '$SYNC_BRANCH'.

Resolve them in place, then:
  git add <resolved files>
  git commit

  # push the sync branch and create a PR
  git push origin $SYNC_BRANCH
  gh pr create --repo nkim500/career-ops --base main --head $SYNC_BRANCH --title "sync: upstream santifer/career-ops $(date +%Y-%m-%d)"

  # after PR is merged on GitHub, clean up locally
  git switch main
  git pull --ff-only origin main
  git branch -d $SYNC_BRANCH

To abort and try again later:
  git merge --abort
  git switch main
  git branch -D $SYNC_BRANCH
EOF
  exit 2
fi
