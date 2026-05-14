# Design: Rename `offer` → `evaluate`, unify report numbering, de-duplicate the evaluation rubric

**Date:** 2026-05-14
**Status:** Approved (pending written-spec review)
**Branch:** `feat/evaluate-rename-and-numbering`

---

## Problem

Three separate issues, all in the evaluation path:

1. **`offer` is a confusing mode name.** It is a leftover from the upstream Spanish repo (`oferta` = "offer"). The `offer` mode does not handle *offers* — it produces a full A-G *evaluation* of a job *posting*, before the user has applied. The name misleads.

2. **Report numbers collide and can silently overwrite tracker rows.** Two counters drifted apart: the `reports/` folder's highest numeric prefix (currently ~1202) and the `data/applications.md` `#` column max (currently 1001). They diverged because re-evaluations always write a new report file (counter advances) but update an existing tracker row (counter does not). When a new evaluation picks its number from `applications.md` instead of `reports/`, it reuses a number that already belongs to an existing report. `merge-tracker-local.mjs` dedupes by report number and overwrites the existing row when the new score is higher — silent data loss. This already happened once (the `1000`/`1001` Judgment Labs entries collide with `1000`/`1001` Sierra reports) and was caught a second time during the 2026-05-14 backfill (entries were renumbered 1002-1008 → 1203-1209 before merge).

3. **The A-G evaluation rubric is copy-pasted across three files** — `modes/offer.md`, `batch/batch-prompt.md`, `batch/batch-prompt-eval-only.md` — which drift independently. The numbering bug is partly a symptom: `batch/batch-prompt-eval-only.md:173` and `batch/batch-prompt.md:301/315` instruct the worker to compute the tracker number from `applications.md`, contradicting the correct `{{REPORT_NUM}}` the orchestrator already reserved.

## Goals

- Rename the `offer` mode and its file to `evaluate`, touching identifiers only (not the English word "offer" in prose).
- Establish a single source of truth for the next evaluation number: the `reports/` folder (plus `batch/batch-state.tsv` for in-flight reservations).
- Make `modes/evaluate.md` the one canonical A-G rubric; reduce the batch prompts to thin wrappers that reference it.
- Fix the stale `update-system.mjs` `SYSTEM_PATHS` list left inconsistent by the earlier Spanish→English rename.
- Record the divergence in `FORK_NOTES.md` so future upstream syncs resolve cleanly.

## Non-goals

- Renaming `offers.md` / the `offers` mode. That mode compares real job *offers* received post-interview; "offer" is the correct word there.
- Touching the localized mode dirs (`modes/de|fr|ja|pt|ru/`). FORK_NOTES Invariant 1 leaves secondary-language dirs alone.
- Renumbering the ~37 existing duplicate-prefixed report files. That historical-data cleanup is a separate fast-follow spec (see Part F).
- Rewriting `merge-tracker-local.mjs` dedup logic. It is correct given correct inputs; this spec fixes the inputs.

---

## Part A — Rename `offer` → `evaluate`

- `git mv modes/offer.md modes/evaluate.md`.
- Change the mode **identifier** `offer` → `evaluate` everywhere it is used as an identifier:
  - Routing / mode tables in `AGENTS.md` (and `CLAUDE.md` if it carries any).
  - `.agents/skills/career-ops/SKILL.md` (canonical skill doc) and any mirror under `.claude/skills/`.
  - `.claude-plugin/marketplace.json`, `.claude-plugin/plugin.json`.
  - Cross-references in other `modes/*.md` files (e.g. `auto-pipeline.md` "see format in `modes/offer.md`").
  - `test-all.mjs` mode-filename checks.
- **Not changed:** the English word "offer" / "job offer" in prose. "When the candidate pastes a job offer" stays — that is correct English, not a mode name.
- The implementation plan enumerates every file from a `grep -ril offer` sweep (~55 files) and classifies each hit as *identifier* (change) or *vocabulary* (leave).

## Part B — Numbering: single source of truth = `reports/`

- **New script `scripts/local/next-num.mjs`** (fork-local): computes the next evaluation number as `max(numeric prefixes in reports/) + 1`, also consulting `batch/batch-state.tsv`'s `report_num` column for in-flight reservations. Does **not** read `data/applications.md`. Outputs the zero-padded number. Supports an `--audit` flag (see Part F).
- **`batch/batch-runner.sh`** keeps its `reserve_report_num` lock/state-write wrapper (required for atomic reservation across parallel `claude -p` workers) but replaces the inline bash loop in `next_report_num_unlocked()` with a call to `next-num.mjs`. One computation implementation.
- **Batch worker prompts** (`batch/batch-prompt.md`, `batch/batch-prompt-eval-only.md`): delete the "compute `{next_num}` from `data/applications.md`" instruction (`batch-prompt.md:301,315`; `batch-prompt-eval-only.md:173`). The worker uses the `{{REPORT_NUM}}` it is already handed for **both** the report filename and the TSV `num` column.
- **Interactive path** (`modes/evaluate.md`, `modes/auto-pipeline.md`): replace vague "next sequential number" with an explicit instruction to run `node scripts/local/next-num.mjs`.
- **`AGENTS.md`**: change "Report numbering: sequential 3-digit zero-padded, max existing + 1" to reference `scripts/local/next-num.mjs` and state that the source is the `reports/` folder.

## Part C — Modularization: `modes/evaluate.md` is the canonical rubric

- `modes/evaluate.md` holds the full A-G rubric: archetype detection, blocks A through G, scoring system, and report format. This is the single source.
- `batch/batch-prompt.md` and `batch/batch-prompt-eval-only.md` shrink to thin wrappers containing only what is genuinely batch-specific:
  - Placeholder list (`{{URL}}`, `{{JD_FILE}}`, `{{REPORT_NUM}}`, `{{DATE}}`, `{{ID}}`).
  - "Read `modes/evaluate.md` and produce blocks A-G."
  - Batch-specific steps: report file path, tracker TSV line, JSON summary to stdout, and PDF (included in `batch-prompt.md`, skipped in `batch-prompt-eval-only.md`).
- The duplicated A-G block descriptions are deleted from both batch prompts.
- `modes/evaluate.md` is added to each batch prompt's "files to read" list. This is consistent with workers already reading `cv.md`, `modes/_profile.md`, `config/profile.yml`, and `article-digest.md`.

## Part D — Fork and auto-updater housekeeping

- **`update-system.mjs` `SYSTEM_PATHS`**: remove all four fork-renamed mode files — `modes/oferta.md`, `modes/ofertas.md`, `modes/contacto.md` (stale Spanish paths pointing at files that do not exist in the fork) and `modes/apply.md` (English in the list, but upstream's file is `aplicar.md`, so its auto-fetch is also silently broken). None are re-added under English names. Rationale: per FORK_NOTES Invariant 1, upstream edits to these files are ported manually during sync, not by the auto-updater — so the auto-updater should not list them at all. A code comment in `update-system.mjs` records this.
- **`FORK_NOTES.md`**: add a Local Features Log entry for this change, and extend the Invariant 1 mapping note so the next sync knows upstream `oferta.md` → fork `evaluate.md` (previously `offer.md`).

## Part E — Verification

- `node test-all.mjs` (after updating its mode-filename references) — expect pass.
- `node verify-pipeline.mjs` — pre-existing errors/warnings unrelated to this change are acceptable; no new ones.
- `bash batch/batch-runner.sh --dry-run` — confirm the numbering path resolves through `next-num.mjs`.
- `node scripts/local/next-num.mjs` — returns `1210` given the current `reports/` state (or higher if `batch/batch-state.tsv` holds a larger reserved `report_num`).
- `grep -ril offer` sweep — confirm no lingering `offer` *identifier* references (vocabulary hits are expected and fine).

## Part F — Existing-state reconciliation (scoped: audit here, cleanup fast-follow)

The forward design (Parts A-E) is correct, but `next-num.mjs` only produces clean results if `reports/` has unique numeric prefixes. It does not today: `ls reports/` shows ~941 files but only ~904 distinct numeric prefixes, i.e. ~37 duplicate-prefixed files (the `1000-judgment-labs`/`1000-sierra` pairs and more).

- **This spec** ships `next-num.mjs --audit`: a read-only report listing every duplicate-prefixed report file and, for each, which `data/applications.md` row (if any) references it. This gives exact scope.
- **A separate fast-follow spec** handles the actual historical renumbering — renaming the duplicate files and repointing the affected `applications.md` rows. It is data forensics, independent of the rename, and bundling it would make this change large and risky.

`next-num.mjs`'s `max+1` computation is unaffected by the duplicates (it still returns the correct next number); the duplicates are an integrity problem for *existing* rows, not a blocker for *new* ones.

---

## Risks and divergence notes

- **Permanent fork divergence.** `modes/evaluate.md` will conflict with upstream `oferta.md` on every sync that touches it. Mitigated by the FORK_NOTES Invariant 1 mapping update — the conflict resolution is mechanical and documented.
- **`update-system.mjs` is itself a System-layer file.** A future upstream sync may reintroduce the Spanish `SYSTEM_PATHS` entries. The conflict is expected and the FORK_NOTES entry tells the resolver to keep the fork's trimmed list.
- **Batch prompts gain a file dependency.** If `modes/evaluate.md` is malformed, batch workers fail. Acceptable: it is the same failure mode as a malformed `cv.md`, which workers already depend on.

## Files touched (estimate)

| Area | Files |
|------|-------|
| Rename | `modes/offer.md` → `modes/evaluate.md`; identifier refs in `AGENTS.md`, `.agents/skills/career-ops/SKILL.md`, `.claude-plugin/*.json`, `modes/auto-pipeline.md`, `modes/batch.md`, other `modes/*.md` cross-refs, `test-all.mjs` |
| Numbering | new `scripts/local/next-num.mjs`; `batch/batch-runner.sh`; `batch/batch-prompt.md`; `batch/batch-prompt-eval-only.md`; `modes/evaluate.md`; `modes/auto-pipeline.md`; `AGENTS.md` |
| Modularization | `modes/evaluate.md`; `batch/batch-prompt.md`; `batch/batch-prompt-eval-only.md` |
| Housekeeping | `update-system.mjs`; `FORK_NOTES.md` |
