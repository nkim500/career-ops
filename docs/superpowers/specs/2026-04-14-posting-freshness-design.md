# Posting Freshness: Date Extraction, Pipeline Sort, and Dashboard Column

**Date:** 2026-04-14
**Branch:** feat/posting-freshness
**Status:** Approved

## Problem

`scan.mjs` records only `first_seen` (the scan date), not when the job was actually posted. The ATS APIs (Greenhouse, Ashby, Lever) all return posting dates but the parsers ignore them. This means:
- No way to prioritize fresher postings for faster application
- No freshness signal in the dashboard
- Block G (Legitimacy) has to re-derive posting age heuristically each evaluation

## Design

### 1. Data Layer

**scan-history.tsv** gains a new 7th column `date_posted` (inserted between `company` and `status`):

```
url	first_seen	portal	title	company	date_posted	status
https://...	2026-04-14	greenhouse-api	AI Engineer	Anthropic	2026-04-10	added
https://...	2026-04-14	ashby-api	FDE	Cohere		added
```

- Populated from API response when available, empty string when not.
- Existing scan-history files: a one-time migration adds the empty column so the TSV stays parseable.

**pipeline.md** entries get an optional age annotation:

```
- [ ] https://... | Anthropic | AI Engineer | 📅 4d
- [ ] https://... | Cohere | FDE
```

Age is computed from `date_posted` relative to scan date. No annotation if `date_posted` is unknown.

**CareerApplication model** (`dashboard/internal/model/career.go`) gains a new field `DatePosted string` (ISO `YYYY-MM-DD` or empty).

### 2. API Date Extraction in scan.mjs

Each parser extracts a `datePosted` field:

- **Greenhouse:** `j.updated_at` (ISO 8601 → slice to `YYYY-MM-DD`)
- **Ashby:** `j.publishedDate` or `j.createdAt` (verify actual field name from API response)
- **Lever:** `j.createdAt` (Unix ms → convert to `YYYY-MM-DD`)

Parsed job objects change from `{title, url, company, location}` to `{title, url, company, location, datePosted}`.

`appendToScanHistory` writes the new column. `appendToPipeline` computes age from `datePosted` vs today and appends the `📅 Xd` annotation if known.

**Age formatting rules:**
- 0-1 days: `📅 today`
- 2-6 days: `📅 Xd` (e.g. `📅 3d`)
- 7-59 days: `📅 Xw` (e.g. `📅 2w`, `📅 8w`)
- 60+ days: `📅 60d+`

**Pipeline sort:** When writing new offers to pipeline.md, freshest first. Already-pending items stay in place; new batch is sorted among themselves.

### 3. LLM Fallback During Evaluation

When pipeline or auto-pipeline mode evaluates a job:

1. **Check scan-history.tsv first** — look up the URL to see if `date_posted` is already populated.
2. **If missing** — during the Playwright snapshot (already happening for JD extraction), the LLM looks for posting date signals on the page:
   - Explicit: "Posted on April 10, 2026", "Listed 3 days ago"
   - Implicit: metadata, breadcrumbs, page footer dates
3. **If found** — write it back to `scan-history.tsv` so the dashboard picks it up, and include `**Posted:** YYYY-MM-DD` in the report header (alongside existing `**URL:**`).
4. **If not found** — leave empty, no guessing. `first_seen` is available as a ceiling ("at most this old").

No extra page loads — just the LLM extracting a date from content it's already reading.

### 4. Dashboard — Column + Sort Mode

**New `Age` column** in the pipeline list view:

```
Score │ Company        │ Role                │ Status    │ Age  │ Comp
4.3   │ Anthropic      │ AI Engineer         │ Evaluated │  4d  │ $180-220k
3.8   │ Cohere         │ FDE                 │ Applied   │  2w  │ —
4.1   │ Labelbox       │ FDE                 │ Evaluated │  —   │ $150-190k
```

- Computed from `DatePosted` relative to today.
- Falls back to `first_seen` with `~` prefix (e.g. `~3d`) to indicate approximate.
- Unknown = `—`.
- Color coding via lipgloss: green ≤7d, yellow 8-30d, red 31d+.

**New sort mode** `sortAge` added to the `s` key cycle (score → date → company → status → **age**):
- Sorts by `DatePosted` ascending (freshest first).
- Entries with no date sort to the bottom.
- In grouped view, age sort applies within each status group.

**Enrichment:** Dashboard's `data/career.go` 5-tier URL enrichment strategy gains a 6th step: match by URL against `scan-history.tsv` to pull `date_posted` into `CareerApplication.DatePosted`.

## Files Changed

| File | Change |
|------|--------|
| `scan.mjs` | Extract `datePosted` from Greenhouse/Ashby/Lever parsers; update `appendToScanHistory` and `appendToPipeline` |
| `data/scan-history.tsv` | New `date_posted` column (migration for existing rows) |
| `modes/scan.md` | Document `date_posted` extraction and age annotation |
| `modes/pipeline.md` | Document LLM fallback date extraction, `**Posted:**` header field |
| `modes/offer.md` | Add `**Posted:**` to report header format |
| `modes/_shared.md` | Note that Block G can use structured `date_posted` when available |
| `dashboard/internal/model/career.go` | Add `DatePosted` field to `CareerApplication` |
| `dashboard/internal/data/career.go` | Add scan-history.tsv enrichment step for `DatePosted`; age computation helper |
| `dashboard/internal/ui/screens/pipeline.go` | New `Age` column, `sortAge` mode, color coding |

## Out of Scope

- Changing the 1-5 global score based on freshness (freshness is a priority signal, not a quality signal)
- Workday/BambooHR/Teamtailor date extraction (can be added later per provider)
- Backfilling dates for already-scanned history (would require re-fetching APIs)
