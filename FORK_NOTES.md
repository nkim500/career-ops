# Fork Notes

This is **nkim500/career-ops**, a fork of [santifer/career-ops](https://github.com/santifer/career-ops). This file is the authoritative record of how this fork diverges from upstream. It exists so that every upstream sync can resolve conflicts consistently without re-deriving context.

**Read this file before every upstream sync.** The sync workflow is documented in `scripts/sync-upstream.sh` and `docs/syncing-from-santifer.md`.

---

## Invariants

These three rules override upstream when they conflict. They are load-bearing for this fork.

### 1. English is the primary language — file names and content

All mode files, prompts, scripts, and user-facing strings in this fork are in English. Upstream uses Spanish (and other languages live in `modes/de/`, `modes/fr/`, `modes/ja/` as secondary dirs). In this fork:

- Spanish mode files have been **renamed** to English equivalents:
  - `modes/oferta.md` → `modes/offer.md`
  - `modes/ofertas.md` → `modes/offers.md`
  - `modes/aplicar.md` → `modes/apply.md`
  - `modes/contacto.md` → `modes/contact.md`
  - (any other Spanish→English rename applied via commits `925dcb4` and `8c4c906`)
- When upstream edits a Spanish-named file, **port the edit to the English equivalent**. Do not resurrect the Spanish filename.
- When upstream adds a new file in Spanish, translate it to English on the way in and keep the English name.
- Secondary language dirs (`modes/de/`, `modes/fr/`, `modes/ja/`) are left alone — upstream changes to those go through untouched.
- User-facing strings in `.sh` / `.mjs` scripts are also translated as part of this invariant (see `batch/batch-runner.sh` worker prompt, `batch/batch-prompt.md`).

### 2. Job board / ATS scanner domain is additive

The scanner in `scan.mjs` and the config in `portals.yml` cover a set of job boards, ATS APIs (Greenhouse, Ashby, Lever), and companies. This fork has added some (e.g., Ashby API support, commit `e32eb5c`) and will continue to add more.

- **Never remove a job board, ATS, or company** that was added locally.
- When upstream adds new boards / companies / ATS integrations, **merge additively** — keep ours, add theirs.
- If upstream and local both add the same integration, prefer whichever has more tests / better error handling. Note the choice in the merge decision log below.

### 3. Local features are preserved — compare-and-choose on duplicates

This fork has added real features that upstream does not have. They are listed in the **Local Features Log** below. Rules:

- Local features stay unless explicitly decided otherwise in a merge decision log entry.
- When upstream ships something that addresses the same need as a local feature, compare on merits: tests, architecture, UX. Adopt the better implementation, and log the choice.
- "Upstream wins" is an acceptable outcome if their version is genuinely better — we want a well-maintained fork, not a grudge match. But the choice must be explicit and logged.

---

## Local Features Log

Features and substantive local changes that live in this fork but not upstream. Ordered newest-first. Each entry references the merge commit on `main` so history stays traceable.

| Date | Merge SHA | Feature | Notes |
|------|-----------|---------|-------|
| 2026-04-13 | `213eeef` (PR #5) | Batch Sonnet workers + post-worker score fallback | `batch/batch-runner.sh` forces `--model sonnet`, adds `--prompt-file` flag, translates worker prompt to English. New `batch/post-worker.mjs` parses the report the worker wrote and synthesizes `batch/tracker-additions/{id}.tsv` when the worker skipped it. New `batch/batch-prompt-eval-only.md` prompt variant. |
| 2026-04-13 | `6ff22b3` (PR #4) | Dashboard viewer text wrap | `dashboard/internal/ui/screens/viewer.go` wraps long lines instead of overflowing horizontally. |
| 2026-04-13 | `c57aaca` (PR #3) | Sync-upstream script | `scripts/sync-upstream.sh` fetches santifer's main by URL without adding a remote, merges on a throwaway branch, keeps `main` untouched until review. Prevents accidental PRs to santifer. Also `docs/syncing-from-santifer.md`. |
| 2026-04-12 | `ee21343` (PR #2) | **SUPERSEDED by upstream 4b5093a** — see merge log 2026-04-13 | Local `'r'` refresh shortcut for pipeline screen. Replaced by upstream's larger, test-covered implementation during the 2026-04-13 sync. |
| 2026-04-12 | `fc3bf2b` | CI fixes for English mode filenames + progress.go | Updated `test-all.mjs` checks to use English mode filenames. Also touched dashboard progress code. |
| 2026-04-12 | `539105b` | Batch prompt translated to English; dashboard status-replace fix; gitignore cleanup | Part of the English-language invariant. |
| 2026-04-12 | `7070671` (PR #1) | Auto-save raw JD text | `feat/auto-save-jd` — pipeline processing now saves both the structured summary AND the verbatim raw JD text to `jds/` files. Commits `fb25bce`, `8c433f9`. |
| 2026-04-12 | `7147d69` | Cover letter template + gitignore updates | `templates/` additions, various PII/local-state paths added to `.gitignore`. |
| 2026-04-12 | `caf9030` | Sync upstream v1.3.0 (bug fixes, followup mode, Block G, Ashby API) | Historical marker — first upstream sync in this fork. |
| 2026-04-12 | `e32eb5c` | Ashby ATS API support in `scan.mjs` | Job-board scanner expansion — see Invariant 2. |
| 2026-04-12 | `4a82318`, `7287506` | Gitignore entries for `cv.md`, `interview-prep/`, `article-digest.md`, `batch/merged-*` | PII/local-user data kept out of git. |
| 2026-04-12 | `8c4c906` | **Spanish mode files renamed to English** | See Invariant 1. `oferta.md`→`offer.md`, `aplicar.md`→`apply.md`, `contacto.md`→`contact.md`, `ofertas.md`→`offers.md`. |
| 2026-04-12 | `925dcb4` | **Core mode files translated Spanish → English** | See Invariant 1. |

Append new entries at the top of this table whenever a local feature lands on `main`.

---

## Upstream Sync Decision Log

One entry per sync with santifer. Record what was accepted, what was skipped, what conflicted, and how it was resolved. Ordered newest-first.

<!-- next sync entry goes here -->

### 2026-04-13 — Security/CI hardening sync (pending)

**Upstream range**: 15 commits, ending at santifer/main `4b5093a feat(dashboard): add manual refresh shortcut (#246)` (release 1.4.0).

*This entry will be populated when the sync branch is merged.*

---

## How to do an upstream sync (quick reference)

1. **Read this file first.** Invariants > upstream.
2. Make sure `main` is clean and up to date (`git switch main && git pull --ff-only origin main`).
3. Run `bash scripts/sync-upstream.sh`. It fetches santifer/main by URL and creates `sync/upstream-YYYY-MM-DD`.
4. Review the merge commit. Resolve conflicts by applying the invariants:
   - **English-language files** win over Spanish.
   - **Additive** job-board / ATS changes — keep ours, add theirs.
   - **Local features** stay unless explicitly superseded; compare-and-choose on duplicates.
5. Run `node test-all.mjs` and `cd dashboard && go build ./...` before showing the diff.
6. Append a new entry to the **Upstream Sync Decision Log** above.
7. Fast-forward `main` to the sync branch and push.
