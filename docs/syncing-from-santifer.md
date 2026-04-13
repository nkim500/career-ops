# Syncing from santifer/career-ops

This fork tracks upstream improvements from
[santifer/career-ops](https://github.com/santifer/career-ops) but **does not**
keep `santifer` as a configured git remote. That's deliberate.

## Why not add a remote?

A git remote named `upstream` (or even another name) is picked up by tools
like `gh pr create` and can cause PRs meant for this fork to be routed to
the santifer repo instead. That has happened before. This fork exists as a
personal workspace — no contributions flow upstream, and opening PRs against
santifer is never the right move.

To eliminate the footgun entirely, the upstream URL is not stored anywhere
in `git config`. Updates are pulled on demand by a script.

## How to pull in santifer's latest main

From the repo root, on a clean `main`:

```bash
bash scripts/sync-upstream.sh
```

The script:

1. Pulls your own `origin/main` so you're up to date with your fork.
2. Fetches santifer's `main` directly by URL into `FETCH_HEAD` (no remote
   is added).
3. Creates a dated `sync/upstream-YYYY-MM-DD` branch from your current main.
4. Merges `FETCH_HEAD` into that branch. If there are conflicts, it stops
   and tells you exactly how to resolve and continue.
5. Prints the commands to fast-forward `main` to the sync branch and push.

`main` itself is never touched until you explicitly fast-forward it after
reviewing the sync branch.

## When merges conflict

Common conflict sources:
- `modes/*.md` — this fork ships English translations of mode files;
  upstream edits them in Spanish.
- `.gitignore` — both sides occasionally tweak ignore patterns.
- `dashboard/` — feature work on both sides may touch the same files.

Resolve keeping this fork's voice (English, your customizations in
`modes/_profile.md`, etc.) and incorporating upstream's substantive new
content. When in doubt, ask Claude — the workflow we ran on 2026-04-12 is a
good reference.

## Before you run the script

- Commit or stash any working-tree changes.
- Be on `main`.
- Don't have a leftover `sync/upstream-$(date)` branch from an earlier run
  today — delete it first.

The script enforces all three and will exit early with a clear error if
any precondition fails.
