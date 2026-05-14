# Evaluate Rename + Unified Report Numbering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the misleadingly-named `offer` mode to `evaluate`, make the `reports/` folder the single source of truth for report numbering, and collapse the triplicated A-G rubric into one canonical file referenced by thin batch-prompt wrappers.

**Architecture:** A new fork-local `scripts/local/next-num.mjs` computes the next evaluation number from `reports/` + `batch/batch-state.tsv` (never `data/applications.md`). `batch/batch-runner.sh` and the interactive mode docs all call it. `git mv modes/offer.md modes/evaluate.md` plus surgical identifier edits across ~10 files. The batch prompts stop duplicating the archetype/scoring tables (canonical in `modes/_shared.md`) and the A-G walkthrough (canonical in `modes/evaluate.md`).

**Tech Stack:** Node.js (ESM `.mjs`), Bash, Markdown. Test pattern follows existing `scripts/local/test-scan-filters.mjs` (plain `assert` helper, `✅`/`❌` output, exit code).

**Branch:** `feat/evaluate-rename-and-numbering` (already created and checked out; spec committed at `808417c`).

**Spec:** `docs/superpowers/specs/2026-05-14-evaluate-rename-and-numbering-design.md`

---

## File Structure

| File | Responsibility | Created / Modified |
|------|----------------|--------------------|
| `scripts/local/next-num.mjs` | Compute next evaluation number; `--audit` lists duplicate-prefixed reports | Create |
| `scripts/local/test-next-num.mjs` | Unit tests for next-num.mjs | Create |
| `batch/batch-runner.sh` | Orchestrator — call next-num.mjs instead of inline bash loop | Modify (`next_report_num_unlocked`, ~lines 230-257) |
| `batch/batch-prompt.md` | Batch worker (with PDF) — thin wrapper referencing canonical rubric | Modify (gut duplicated rubric, fix numbering) |
| `batch/batch-prompt-eval-only.md` | Batch worker (no PDF) — thin wrapper | Modify (gut duplicated rubric, fix numbering) |
| `modes/offer.md` → `modes/evaluate.md` | Canonical A-G evaluation walkthrough | Rename + edit |
| `modes/auto-pipeline.md` | Cross-refs to the evaluate mode + numbering instruction | Modify |
| `modes/batch.md` | Conductor doc — numbering instruction | Modify |
| `AGENTS.md` | Routing table + numbering rule + file-path refs | Modify |
| `.agents/skills/career-ops/SKILL.md` | Mode list / argument-hint (symlinked from `.claude/skills/...`) | Modify |
| `test-all.mjs` | Mode-filename checks | Modify (2 lines) |
| `update-system.mjs` | SYSTEM_PATHS — drop 4 fork-renamed mode files | Modify |
| `FORK_NOTES.md` | Local Features Log + Invariant 1 mapping | Modify |

---

## Task 1: Create `next-num.mjs` with tests

**Files:**
- Create: `scripts/local/next-num.mjs`
- Create: `scripts/local/test-next-num.mjs`

- [ ] **Step 1: Write the failing test**

Create `scripts/local/test-next-num.mjs`:

```javascript
#!/usr/bin/env node

import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { maxReportNum, maxStateNum, computeNextNum, findDuplicates } from './next-num.mjs';

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.log(`  ❌ ${label} — got ${a}, expected ${e}`);
  }
}

function makeReportsDir(files) {
  const dir = mkdtempSync(join(tmpdir(), 'next-num-reports-'));
  for (const f of files) writeFileSync(join(dir, f), 'x');
  return dir;
}

function makeStateFile(rows) {
  const dir = mkdtempSync(join(tmpdir(), 'next-num-state-'));
  const file = join(dir, 'batch-state.tsv');
  const header = 'id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries';
  writeFileSync(file, [header, ...rows].join('\n') + '\n');
  return file;
}

console.log('maxReportNum');
{
  const dir = makeReportsDir(['001-acme-2026-01-01.md', '1202-foo-2026-05-08.md', '1209-bar-2026-05-13.md']);
  assert('picks highest numeric prefix', maxReportNum(dir), 1209);
  rmSync(dir, { recursive: true, force: true });

  const empty = mkdtempSync(join(tmpdir(), 'next-num-empty-'));
  assert('empty dir → 0', maxReportNum(empty), 0);
  rmSync(empty, { recursive: true, force: true });

  assert('missing dir → 0', maxReportNum('/nonexistent/path/xyz'), 0);

  const dups = makeReportsDir(['1000-a-2026-05-08.md', '1000-b-2026-05-12.md', '1001-c.md']);
  assert('duplicate prefixes do not break max', maxReportNum(dups), 1001);
  rmSync(dups, { recursive: true, force: true });
}

console.log('maxStateNum');
{
  const file = makeStateFile([
    '1\thttp://x\tcompleted\t-\t-\t706\t3.5\t-\t0',
    '2\thttp://y\tprocessing\t-\t-\t1210\t-\t-\t0',
    '3\thttp://z\tpending\t-\t-\t-\t-\t-\t0',
  ]);
  assert('picks highest report_num, ignores "-"', maxStateNum(file), 1210);
  rmSync(file.replace('/batch-state.tsv', ''), { recursive: true, force: true });

  assert('missing state file → 0', maxStateNum('/nonexistent/state.tsv'), 0);
}

console.log('computeNextNum');
{
  const dir = makeReportsDir(['1209-bar-2026-05-13.md']);
  const file = makeStateFile(['1\thttp://x\tcompleted\t-\t-\t1205\t3.5\t-\t0']);
  assert('reports max wins → +1', computeNextNum({ reportsDir: dir, stateFile: file }), 1210);
  rmSync(dir, { recursive: true, force: true });
  rmSync(file.replace('/batch-state.tsv', ''), { recursive: true, force: true });

  const dir2 = makeReportsDir(['1209-bar.md']);
  const file2 = makeStateFile(['1\thttp://x\tprocessing\t-\t-\t1215\t-\t-\t0']);
  assert('state max wins → +1', computeNextNum({ reportsDir: dir2, stateFile: file2 }), 1216);
  rmSync(dir2, { recursive: true, force: true });
  rmSync(file2.replace('/batch-state.tsv', ''), { recursive: true, force: true });
}

console.log('findDuplicates');
{
  const dir = makeReportsDir([
    '1000-a-2026-05-08.md', '1000-b-2026-05-12.md',
    '1001-c.md', '1001-d.md',
    '1002-unique.md',
  ]);
  const dups = findDuplicates(dir);
  assert('finds the two duplicated numbers', [...dups.keys()].sort((x, y) => x - y), [1000, 1001]);
  assert('1002 not flagged (unique)', dups.has(1002), false);
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/local/test-next-num.mjs`
Expected: FAIL — `Cannot find module './next-num.mjs'` (or import error).

- [ ] **Step 3: Write the implementation**

Create `scripts/local/next-num.mjs`:

```javascript
#!/usr/bin/env node
/**
 * next-num.mjs — Single source of truth for the next career-ops evaluation number.
 *
 * The number is derived from the reports/ folder (the counter that actually
 * increments on every evaluation) plus batch/batch-state.tsv (in-flight
 * reservations). It is NEVER derived from data/applications.md — that counter
 * lags because re-evaluations bump reports/ but reuse the existing tracker row.
 *
 * Usage:
 *   node scripts/local/next-num.mjs            → prints the next number (zero-padded)
 *   node scripts/local/next-num.mjs --audit    → lists duplicate-prefixed report files
 */

import { readdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const CAREER_OPS = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function maxReportNum(reportsDir) {
  if (!existsSync(reportsDir)) return 0;
  let max = 0;
  for (const f of readdirSync(reportsDir)) {
    const m = f.match(/^(\d+)-/);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (n > max) max = n;
  }
  return max;
}

export function maxStateNum(stateFile) {
  if (!existsSync(stateFile)) return 0;
  let max = 0;
  for (const line of readFileSync(stateFile, 'utf-8').split('\n')) {
    const cols = line.split('\t');
    if (cols.length < 6 || cols[0] === 'id') continue;
    const rnum = cols[5].trim();
    if (rnum === '' || rnum === '-') continue;
    const n = parseInt(rnum, 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return max;
}

export function computeNextNum({ reportsDir, stateFile }) {
  return Math.max(maxReportNum(reportsDir), maxStateNum(stateFile)) + 1;
}

export function findDuplicates(reportsDir) {
  const byNum = new Map();
  if (!existsSync(reportsDir)) return new Map();
  for (const f of readdirSync(reportsDir)) {
    const m = f.match(/^(\d+)-/);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (!byNum.has(n)) byNum.set(n, []);
    byNum.get(n).push(f);
  }
  return new Map([...byNum].filter(([, files]) => files.length > 1));
}

function pad(n) {
  return String(n).padStart(3, '0');
}

const isCLI = process.argv[1] && process.argv[1].endsWith('next-num.mjs');
if (isCLI) {
  const reportsDir = join(CAREER_OPS, 'reports');
  const stateFile = join(CAREER_OPS, 'batch', 'batch-state.tsv');

  if (process.argv.includes('--audit')) {
    const dups = findDuplicates(reportsDir);
    if (dups.size === 0) {
      console.log('No duplicate-prefixed report files. reports/ is clean.');
    } else {
      const appsFile = join(CAREER_OPS, 'data', 'applications.md');
      const appsText = existsSync(appsFile) ? readFileSync(appsFile, 'utf-8') : '';
      console.log(`${dups.size} duplicate report number(s):\n`);
      for (const [num, files] of [...dups].sort((a, b) => a[0] - b[0])) {
        console.log(`  #${num}`);
        for (const f of files) console.log(`    file: reports/${f}`);
        const referenced = appsText.includes(`[${num}](`);
        console.log(`    applications.md references [${num}]: ${referenced ? 'YES' : 'no'}`);
      }
    }
  } else {
    console.log(pad(computeNextNum({ reportsDir, stateFile })));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/local/test-next-num.mjs`
Expected: PASS — `10 passed, 0 failed`, exit 0.

- [ ] **Step 5: Smoke-test the CLI against the real repo**

Run: `node scripts/local/next-num.mjs`
Expected: prints `1210` (reports/ currently maxes at 1209; higher if batch-state.tsv holds a larger reserved number).

Run: `node scripts/local/next-num.mjs --audit`
Expected: lists the duplicate-prefixed report files (the `1000`/`1001` Judgment-Labs-vs-Sierra pairs and others) with whether `applications.md` references each number.

- [ ] **Step 6: Register the test in `test-all.mjs`**

`test-all.mjs` runs the local test suite. Find where the other `scripts/local/test-*.mjs` files are invoked (search `test-all.mjs` for `test-scan`). Add a line invoking `scripts/local/test-next-num.mjs` the same way the existing local tests are invoked. If `test-all.mjs` does NOT invoke the `scripts/local/test-*.mjs` files at all, skip this step (they are run manually) — note that in the commit message.

Run: `node test-all.mjs`
Expected: PASS (or the same pre-existing failures as before this task — no NEW failures).

- [ ] **Step 7: Commit**

```bash
git add scripts/local/next-num.mjs scripts/local/test-next-num.mjs
# include test-all.mjs only if Step 6 modified it:
git add test-all.mjs 2>/dev/null || true
git commit -m "$(cat <<'EOF'
feat(numbering): add next-num.mjs as single source of truth for report numbers

Computes the next evaluation number from reports/ + batch-state.tsv,
never from data/applications.md (that counter lags re-evaluations).
--audit flag lists duplicate-prefixed report files for the fast-follow
cleanup. Covered by scripts/local/test-next-num.mjs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Wire `next-num.mjs` into `batch-runner.sh`

**Files:**
- Modify: `batch/batch-runner.sh` (`next_report_num_unlocked`, lines ~230-257)

- [ ] **Step 1: Read the current function**

Run: `sed -n '230,258p' batch/batch-runner.sh`
Confirm it matches: a `next_report_num_unlocked()` that loops over `$REPORTS_DIR`/*.md and `$STATE_FILE`, then `printf '%03d' $((max_num + 1))`.

- [ ] **Step 2: Replace the function body with a call to next-num.mjs**

Replace the entire `next_report_num_unlocked()` function (from `next_report_num_unlocked() {` through its closing `}`) with:

```bash
# Calculate next report number.
# Delegates to scripts/local/next-num.mjs — the single source of truth
# (reports/ + batch-state.tsv). Caller must hold STATE_LOCK_DIR while this runs.
next_report_num_unlocked() {
  node "$PROJECT_DIR/scripts/local/next-num.mjs"
}
```

Note: `next-num.mjs` already reads both `reports/` and `batch/batch-state.tsv`, and already zero-pads — same contract as the old bash loop. `$PROJECT_DIR` is defined near the top of `batch-runner.sh` (it sets `APPLICATIONS_FILE="$PROJECT_DIR/data/applications.md"`).

- [ ] **Step 3: Verify the dry-run path still works**

Run: `bash batch/batch-runner.sh --dry-run`
Expected: lists pending offers (or "no pending") without error. The dry-run must not crash on the changed function.

- [ ] **Step 4: Verify the number resolves correctly**

Run: `bash -c 'source batch/batch-runner.sh 2>/dev/null; PROJECT_DIR="$(pwd)" next_report_num_unlocked'` — if sourcing has side effects, instead just confirm `node scripts/local/next-num.mjs` returns the expected number (it is the same code path).
Expected: same number as `node scripts/local/next-num.mjs` (`1210` or higher).

- [ ] **Step 5: Commit**

```bash
git add batch/batch-runner.sh
git commit -m "$(cat <<'EOF'
refactor(batch): batch-runner numbering delegates to next-num.mjs

Replaces the inline bash loop in next_report_num_unlocked with a call
to scripts/local/next-num.mjs so the orchestrator and the interactive
path share one numbering implementation. The lock/reserve wrapper is
unchanged — still required for parallel-worker atomicity.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Rename `modes/offer.md` → `modes/evaluate.md` and update identifier references

**Files:**
- Rename: `modes/offer.md` → `modes/evaluate.md`
- Modify: `AGENTS.md` (lines 26, 206, 318)
- Modify: `.agents/skills/career-ops/SKILL.md` (lines 6, 20, 52, 80)
- Modify: `modes/auto-pipeline.md` (lines 20, 23)
- Modify: `test-all.mjs` (lines 162, 263)

Classification rule: change `offer` only where it is the **mode identifier** or the **filename** `modes/offer.md`. Leave the English word "offer" / "job offer" in prose, and leave the `offers` mode entirely alone.

- [ ] **Step 1: Rename the file**

```bash
git mv modes/offer.md modes/evaluate.md
```

- [ ] **Step 2: Update the mode title inside the file**

In `modes/evaluate.md`, change line 1 from:
```
# Mode: offer — Full A-F Evaluation
```
to:
```
# Mode: evaluate — Full A-G Evaluation
```
Leave lines 3 and 7 ("When the candidate pastes a job offer", "Classify the offer") unchanged — that is vocabulary.

- [ ] **Step 3: Update `AGENTS.md`**

- Line 26: `modes/_shared.md`, `modes/offer.md`, all other modes → `modes/_shared.md`, `modes/evaluate.md`, all other modes
- Line 206: `| Asks to evaluate offer | `offer` |` → `| Asks to evaluate offer | `evaluate` |` (change only the backticked identifier; "evaluate offer" prose stays)
- Line 318: `(see Block G in `modes/offer.md`)` → `(see Block G in `modes/evaluate.md`)`
- Leave lines 5, 53, 160, 207, 217, 219, 245, 336 unchanged (vocabulary / the `offers` mode).

- [ ] **Step 4: Update `.agents/skills/career-ops/SKILL.md`**

(`.claude/skills/career-ops/SKILL.md` is a symlink to this file — editing this updates both.)

- Line 6: `argument-hint: "[scan | deep | pdf | offer | offers | apply | batch | ...]"` → replace `offer` with `evaluate` (keep `offers`)
- Line 20: `| `offer` | `offer` |` → `| `evaluate` | `evaluate` |`
- Line 52: `  /career-ops offer     → Evaluation only A-F (no auto PDF)` → `  /career-ops evaluate  → Evaluation only A-G (no auto PDF)`
- Line 80: `Applies to: `auto-pipeline`, `offer`, `offers`, ...` → replace `offer` with `evaluate` (keep `offers`)

- [ ] **Step 5: Update `modes/auto-pipeline.md`**

- Line 20: `Run exactly as the `offer` mode (read `modes/offer.md` for all A-F blocks + Block G Posting Legitimacy).` → `Run exactly as the `evaluate` mode (read `modes/evaluate.md` for all A-G blocks).`
- Line 23: `(see format in `modes/offer.md`)` → `(see format in `modes/evaluate.md`)`

- [ ] **Step 6: Update `test-all.mjs`**

- Line 162: `'modes/offer.md', 'modes/pdf.md', 'modes/scan.md',` → `'modes/evaluate.md', 'modes/pdf.md', 'modes/scan.md',`
- Line 263: `'_shared.md', '_profile.template.md', 'offer.md', 'pdf.md', 'scan.md',` → `'_shared.md', '_profile.template.md', 'evaluate.md', 'pdf.md', 'scan.md',`
- Leave line 265 (`'offers.md'`) unchanged.

- [ ] **Step 7: Verify no lingering identifier references**

Run: `grep -rn 'modes/offer\.md' . --include='*.md' --include='*.mjs' --include='*.sh' --include='*.json' | grep -v node_modules`
Expected: no output.

Run: `grep -rn '`offer`' AGENTS.md .agents/skills/career-ops/SKILL.md modes/`
Expected: no output (only `offers` should remain, which the pattern `` `offer` `` does not match).

Run: `node test-all.mjs`
Expected: PASS, or only the same pre-existing failures as before — no NEW failures, and no "file not found: modes/offer.md".

- [ ] **Step 8: Commit**

```bash
git add modes/evaluate.md AGENTS.md .agents/skills/career-ops/SKILL.md modes/auto-pipeline.md test-all.mjs
git commit -m "$(cat <<'EOF'
refactor(modes): rename offer mode to evaluate

`offer` was a literal translation of the upstream Spanish `oferta` and
misleads — the mode evaluates a job posting, it does not handle offers.
Renames modes/offer.md -> modes/evaluate.md and updates the mode
identifier in routing tables, SKILL.md, auto-pipeline cross-refs, and
test-all.mjs. The `offers` (multi-offer comparison) mode is untouched;
the English word "offer" in prose is untouched.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Point all numbering instructions at `next-num.mjs`

**Files:**
- Modify: `modes/evaluate.md` (the "next sequential number" instruction)
- Modify: `modes/auto-pipeline.md` (the `{###}` save instruction)
- Modify: `modes/batch.md` (line ~46: "Calculate next sequential REPORT_NUM")
- Modify: `AGENTS.md` (line ~289: "Report numbering: ...")

- [ ] **Step 1: Fix `modes/evaluate.md`**

In `modes/evaluate.md`, find the Post-evaluation "Save report" instruction (originally `offer.md` lines ~96-98):
```
Save the full evaluation to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = next sequential number (3 digits, zero-padded)
```
Replace with:
```
Save the full evaluation to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = the next evaluation number. Get it by running `node scripts/local/next-num.mjs` — this is the single source of truth (derived from the `reports/` folder + `batch/batch-state.tsv`). NEVER derive the number from `data/applications.md`.
```

- [ ] **Step 2: Fix `modes/auto-pipeline.md`**

In `modes/auto-pipeline.md`, find line ~23:
```
Save the full evaluation to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md` (see format in `modes/evaluate.md`).
```
Replace with:
```
Save the full evaluation to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md` (see format in `modes/evaluate.md`). Get `{###}` from `node scripts/local/next-num.mjs`.
```

- [ ] **Step 3: Fix `modes/batch.md`**

In `modes/batch.md`, find the conductor step (line ~46):
```
   c. Calculate next sequential REPORT_NUM
```
Replace with:
```
   c. Get next REPORT_NUM: run `node scripts/local/next-num.mjs` (single source of truth — reports/ + batch-state.tsv)
```

- [ ] **Step 4: Fix `AGENTS.md`**

In `AGENTS.md`, find line ~289:
```
- Report numbering: sequential 3-digit zero-padded, max existing + 1
```
Replace with:
```
- Report numbering: get the next number from `node scripts/local/next-num.mjs` (single source of truth — max in `reports/` + `batch/batch-state.tsv`, +1). NEVER derive it from `data/applications.md`.
```

- [ ] **Step 5: Verify**

Run: `grep -rn 'next sequential\|max existing' modes/ AGENTS.md`
Expected: no output (all replaced).

Run: `grep -rln 'next-num.mjs' modes/ AGENTS.md`
Expected: `modes/evaluate.md`, `modes/auto-pipeline.md`, `modes/batch.md`, `AGENTS.md`.

- [ ] **Step 6: Commit**

```bash
git add modes/evaluate.md modes/auto-pipeline.md modes/batch.md AGENTS.md
git commit -m "$(cat <<'EOF'
fix(numbering): point interactive + conductor paths at next-num.mjs

Replaces vague "next sequential number / max existing + 1" wording in
evaluate.md, auto-pipeline.md, batch.md, and AGENTS.md with an explicit
instruction to run scripts/local/next-num.mjs. Removes the ambiguity
that let evaluations derive the number from data/applications.md and
collide with existing reports.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Make `modes/evaluate.md` canonical; thin the batch prompts

The A-G rubric is currently triplicated. Canonical sources after this task:
- `modes/_shared.md` — scoring system, archetype detection table, Block G tiers, global rules (already canonical; unchanged).
- `modes/evaluate.md` — the A-G block-by-block walkthrough + report format (canonical).
- `batch/batch-prompt.md` / `batch/batch-prompt-eval-only.md` — thin wrappers: placeholders + "read the canonical files" + batch-specific steps (report path, TSV, JSON, PDF yes/no).

**Files:**
- Modify: `batch/batch-prompt-eval-only.md` (replace duplicated rubric with references)
- Modify: `batch/batch-prompt.md` (replace duplicated rubric with references)

- [ ] **Step 1: Correct the stale Block G and block count in `modes/evaluate.md`**

`modes/evaluate.md` (the renamed `offer.md`) carries pre-Block-G wording that contradicts the canonical `modes/_shared.md` and the real reports. Fix three spots:

1. Line ~3: `When the candidate pastes a job offer (text or URL), ALWAYS deliver all 6 blocks:` → `When the candidate pastes a job posting (text or URL), ALWAYS deliver all 7 blocks (A-G):`
2. In the Post-evaluation report-format block, the line `## G) Draft Application Answers` and its `(only if score >= 4.5 ...)` description → replace with:
   ```
   ## G) Posting Legitimacy
   (assess whether the posting is a real, active opening; assign a tier — High Confidence / Proceed with Caution / Suspicious. See "Posting Legitimacy (Block G)" in `modes/_shared.md`.)
   ```
3. If a `## Block F` walkthrough section exists but no `## Block G` walkthrough section, add after Block F:
   ```
   ## Block G — Posting Legitimacy

   Assess the posting per "Posting Legitimacy (Block G)" in `modes/_shared.md` and report the tier. This is a separate qualitative assessment — it does NOT affect the 1-5 global score.
   ```

This makes `modes/evaluate.md` the accurate canonical A-G walkthrough. The archetype table, scoring system, and Block G tier definitions stay canonical in `modes/_shared.md` (referenced, not duplicated).

- [ ] **Step 2: Rewrite `batch/batch-prompt-eval-only.md` as a thin wrapper**

Replace the ENTIRE contents of `batch/batch-prompt-eval-only.md` with:

```markdown
# career-ops Batch Worker — Evaluation Only (no PDF)

You are a job evaluation worker. You receive a job URL (and optional JD text file) and produce ONLY:

1. Full A-G evaluation report (`.md`)
2. Tracker TSV line
3. JSON summary to stdout

**You do NOT generate a PDF.** The tracker TSV must mark `pdf` as `❌`.

**IMPORTANT**: This prompt is self-contained in the sense that it does not depend on conversation history. It DOES read the canonical rubric files listed below — those are the single source of truth, so this worker never drifts from the interactive `evaluate` mode.

---

## Canonical rubric — READ these before evaluating

| File | What it provides |
|------|------------------|
| `modes/_shared.md` | Scoring system (1-5), archetype detection table, Posting Legitimacy (Block G) tiers, global rules |
| `modes/evaluate.md` | The A-G block-by-block evaluation walkthrough + report format |
| `cv.md` | Candidate CV (read-only — never modify) |
| `modes/_profile.md` | Candidate archetypes, narrative, negotiation |
| `config/profile.yml` | Candidate identity and targets |
| `article-digest.md` | Proof points (if it exists; read-only) |

**RULE: NEVER hardcode metrics.** Read them from `cv.md` + `article-digest.md` at evaluation time.

---

## Placeholders (substituted by the orchestrator)

| Placeholder | Description |
|-------------|-------------|
| `{{URL}}` | Job posting URL |
| `{{JD_FILE}}` | Path to file containing JD text |
| `{{REPORT_NUM}}` | Report number, already reserved by the orchestrator (zero-padded) |
| `{{DATE}}` | Current date YYYY-MM-DD |
| `{{ID}}` | Unique offer ID in batch-input.tsv |

---

## Pipeline — execute ALL 4 steps in order

### Step 1 — Get JD

1. Read the JD file at `{{JD_FILE}}`.
2. If empty/missing, WebFetch `{{URL}}`.
3. If both fail, go to Step 4 with `status: failed` and stop.

### Step 2 — Full A-G evaluation

Read `modes/_shared.md` and `modes/evaluate.md` and follow them to produce all blocks A through G against the JD. Read `cv.md`, `modes/_profile.md`, `config/profile.yml`, and `article-digest.md` (if present) for candidate facts. Block G note: Playwright is not available in batch mode — mark posting-freshness signals as "unverified (batch mode)".

### Step 3 — Save report .md

Write the full evaluation to `reports/{{REPORT_NUM}}-{company-slug}-{{DATE}}.md` (`{company-slug}` = lowercase, hyphens, no spaces).

REQUIRED HEADER (exact — the orchestrator parses this):

```markdown
# Evaluation: {Company} — {Role}

**Date:** {{DATE}}
**Archetype:** {detected}
**Score:** {X.XX}/5
**Legitimacy:** {High Confidence|Proceed with Caution|Suspicious}
**URL:** {{URL}}
**PDF:** ❌ (eval-only batch run)
**Batch ID:** {{ID}}
**Verification:** unconfirmed (batch mode)
```

Follow the body format (sections A-G + Extracted Keywords) defined in `modes/evaluate.md`.

### Step 4 — Tracker TSV line (MANDATORY)

Write one line to `batch/tracker-additions/{{ID}}.tsv` — no header, 9 tab-separated columns, actual TAB characters:

```
{{REPORT_NUM}}	{{DATE}}	{company}	{role}	Evaluated	{X.XX}/5	❌	[{{REPORT_NUM}}](reports/{{REPORT_NUM}}-{company-slug}-{{DATE}}.md)	{one_line_note}
```

Column order (status BEFORE score): num, date, company, role, status, score, pdf, report, notes.
**The `num` column (col 1) is `{{REPORT_NUM}}` — the number the orchestrator already reserved. Do NOT recompute it from `data/applications.md`.**
Status must be canonical (`Evaluated`, `Applied`, `Responded`, `Interview`, `Offer`, `Rejected`, `Discarded`, `SKIP`).

### Step 5 — JSON summary (MANDATORY — final stdout output)

Print a single JSON object:

```json
{"status":"completed","id":"{{ID}}","report_num":"{{REPORT_NUM}}","company":"{company}","role":"{role}","score":X.XX,"legitimacy":"{High Confidence|Proceed with Caution|Suspicious}","report":"reports/{{REPORT_NUM}}-{company-slug}-{{DATE}}.md","error":null}
```

On failure:

```json
{"status":"failed","id":"{{ID}}","report_num":"{{REPORT_NUM}}","company":"{company_or_unknown}","role":"{role_or_unknown}","score":null,"error":"{error_description}"}
```
```

- [ ] **Step 3: Rewrite `batch/batch-prompt.md` as a thin wrapper**

Replace the ENTIRE contents of `batch/batch-prompt.md` with the same wrapper as Step 2, with these differences:
- Title: `# career-ops Batch Worker — Full Evaluation + PDF + Tracker Line`
- The intro lists 3 outputs: `1. Full A-G evaluation report (.md)`, `2. ATS-optimized tailored PDF`, `3. Tracker TSV line`. Remove the "You do NOT generate a PDF" line.
- In the Canonical rubric table, add two rows: `templates/cv-template.html` ("CV template for the PDF") and `generate-pdf.mjs` ("HTML→PDF generator").
- Add a **Step 4 — Generate PDF** between Save report and Tracker TSV. Keep the existing PDF instructions from the current `batch/batch-prompt.md` (the Step 4 "Generate PDF" block, the ATS rules, Design, Keyword injection strategy, and Template placeholders table — that content is PDF-specific and NOT duplicated elsewhere, so it stays verbatim). Renumber the subsequent steps (Tracker TSV → Step 5, JSON → Step 6).
- In the Tracker TSV step, the `pdf` column is `✅` (a PDF was generated) and the report header `**PDF:**` line points at the generated PDF path instead of `❌`.
- The `num` column rule is identical: use `{{REPORT_NUM}}`, never recompute from `applications.md`.

- [ ] **Step 4: Verify the duplicated rubric is gone and references are present**

Run: `grep -cE '^#### Block [A-G]|^### Block [A-G]' batch/batch-prompt.md batch/batch-prompt-eval-only.md`
Expected: `0` for both (block walkthroughs no longer inlined).

Run: `grep -l 'modes/evaluate.md' batch/batch-prompt.md batch/batch-prompt-eval-only.md`
Expected: both files listed.

Run: `grep -n 'applications.md' batch/batch-prompt.md batch/batch-prompt-eval-only.md`
Expected: no output, OR only the explicit "Do NOT recompute it from data/applications.md" line — confirm no instruction still tells the worker to READ applications.md for the number.

- [ ] **Step 5: Commit**

```bash
git add batch/batch-prompt.md batch/batch-prompt-eval-only.md
git commit -m "$(cat <<'EOF'
refactor(batch): thin batch prompts to wrappers over canonical rubric

The A-G rubric was triplicated across offer.md and the two batch
prompts and drifting independently — that drift is what let the
eval-only worker compute the tracker number from applications.md.
Batch prompts now read modes/_shared.md + modes/evaluate.md for the
rubric and keep only batch-specific steps (placeholders, report path,
TSV, JSON, PDF). The TSV num column uses the orchestrator-reserved
{{REPORT_NUM}}.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Clean up `update-system.mjs` SYSTEM_PATHS

**Files:**
- Modify: `update-system.mjs` (SYSTEM_PATHS array, lines ~31-52)

- [ ] **Step 1: Remove the four fork-renamed mode files**

In `update-system.mjs`, the `SYSTEM_PATHS` array currently includes `'modes/oferta.md'`, `'modes/ofertas.md'`, `'modes/contacto.md'`, and `'modes/apply.md'`. Delete those four lines. Add a comment in their place:

```javascript
  // NOTE: fork-renamed mode files (upstream oferta/ofertas/contacto/aplicar →
  // fork evaluate/offers/contact/apply) are intentionally NOT listed here.
  // Per FORK_NOTES.md Invariant 1, upstream edits to those files are ported
  // manually during sync, not by this auto-updater.
```

Leave every other entry (`modes/_shared.md`, `modes/pdf.md`, `modes/scan.md`, `modes/batch.md`, `modes/auto-pipeline.md`, `modes/deep.md`, `modes/pipeline.md`, `modes/project.md`, `modes/tracker.md`, `modes/training.md`, `modes/latex.md`, `modes/_profile.template.md`, and the `modes/de|fr|ja|pt|ru/` dirs) untouched.

- [ ] **Step 2: Verify the file still parses**

Run: `node -e "import('./update-system.mjs').then(() => console.log('parses OK')).catch(e => { console.error(e); process.exit(1); })"`
Expected: `parses OK` (or, if the module auto-runs a check on import, the normal `update-system.mjs check` JSON output with no syntax error).

Alternatively: `node update-system.mjs check` → expected: valid JSON status output, no crash.

- [ ] **Step 3: Commit**

```bash
git add update-system.mjs
git commit -m "$(cat <<'EOF'
fix(update-system): drop fork-renamed mode files from SYSTEM_PATHS

oferta.md / ofertas.md / contacto.md point at files that do not exist
in this fork (the Spanish→English rename orphaned them); apply.md is
English here but upstream's file is aplicar.md, so its auto-fetch is
also silently broken. Per FORK_NOTES Invariant 1 these files are
sync-ported manually, so the auto-updater should not manage them.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Update `FORK_NOTES.md`

**Files:**
- Modify: `FORK_NOTES.md` (Invariant 1 rename list + Local Features Log)

- [ ] **Step 1: Extend the Invariant 1 rename mapping**

In `FORK_NOTES.md`, under "### 1. English is the primary language", the bullet list of Spanish→English renames currently reads:
```
  - `modes/oferta.md` → `modes/offer.md`
  - `modes/ofertas.md` → `modes/offers.md`
  - `modes/aplicar.md` → `modes/apply.md`
  - `modes/contacto.md` → `modes/contact.md`
```
Change the first line to:
```
  - `modes/oferta.md` → `modes/evaluate.md` (was `modes/offer.md` until 2026-05-14; renamed for clarity — the mode evaluates a posting, it does not handle offers)
```
Leave the other three lines unchanged.

- [ ] **Step 2: Add a Local Features Log entry**

In the "## Local Features Log" table, add a new row at the TOP of the table body (newest-first):
```
| 2026-05-14 | `TBD` | Rename `offer` mode → `evaluate`; unified report numbering via `next-num.mjs`; batch prompts thinned to wrappers over canonical rubric | `modes/offer.md` → `modes/evaluate.md`. New `scripts/local/next-num.mjs` (single source of truth for report numbers: `reports/` + `batch-state.tsv`, never `applications.md`). `batch/batch-prompt*.md` reduced to thin wrappers reading `modes/_shared.md` + `modes/evaluate.md`. Dropped 4 fork-renamed files from `update-system.mjs` SYSTEM_PATHS. Spec: `docs/superpowers/specs/2026-05-14-evaluate-rename-and-numbering-design.md`. Plan: `docs/superpowers/plans/2026-05-14-evaluate-rename-and-numbering.md`. |
```

- [ ] **Step 3: Commit**

```bash
git add FORK_NOTES.md
git commit -m "$(cat <<'EOF'
docs(fork): record evaluate rename + numbering refactor in FORK_NOTES

Updates Invariant 1 so the next upstream sync knows oferta.md ports to
evaluate.md (was offer.md), and adds a Local Features Log entry.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Backfill the merge SHA**

After this branch is merged to `main`, replace the `` `TBD` `` in the Local Features Log row with the actual merge commit SHA (per the FORK_NOTES convention). This is a post-merge step — note it for the merge.

---

## Task 8: Final verification sweep

**Files:** none modified — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `node test-all.mjs`
Expected: PASS, or only the SAME pre-existing failures recorded in the spec (rows #3/#5 missing report files, `-` score-format rows). No NEW failures. No "modes/offer.md not found".

- [ ] **Step 2: Run the next-num unit tests**

Run: `node scripts/local/test-next-num.mjs`
Expected: `10 passed, 0 failed`.

- [ ] **Step 3: Run pipeline verification**

Run: `node verify-pipeline.mjs`
Expected: same pre-existing errors/warnings as before this branch — no new ones introduced.

- [ ] **Step 4: Confirm the batch dry-run path**

Run: `bash batch/batch-runner.sh --dry-run`
Expected: runs without error.

- [ ] **Step 5: Identifier sweep**

Run: `grep -rn 'modes/offer\.md' . --include='*.md' --include='*.mjs' --include='*.sh' --include='*.json' | grep -v node_modules | grep -v docs/superpowers`
Expected: no output (docs/superpowers spec/plan may mention the old name historically — that is fine, hence the exclusion).

Run: `grep -rn '`offer`' AGENTS.md modes/ .agents/`
Expected: no output (`offers` is fine and won't match).

- [ ] **Step 6: Confirm numbering single-source**

Run: `node scripts/local/next-num.mjs`
Expected: prints a number ≥ `1210`.

Run: `grep -rn 'applications.md' batch/batch-prompt.md batch/batch-prompt-eval-only.md`
Expected: no output, or only the explicit "do NOT recompute from applications.md" guard line.

- [ ] **Step 7: Final review commit (if any verification surfaced fixes)**

If Steps 1-6 surfaced no issues, no commit needed. If a fix was required, commit it with a clear message describing what verification caught.

---

## Self-Review notes

- **Spec coverage:** Part A → Task 3. Part B → Tasks 1, 2, 4, 5 (step 4 of Task 5 fixes the batch-prompt num column). Part C → Task 5. Part D → Tasks 6, 7. Part E → Task 8. Part F → Task 1 ships `--audit` (Steps 3/5); historical renumbering is explicitly out of scope (separate fast-follow spec).
- **No placeholders:** all code shown in full; `.md` edits are exact old→new strings.
- **Type consistency:** `next-num.mjs` exports `maxReportNum`, `maxStateNum`, `computeNextNum({reportsDir, stateFile})`, `findDuplicates` — used with those exact names/signatures in `test-next-num.mjs`.
