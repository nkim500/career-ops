# Correspondence Tracker — Design Spec

**Date:** 2026-04-13
**Status:** Approved
**Author:** nkim500 + Claude

## Problem

career-ops has no way to track general correspondence — interview transcripts, networking calls, cold outreach, inbound recruiter messages, or standalone tasks owed to people. The existing `data/follow-ups.md` + `modes/followup.md` + `followup-cadence.mjs` only handle outbound follow-ups tied to applications. There is no interview archive, no debrief workflow, and no place for non-app-linked obligations.

## Solution — Two Features, Additive

Two features grafted onto existing career-ops without renaming or restructuring anything.

### Feature A: Interview Archive + Debrief

Raw interview artifacts (transcripts, Granola summaries, personal notes) stored per-company, per-round. A new `debrief` mode synthesizes structured debriefs and surfaces action items through a review gate into the task tracker.

### Feature B: Follow-ups as General Task Tracker

`data/follow-ups.md` schema extended so `App#` is optional. Standalone tasks (networking, cold outreach, debrief action items) coexist alongside app-linked follow-ups. The `followup` mode gains `add`/`list`/`done` verbs. Existing cadence logic for app-linked rows is untouched.

## Architecture

### Approach chosen: Grow in place

- Interview round files live under existing `interview-prep/{company-slug}-{role-slug}/rounds/`.
- Debrief output lives under `interview-prep/{company-slug}-{role-slug}/debriefs/`.
- `data/follow-ups.md` schema extended — `App#` becomes optional, new `Type`/`Due`/`Status` columns added.
- New mode: `modes/debrief.md`.
- Extended mode: `modes/followup.md` gains `add`/`list`/`done` verbs.
- Extended script: `followup-cadence.mjs` gains `standalone_tasks` output key.
- Zero new top-level directories. No renames.

### What stays untouched

`modes/contact.md`, `data/applications.md`, all reports, scan/pipeline/offer flow, the Go dashboard. Feature B is strictly additive — an `App#`-populated row behaves exactly as it does today.

## Data Model

### `data/follow-ups.md` — Target Schema

```
| # | App# | Type | Date | Due | Company | Role | Channel | Contact | Status | Notes |
|---|------|------|------|-----|---------|------|---------|---------|--------|-------|
```

**Column definitions:**

| Column | Required | Description |
|--------|----------|-------------|
| `#` | Yes | Sequential row number |
| `App#` | No | Link to `data/applications.md` row. Blank = standalone task |
| `Type` | Yes | `followup` (app-linked, existing behavior), `task` (standalone obligation), `debrief-action` (from debrief review gate) |
| `Date` | Yes | Date the row was created, `YYYY-MM-DD` |
| `Due` | No | Explicit deadline, `YYYY-MM-DD`. Blank = no deadline. `followup` rows may leave blank and use cadence engine instead |
| `Company` | No | Company name. Blank for non-job tasks |
| `Role` | No | Role title. Blank for standalone tasks |
| `Channel` | No | `email` / `LinkedIn` / `phone` / `slack` / `other` |
| `Contact` | No | Person name |
| `Status` | Yes | `open` / `done` / `dropped` |
| `Notes` | No | Free-form. Escape hatch for message snippets when context matters |

**Migration:** Direct edit of existing 18 rows during implementation. No migration script. Existing rows get `Type=followup`, `Due=""`, `Status=open`, `#` assigned sequentially, `App#` populated where the application is identifiable from existing notes.

### Interview Round Files

Path: `interview-prep/{company-slug}-{role-slug}/rounds/{NNN}-{YYYY-MM-DD}-{kind}.md`

`kind` values: `recruiter`, `hm`, `tech`, `panel`, `onsite`, `behavioral`, `debrief-call`, `other`.

```markdown
---
company: Anthropic
role: Staff Research Engineer
round: 3
date: 2026-04-11
kind: tech
interviewers: [Sarah Chen, James Liu]
source: granola  # or: paste, manual
app_ref: 142     # optional, links to applications.md #
---

## Granola Summary
{paste or future API pull}

## Transcript
{full transcript, verbatim}

## My Notes
{optional, added before running debrief}
```

Directories are created on first use per company — no upfront scaffolding.

### Debrief Files

Path: `interview-prep/{company-slug}-{role-slug}/debriefs/{NNN}-debrief.md`

```markdown
---
company: Anthropic
role: Staff Research Engineer
round: 3
date: 2026-04-12
source_round: rounds/003-2026-04-11-tech.md
---

## What Was Discussed
## Open Questions
## Self-Critique
## Action Items
## Next-Round Prep
```

## Mode Definitions

### `modes/debrief.md` (new)

Invoked as `/career-ops debrief {company-slug}` or `/career-ops debrief` (interactive).

**Steps:**

1. **Locate round file.** Glob `interview-prep/{company-slug}-*/rounds/` for the latest file missing a corresponding debrief. If multiple, ask which.
2. **Gather context.** Read: the round file, all prior debriefs for same company-role, the evaluation report from `reports/` (via `app_ref` if present), `cv.md`.
3. **Write debrief.** Produce the 5 fixed sections. Honest self-critique, actionable action items with owner and deadline if known.
4. **Review gate.** Display action items as a numbered list:
   ```
   Proposed action items:
   1. Send writing samples to Sarah by 2026-04-18 (owner: me)
   2. Research their eval infra before round 4 (owner: me)
   3. Wait for HM to confirm panel date (owner: them — track only)

   Which should I file? (reply: "all", "1,3", "none", or edit inline)
   ```
5. **File approved items.** Each approved item becomes a row in `data/follow-ups.md` via the `followup add` verb. `Type=debrief-action`, `App#` from `app_ref`, `Due` from extracted date if present.
6. **Write debrief file** to the debriefs directory.
7. **Summarize.** Rounds completed, open questions count, action items filed, next steps.

**Multi-round debrief:** `/career-ops debrief anthropic --rounds 2,3` produces one debrief covering both rounds.

**No evaluation report:** Debrief runs without report context and notes its absence.

**No `app_ref`:** Action items get filed with blank `App#`.

### `modes/followup.md` (extended)

Existing cadence dashboard content stays as-is. Three new verb sections added:

**`followup add`** — accepts: `company` (optional), `role` (optional), `contact`, `channel`, `notes`, `due` (optional), `app#` (optional), `type` (defaults to `task`). Appends a row to `data/follow-ups.md` with `Status=open`. Asks for whatever's missing before writing.

**`followup list`** — shows open rows in sections:
- **Overdue:** `Due < today` and `Status=open`
- **Due soon:** `today <= Due <= today+3`
- **Open — no due date:** blank `Due` and `Status=open`
- **App-linked cadence** (existing dashboard for rows with `App#` and no explicit `Due` — unchanged behavior)

**`followup done {#}`** — marks row `Status=done`. Accepts multiple: `followup done 12,14,15`. Row stays in file for audit.

**Default (no verb):** existing cadence dashboard behavior, unchanged.

### `followup-cadence.mjs` (extended)

Two changes:

1. **Parse new columns** (`Type`, `Due`, `Status`). Skip `done`/`dropped` rows.
2. **New `standalone_tasks` key** in JSON output, containing rows where `Type != followup`. These rows skip the cadence rule engine entirely — urgency derived purely from `Due` date (overdue / due soon / open).

Existing JSON contract (`metadata`, `entries`, `cadenceConfig`) unchanged. App-linked rows continue to appear in `entries` with cadence logic applied.

## Workflow Walkthroughs

### Flow 1 — Interview round, debrief, tasks filed

1. Finish tech round at Anthropic. Granola has the summary.
2. In chat: "log my round 3 at Anthropic, here's the transcript and Granola summary: ..."
3. Agent writes `interview-prep/anthropic-staff-research-eng/rounds/003-2026-04-11-tech.md`.
4. User says: "debrief it" — agent invokes `modes/debrief.md`.
5. Agent reads round file + prior rounds/debriefs + evaluation report + cv.md.
6. Agent drafts 5 sections, shows action items as review gate.
7. User approves: "all" — agent calls `followup add` for each.
8. Agent writes debrief file. Summarizes.

### Flow 2 — Standalone task from chat

1. User: "remind me to reply to James re: the Scale intro, he messaged me on LinkedIn yesterday"
2. Agent invokes `followup add`: `contact=James, channel=LinkedIn, notes="reply re: Scale intro", type=task`. Asks for missing: "Company? Due date?"
3. User: "no company, due Monday"
4. Agent writes row: `| 49 | | task | 2026-04-13 | 2026-04-14 | | | LinkedIn | James | open | reply re: Scale intro |`

### Flow 3 — List and complete

1. User: "what do I owe people?"
2. Agent invokes `followup list`. Renders Overdue / Due soon / Open / App-linked cadence sections.
3. User: "done 12 and 14"
4. Agent runs `followup done 12,14`. Status flipped to `done`. List filters them out next time.

## Surfacing

On-demand only (`followup list`). No session-start nudge, no dashboard integration. Dashboard is deferred to a future spec.

## Testing & Validation

**In `test-all.mjs`:**

1. **Schema validation** — parse `data/follow-ups.md`, verify all rows have correct columns. `App#` may be blank. `Type` must be `followup|task|debrief-action`. `Status` must be `open|done|dropped`. `Due` must be blank or `YYYY-MM-DD`.
2. **Cadence output** — feed a mixed `follow-ups.md` to `followup-cadence.mjs`, verify `entries` contains only app-linked rows, `standalone_tasks` contains only standalone rows.

**Not automatically tested:**
- `modes/debrief.md` is agent instructions, validated by use.
- Interview round files are user-authored markdown.
- Review gate is conversational UX.

## Files Touched

| File | Change |
|------|--------|
| `data/follow-ups.md` | Reshaped to target schema (direct edit of existing 18 rows) |
| `modes/followup.md` | Add `add`/`list`/`done` verb sections; existing cadence content untouched |
| `modes/debrief.md` | **New file** |
| `followup-cadence.mjs` | Parse new columns, add `standalone_tasks` key to JSON output |
| `test-all.mjs` | Add schema validation + cadence output tests |
| `CLAUDE.md` | Add `debrief` to skill modes table, document new `followup` verbs |
| `DATA_CONTRACT.md` | Add `interview-prep/*/rounds/`, `interview-prep/*/debriefs/` to user layer |
| `FORK_NOTES.md` | Log "correspondence tracker" as local feature with schema delta |

## Future Enhancements (out of scope)

- **Granola API integration** — ingestion script + `source: granola-api` in round frontmatter. Separate spec.
- **Session-start nudge** — surface overdue tasks automatically. Deferred pending user preference.
- **Dashboard page** — `/tasks` route in Go dashboard. Separate spec.
- **contact.md auto-filing** — after sending cold outreach via contact mode, auto-create a follow-up task. Deferred — most cold messages don't warrant a reminder.

## Upstream Sync Impact

Risk surface for `nkim500/career-ops` fork:

- `modes/followup.md` — if upstream rewrites, merge conflict. Flagged in `FORK_NOTES.md`.
- `followup-cadence.mjs` — same.
- `data/follow-ups.md` — user-layer file, upstream should never touch per `DATA_CONTRACT.md`.
- All other changes are new files with no upstream equivalent — no conflict.
