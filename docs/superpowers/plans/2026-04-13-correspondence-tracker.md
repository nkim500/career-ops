# Correspondence Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend career-ops with interview round archiving + debrief mode, and generalize `data/follow-ups.md` into a task tracker that handles both app-linked follow-ups and standalone obligations.

**Architecture:** Two additive features. Feature A stores interview transcripts in `interview-prep/{company}-{role}/rounds/` and adds a `modes/debrief.md` that synthesizes structured debriefs with a review gate for action items. Feature B extends `data/follow-ups.md` with `Type`/`Due`/`Status` columns and adds `add`/`list`/`done` verbs to `modes/followup.md`. The cadence script gains a `standalone_tasks` output key for non-app-linked rows.

**Tech Stack:** Node.js (mjs), Markdown (data + modes), YAML (config)

**Spec:** `docs/superpowers/specs/2026-04-13-correspondence-tracker-design.md`

**Branch:** Create `feat/correspondence-tracker` from up-to-date `main` before starting.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `data/follow-ups.md` | Task/follow-up tracker (user data) | Reshape to new 11-column schema |
| `modes/followup.md` | Agent instructions for follow-up/task mode | Add `add`/`list`/`done` verb sections |
| `modes/debrief.md` | Agent instructions for interview debrief mode | **New file** |
| `followup-cadence.mjs` | Cadence analysis script (JSON output) | Parse new columns, add `standalone_tasks` key |
| `test-all.mjs` | Test suite | Add follow-ups schema validation + cadence output tests |
| `CLAUDE.md` | Agent instructions | Add `debrief` to skill modes table + main files table |
| `DATA_CONTRACT.md` | Data layer documentation | Add `rounds/` and `debriefs/` paths |
| `FORK_NOTES.md` | Fork divergence record | Log correspondence tracker as local feature |

---

### Task 1: Create feature branch

**Files:** None (git operation)

- [ ] **Step 1: Ensure main is up to date**

```bash
git switch main
git pull --ff-only origin main
```

- [ ] **Step 2: Create and switch to feature branch**

```bash
git checkout -b feat/correspondence-tracker
```

- [ ] **Step 3: Verify**

```bash
git branch --show-current
```

Expected: `feat/correspondence-tracker`

---

### Task 2: Reshape `data/follow-ups.md` to new schema

**Files:**
- Modify: `data/follow-ups.md`

The current file has 6 columns: `Date | Company | Role | Action | Status | Notes`. The target schema has 11 columns: `# | App# | Type | Date | Due | Company | Role | Channel | Contact | Status | Notes`. Each existing row gets mapped: `#` assigned sequentially, `App#` populated where identifiable from notes, `Type=followup`, old `Action` content merged into `Notes`, old `Status` mapped to new `Status` (`Pending`→`open`, `Scheduled`→`open`), `Channel` and `Contact` extracted from existing `Action`/`Notes` where possible, `Due` set from existing `Date` column (which currently holds the follow-up due date, not creation date).

- [ ] **Step 1: Write the test — follow-ups schema validation**

Add a new test section to `test-all.mjs` after Section 10 (Version file), before the SUMMARY block. Insert at line 298 (before the final summary):

```javascript
// ── 11. FOLLOW-UPS SCHEMA ───────────────────────────────────────

console.log('\n11. Follow-ups schema validation');

if (fileExists('data/follow-ups.md')) {
  const fuContent = readFile('data/follow-ups.md');
  const fuLines = fuContent.split('\n').filter(l => l.startsWith('|'));
  const validTypes = ['followup', 'task', 'debrief-action'];
  const validStatuses = ['open', 'done', 'dropped'];
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  let fuErrors = 0;

  // Check header row
  if (fuLines.length > 0) {
    const headerCols = fuLines[0].split('|').map(s => s.trim()).filter(Boolean);
    const expectedHeader = ['#', 'App#', 'Type', 'Date', 'Due', 'Company', 'Role', 'Channel', 'Contact', 'Status', 'Notes'];
    if (headerCols.length === expectedHeader.length && headerCols.every((c, i) => c === expectedHeader[i])) {
      pass('follow-ups.md header matches expected schema');
    } else {
      fail(`follow-ups.md header mismatch. Got: ${headerCols.join(' | ')}`);
      fuErrors++;
    }
  }

  // Check data rows (skip header + separator)
  for (const line of fuLines.slice(2)) {
    const cols = line.split('|').map(s => s.trim()).filter(Boolean);
    if (cols.length < 11) { fail(`follow-ups.md row has ${cols.length} columns, expected 11: ${cols[0]}`); fuErrors++; continue; }

    const rowNum = cols[0];
    const type = cols[2];
    const date = cols[3];
    const due = cols[4];
    const status = cols[9];

    if (isNaN(parseInt(rowNum))) { fail(`follow-ups.md row # is not a number: "${rowNum}"`); fuErrors++; }
    if (!validTypes.includes(type)) { fail(`follow-ups.md row ${rowNum} invalid Type: "${type}"`); fuErrors++; }
    if (!dateRe.test(date)) { fail(`follow-ups.md row ${rowNum} invalid Date: "${date}"`); fuErrors++; }
    if (due !== '' && !dateRe.test(due)) { fail(`follow-ups.md row ${rowNum} invalid Due: "${due}"`); fuErrors++; }
    if (!validStatuses.includes(status)) { fail(`follow-ups.md row ${rowNum} invalid Status: "${status}"`); fuErrors++; }
  }

  if (fuErrors === 0) {
    pass('All follow-ups.md data rows pass schema validation');
  }
} else {
  warn('data/follow-ups.md does not exist (OK if no follow-ups yet)');
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node test-all.mjs --quick
```

Expected: Section 11 fails because current `data/follow-ups.md` has the old 6-column header.

- [ ] **Step 3: Reshape the data file**

Replace the entire content of `data/follow-ups.md` with the new schema. Map each of the 18 existing rows:

```markdown
# Follow-Ups

| # | App# | Type | Date | Due | Company | Role | Channel | Contact | Status | Notes |
|---|------|------|------|-----|---------|------|---------|---------|--------|-------|
| 1 |  | followup | 2026-04-13 | 2026-04-13 | Capital One | Senior Data Scientist, AI Foundations | LinkedIn |  | open | LinkedIn outreach to AI Foundations team; Friend referred to HM on 2026-04-08 |
| 2 |  | followup | 2026-04-13 | 2026-04-13 | YC Startup (HartleyCo) | Senior Founding Engineer | phone |  | open | Intro call with Josh Kelly 10:00AM PDT; Undisclosed YC startup; AI observability/simulation; ask for company name, funding, team size, comp range |
| 3 |  | followup | 2026-04-13 | 2026-04-13 | Bretton AI | Software Engineer, Product |  |  | open | Follow-up if no response; Applied 2026-04-06 |
| 4 |  | followup | 2026-04-13 | 2026-04-13 | Vooma | AI Software Engineer |  |  | open | Follow-up if no response; Applied 2026-04-06 |
| 5 |  | followup | 2026-04-13 | 2026-04-14 | Artisan | Applied AI |  |  | open | Follow-up if no response; Applied 2026-04-07 |
| 6 |  | followup | 2026-04-13 | 2026-04-14 | Distyl AI | AI Evaluation Engineer |  |  | open | Follow-up if no response; Applied both roles 2026-04-07 |
| 7 |  | followup | 2026-04-13 | 2026-04-14 | Distyl AI | Forward Deployed AI Engineer |  |  | open | Follow-up if no response; Applied both roles 2026-04-07 |
| 8 |  | followup | 2026-04-13 | 2026-04-14 | Glean | Machine Learning Engineer, LLM Evals & Observability |  |  | open | Follow-up if no response; Applied 2026-04-07 |
| 9 |  | followup | 2026-04-13 | 2026-04-14 | Reducto | Backend AI Engineer |  |  | open | Follow-up if no response; Applied 2026-04-07 |
| 10 |  | followup | 2026-04-13 | 2026-04-14 | Snowflake | Applied AI Engineer |  |  | open | Follow-up if no response; Applied 2026-04-07 |
| 11 |  | followup | 2026-04-13 | 2026-04-14 | Supio | Software Engineer, Applied AI |  |  | open | Follow-up if no response; Applied 2026-04-07 |
| 12 |  | followup | 2026-04-13 | 2026-04-15 | Capital One | Senior Data Scientist, AI Foundations |  |  | open | Follow-up if no response; Applied 2026-04-08 |
| 13 |  | followup | 2026-04-13 | 2026-04-16 | Anthropic | Engineering Manager, Claude for Financial Services |  |  | open | Follow-up if no response; Applied 2026-04-09 |
| 14 |  | followup | 2026-04-13 | 2026-04-16 | Future | Applied AI Engineer |  |  | open | Follow-up if no response; Applied 2026-04-09 |
| 15 |  | followup | 2026-04-13 | 2026-04-16 | LlamaIndex | AI Content Engineer |  |  | open | Follow-up if no response; Applied 2026-04-09 |
| 16 |  | followup | 2026-04-13 | 2026-04-16 | Pathway | Spontaneous Application |  |  | open | Follow-up if no response; Applied 2026-04-09 |
| 17 |  | followup | 2026-04-13 | 2026-04-17 | Deloitte | AI & Analytics Innovation Senior Consultant |  |  | open | Follow-up if no response; Applied 2026-04-10 |
```

Note: `Date` is set to 2026-04-13 (when the file was auto-generated). `Due` comes from the original `Date` column (which was actually the follow-up due date). `App#` is left blank — the implementer should cross-reference `data/applications.md` and fill in app numbers where matches exist.

- [ ] **Step 4: Run test to verify it passes**

```bash
node test-all.mjs --quick
```

Expected: Section 11 passes. All rows validate.

- [ ] **Step 5: Commit**

```bash
git add data/follow-ups.md test-all.mjs
git commit -m "feat: reshape follow-ups.md to 11-column schema with Type/Due/Status

Extends the follow-up tracker to support standalone tasks (blank App#),
explicit due dates, and open/done/dropped status tracking. Adds schema
validation test in test-all.mjs (Section 11)."
```

---

### Task 3: Extend `followup-cadence.mjs` to parse new schema + emit `standalone_tasks`

**Files:**
- Modify: `followup-cadence.mjs:106-128` (parseFollowups function)
- Modify: `followup-cadence.mjs:194-281` (analyze function + output)
- Modify: `test-all.mjs` (add cadence output test)

- [ ] **Step 1: Write the test — cadence output has standalone_tasks key**

Add to `test-all.mjs` Section 11, after the schema validation block:

```javascript
// Test followup-cadence.mjs output structure
console.log('\n12. Cadence script extended output');

try {
  const cadenceResult = run('node', ['followup-cadence.mjs']);
  if (cadenceResult !== null) {
    const cadenceJson = JSON.parse(cadenceResult);

    if ('standalone_tasks' in cadenceJson) {
      pass('followup-cadence.mjs output has standalone_tasks key');
    } else {
      fail('followup-cadence.mjs output missing standalone_tasks key');
    }

    if ('entries' in cadenceJson && 'metadata' in cadenceJson && 'cadenceConfig' in cadenceJson) {
      pass('followup-cadence.mjs preserves existing output keys');
    } else {
      fail('followup-cadence.mjs missing existing output keys');
    }

    // Verify standalone_tasks contains no app-linked rows
    if (Array.isArray(cadenceJson.standalone_tasks)) {
      const appLinkedInStandalone = cadenceJson.standalone_tasks.filter(t => t.appNum && !isNaN(t.appNum));
      if (appLinkedInStandalone.length === 0) {
        pass('standalone_tasks contains no app-linked rows');
      } else {
        fail(`standalone_tasks contains ${appLinkedInStandalone.length} app-linked rows`);
      }
    }
  } else {
    fail('followup-cadence.mjs crashed');
  }
} catch (e) {
  fail(`Cadence script test crashed: ${e.message}`);
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node test-all.mjs --quick
```

Expected: Section 12 fails — `standalone_tasks` key not in output.

- [ ] **Step 3: Update `parseFollowups()` in `followup-cadence.mjs`**

Replace the `parseFollowups` function (lines 106-128) with:

```javascript
// --- Parse follow-ups.md (new 11-column schema) ---
function parseFollowups() {
  if (!existsSync(FOLLOWUPS_FILE)) return [];
  const content = readFileSync(FOLLOWUPS_FILE, 'utf-8');
  const entries = [];
  for (const line of content.split('\n')) {
    if (!line.startsWith('|')) continue;
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 12) continue; // 11 columns + leading/trailing empty from split
    const num = parseInt(parts[1]);
    if (isNaN(num)) continue;
    entries.push({
      num,
      appNum: parts[2] ? parseInt(parts[2]) : null,
      type: parts[3] || 'followup',       // followup | task | debrief-action
      date: parts[4],
      due: parts[5] || null,
      company: parts[6],
      role: parts[7],
      channel: parts[8],
      contact: parts[9],
      status: parts[10] || 'open',         // open | done | dropped
      notes: parts[11] || '',
    });
  }
  return entries;
}
```

- [ ] **Step 4: Update `analyze()` to separate standalone tasks**

In the `analyze()` function, after building the `followups` array and the `followupsByApp` map, add filtering logic. The key changes:

1. Filter out `done` and `dropped` rows from follow-ups before grouping by app.
2. After the existing app-linked analysis loop, build a `standalone_tasks` array from follow-up rows where `type !== 'followup'` (i.e., `task` or `debrief-action`) OR where `appNum` is null/NaN.
3. Add `standalone_tasks` to the return object.

Replace the `analyze()` function (lines 194-281) with:

```javascript
// --- Main analysis ---
function analyze() {
  const apps = parseTracker();
  if (apps.length === 0 && !existsSync(FOLLOWUPS_FILE)) {
    return { error: 'No applications found in tracker.' };
  }

  const allFollowups = parseFollowups();

  // Filter out done/dropped
  const activeFollowups = allFollowups.filter(fu => fu.status === 'open');

  // Separate app-linked followups from standalone tasks
  const appLinkedFollowups = activeFollowups.filter(fu => fu.type === 'followup' && fu.appNum && !isNaN(fu.appNum));
  const standaloneTasks = activeFollowups.filter(fu => fu.type !== 'followup' || !fu.appNum || isNaN(fu.appNum));

  // Group app-linked follow-ups by app number
  const followupsByApp = new Map();
  for (const fu of appLinkedFollowups) {
    if (!followupsByApp.has(fu.appNum)) followupsByApp.set(fu.appNum, []);
    followupsByApp.get(fu.appNum).push(fu);
  }

  const now = today();
  const entries = [];

  for (const app of apps) {
    const normalized = normalizeStatus(app.status);
    if (!ACTIONABLE_STATUSES.includes(normalized)) continue;

    const appDate = parseDate(app.date);
    if (!appDate) continue;

    const daysSinceApp = daysBetween(appDate, now);
    const appFollowups = followupsByApp.get(app.num) || [];
    const followupCount = appFollowups.length;

    // Find most recent follow-up
    let lastFollowupDate = null;
    let daysSinceLastFollowup = null;
    if (appFollowups.length > 0) {
      const sorted = appFollowups.sort((a, b) => (a.date > b.date ? -1 : 1));
      lastFollowupDate = sorted[0].date;
      const lastDate = parseDate(lastFollowupDate);
      if (lastDate) daysSinceLastFollowup = daysBetween(lastDate, now);
    }

    const urgency = computeUrgency(normalized, daysSinceApp, daysSinceLastFollowup, followupCount);
    const nextFollowupDate = computeNextFollowupDate(normalized, app.date, lastFollowupDate, followupCount);
    const nextDate = nextFollowupDate ? parseDate(nextFollowupDate) : null;
    const daysUntilNext = nextDate ? daysBetween(now, nextDate) : null;

    const contacts = extractContacts(app.notes);
    const reportPath = resolveReportPath(app.report);

    entries.push({
      num: app.num,
      date: app.date,
      company: app.company,
      role: app.role,
      status: normalized,
      score: app.score,
      notes: app.notes,
      reportPath,
      contacts,
      daysSinceApplication: daysSinceApp,
      daysSinceLastFollowup,
      followupCount,
      urgency,
      nextFollowupDate,
      daysUntilNext,
    });
  }

  // Sort by urgency priority: urgent > overdue > waiting > cold
  const urgencyOrder = { urgent: 0, overdue: 1, waiting: 2, cold: 3 };
  entries.sort((a, b) => (urgencyOrder[a.urgency] ?? 9) - (urgencyOrder[b.urgency] ?? 9));

  // Compute standalone task urgency from Due date only
  const standaloneWithUrgency = standaloneTasks.map(t => {
    let urgency = 'open';
    if (t.due) {
      const dueDate = parseDate(t.due);
      if (dueDate) {
        const daysUntil = daysBetween(now, dueDate);
        if (daysUntil < 0) urgency = 'overdue';
        else if (daysUntil <= 3) urgency = 'due-soon';
        else urgency = 'waiting';
      }
    }
    return { ...t, urgency };
  });

  // Sort standalone: overdue first, then due-soon, then waiting, then open
  const standaloneOrder = { overdue: 0, 'due-soon': 1, waiting: 2, open: 3 };
  standaloneWithUrgency.sort((a, b) => (standaloneOrder[a.urgency] ?? 9) - (standaloneOrder[b.urgency] ?? 9));

  const filtered = overdueOnly
    ? entries.filter(e => e.urgency === 'overdue' || e.urgency === 'urgent')
    : entries;

  return {
    metadata: {
      analysisDate: now.toISOString().split('T')[0],
      totalTracked: apps.length,
      actionable: entries.length,
      overdue: entries.filter(e => e.urgency === 'overdue').length,
      urgent: entries.filter(e => e.urgency === 'urgent').length,
      cold: entries.filter(e => e.urgency === 'cold').length,
      waiting: entries.filter(e => e.urgency === 'waiting').length,
      standaloneTasks: standaloneWithUrgency.length,
      standaloneOverdue: standaloneWithUrgency.filter(t => t.urgency === 'overdue').length,
    },
    entries: filtered,
    standalone_tasks: standaloneWithUrgency,
    cadenceConfig: CADENCE,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
node test-all.mjs --quick
```

Expected: Sections 11 and 12 pass. Existing tests unaffected.

- [ ] **Step 6: Verify JSON output manually**

```bash
node followup-cadence.mjs | head -30
```

Expected: JSON with `metadata`, `entries`, `standalone_tasks`, `cadenceConfig` keys. `standalone_tasks` should contain the current 17 rows (all have blank `App#` so they're classified as standalone). Once `App#` values are populated for app-linked rows, they'll shift to `entries`.

- [ ] **Step 7: Commit**

```bash
git add followup-cadence.mjs test-all.mjs
git commit -m "feat: extend followup-cadence.mjs for new schema + standalone_tasks

parseFollowups() now reads the 11-column schema (Type, Due, Status).
analyze() filters out done/dropped rows, separates app-linked from
standalone tasks, and emits standalone_tasks with due-date-based urgency.
Existing entries/cadenceConfig contract preserved."
```

---

### Task 4: Extend `modes/followup.md` with `add`/`list`/`done` verbs

**Files:**
- Modify: `modes/followup.md`

- [ ] **Step 1: Add verb sections to the top of `modes/followup.md`**

Insert the following after the existing `## Purpose` paragraph and before `## Inputs`. This makes the new verbs discoverable first, with the existing cadence dashboard content following as the default (no-verb) behavior:

```markdown
## Verbs

This mode supports multiple verbs. If no verb is given, default to the cadence dashboard (Step 1 below).

### `followup add`

Add a new task or follow-up to `data/follow-ups.md`.

**Required fields:** At minimum, `Notes` (what needs doing). Everything else can be blank.

**Inputs (ask for what's missing):**
- `Company` — optional, blank for non-job tasks
- `Role` — optional
- `Contact` — person name
- `Channel` — email / LinkedIn / phone / slack / other
- `Notes` — what needs doing (free-form)
- `Due` — YYYY-MM-DD, optional
- `App#` — link to applications.md row, optional
- `Type` — `followup` (app-linked), `task` (standalone), `debrief-action` (from debrief). Defaults to `task` if no `App#`, `followup` if `App#` is provided.

**Process:**
1. Parse what the user said and fill in as many fields as possible from context.
2. Ask for anything critical that's missing (at minimum confirm the task description).
3. Assign `#` as max existing `#` + 1.
4. Set `Date` to today, `Status` to `open`.
5. Append the row to `data/follow-ups.md`.
6. Confirm: "Task #{N} added: {notes summary}. Due: {date or 'none'}."

### `followup list`

Show all open tasks grouped by urgency.

**Process:**
1. Run `node followup-cadence.mjs` and parse the JSON.
2. Display **standalone tasks** (from `standalone_tasks` key) in sections:
   - **Overdue** — `urgency === 'overdue'`
   - **Due soon** — `urgency === 'due-soon'`
   - **Open (no due date)** — `urgency === 'open'`
3. Display **app-linked follow-ups** (from `entries` key) as the existing cadence dashboard (unchanged format from Step 2 below).
4. Summary line: "{N} standalone tasks ({N} overdue), {N} app follow-ups ({N} overdue)"

### `followup done`

Mark one or more tasks as done.

**Usage:** `followup done {#}` or `followup done {#},{#},{#}`

**Process:**
1. For each `#`, find the row in `data/follow-ups.md` and change `Status` from `open` to `done`.
2. Do NOT delete the row — it stays for audit.
3. Confirm: "Marked #{N} as done." (or list if multiple)

If the user says "drop" instead of "done", set `Status` to `dropped` instead.
```

- [ ] **Step 2: Update the `## Inputs` section**

Replace the existing `## Inputs` section with:

```markdown
## Inputs

- `data/follow-ups.md` — Task and follow-up tracker (11-column schema: `# | App# | Type | Date | Due | Company | Role | Channel | Contact | Status | Notes`)
- `data/applications.md` — Application tracker (for app-linked rows)
- `reports/` — Evaluation reports (for context in drafts)
- `config/profile.yml` — User profile (name, identity)
- `cv.md` — CV for proof points in drafts
```

- [ ] **Step 3: Update Step 5 (Record Follow-ups)**

Replace the existing Step 5 section. The "create file if missing" block should use the new schema:

```markdown
## Step 5 — Record Follow-ups

After the user reviews and says they've sent a follow-up, record it:

1. If `data/follow-ups.md` doesn't exist, create it:
   ```markdown
   # Follow-Ups

   | # | App# | Type | Date | Due | Company | Role | Channel | Contact | Status | Notes |
   |---|------|------|------|-----|---------|------|---------|---------|--------|-------|
   ```

2. Append a row with:
   - `#` = next sequential number in the follow-ups table
   - `App#` = application number from tracker
   - `Type` = `followup`
   - `Date` = today's date
   - `Due` = blank (cadence engine handles timing for app-linked rows)
   - `Company` = company name
   - `Role` = role title
   - `Channel` = Email / LinkedIn / Other
   - `Contact` = who it was sent to
   - `Status` = `open`
   - `Notes` = brief note (e.g., "First follow-up, referenced portfolio project")

3. Optionally update the Notes column in `data/applications.md` with "Follow-up {N} sent {YYYY-MM-DD}"

**IMPORTANT:** Only record follow-ups the user confirms they actually sent. Never record a draft as sent.
```

- [ ] **Step 4: Verify mode file reads cleanly**

Open `modes/followup.md` and verify: verbs section comes first, existing cadence dashboard (Steps 1-6) follows, no duplicate sections.

- [ ] **Step 5: Commit**

```bash
git add modes/followup.md
git commit -m "feat: add add/list/done verbs to followup mode

followup add: create standalone tasks or app-linked follow-ups.
followup list: render standalone tasks + app cadence dashboard.
followup done: mark tasks as done/dropped. Existing cadence dashboard
behavior preserved as default when no verb is given."
```

---

### Task 5: Create `modes/debrief.md`

**Files:**
- Create: `modes/debrief.md`

- [ ] **Step 1: Write the mode file**

Create `modes/debrief.md`:

```markdown
# Mode: debrief — Interview Round Debrief

## Purpose

Synthesize a structured debrief from an interview round's transcript and notes. Produces: summary of discussion, open questions, self-critique, action items (with review gate), and next-round prep.

## Inputs

- `interview-prep/{company-slug}-{role-slug}/rounds/{NNN}-{YYYY-MM-DD}-{kind}.md` — Round file (transcript + Granola summary + notes)
- `interview-prep/{company-slug}-{role-slug}/debriefs/` — Prior debriefs for context
- `reports/` — Evaluation report for this company (via `app_ref` in round frontmatter)
- `cv.md` — Proof points for next-round prep
- `config/profile.yml` — Candidate identity

## Invocation

- `/career-ops debrief {company-slug}` — debrief the latest un-debriefed round
- `/career-ops debrief` — interactive, asks which company/round
- `/career-ops debrief {company-slug} --rounds 2,3` — debrief multiple rounds together

## Step 1 — Locate the Round File

Glob `interview-prep/{company-slug}-*/rounds/` for round files. Find the latest one that does NOT have a corresponding debrief in `debriefs/` (match by round number).

If no un-debriefed rounds exist, tell the user:
> "All rounds for {company} have been debriefed. Log a new round first by pasting a transcript."

If multiple un-debriefed rounds exist, ask which one (or accept `--rounds` flag for multi-round debrief).

## Step 2 — Gather Context

Read:
1. The target round file(s)
2. All prior debriefs for the same `{company-slug}-{role-slug}`
3. The evaluation report from `reports/` if `app_ref` is set in the round frontmatter (look up `reports/{app_ref}-*`)
4. `cv.md` for proof points relevant to next-round prep
5. `config/profile.yml` for candidate name

If the evaluation report doesn't exist, proceed without it — note: "No evaluation report found for this company. Debrief based on round content and CV only."

## Step 3 — Write the Debrief

Produce these 5 sections. Be specific, not generic. Reference actual content from the transcript.

### What Was Discussed
Neutral, factual summary of topics covered. Include: who asked what, key technical topics, behavioral questions, any company-specific context shared by interviewers. Aim for completeness — if the candidate needs to recall "what did we talk about?", this section is the answer.

### Open Questions
Two categories:
- **Unanswered by them:** Questions you asked that they deflected, deferred, or answered vaguely.
- **Unanswered by you:** Questions they asked that you didn't fully land, or where your answer could have been stronger.

### Self-Critique
Honest assessment. What went well, what didn't. Specific moments — "When asked about X, I rambled for 3 minutes instead of using a STAR structure" is useful. "I could have been more concise" is not.

If `interview-prep/story-bank.md` exists, reference relevant stories that should have been used but weren't.

### Action Items
Strictly actionable. Each item has:
- **What** — the task
- **Owner** — `me` or `them` (track-only if owner is them)
- **Due** — explicit date if known, otherwise blank

Examples:
- Send writing samples to Sarah by 2026-04-18 (owner: me)
- Research their eval infra before round 4 (owner: me)
- Wait for HM to confirm panel date (owner: them — track only)

### Next-Round Prep
Based on what was covered and what wasn't:
- Likely format for next round (technical deep-dive, behavioral, system design, panel)
- Topics likely to come up given gaps in this round
- Specific proof points from `cv.md` to prepare
- Questions to ask them next time (informed by Open Questions above)

## Step 4 — Review Gate for Action Items

Display action items as a numbered list:

```
Proposed action items:
1. Send writing samples to Sarah by 2026-04-18 (owner: me)
2. Research their eval infra before round 4 (owner: me)
3. Wait for HM to confirm panel date (owner: them — track only)

Which should I file? (reply: "all", "1,3", "none", or edit inline)
```

Wait for user response.

## Step 5 — File Approved Action Items

For each approved action item, invoke `followup add` (see `modes/followup.md`):

- `Type` = `debrief-action`
- `App#` = `app_ref` from round frontmatter (if present)
- `Company` = company from round frontmatter
- `Role` = role from round frontmatter
- `Contact` = interviewer name if action involves them
- `Due` = extracted date if present
- `Notes` = the action item text
- `Status` = `open`

For "owner: them" items, still file them as tasks — the user can use `followup list` to see what they're waiting on.

## Step 6 — Save Debrief File

Write to `interview-prep/{company-slug}-{role-slug}/debriefs/{NNN}-debrief.md`:

```markdown
---
company: {company}
role: {role}
round: {N}
date: {today}
source_round: rounds/{NNN}-{YYYY-MM-DD}-{kind}.md
---

## What Was Discussed
{content}

## Open Questions
{content}

## Self-Critique
{content}

## Action Items
{content — including which were filed to follow-ups.md}

## Next-Round Prep
{content}
```

## Step 7 — Summarize

One paragraph:
> "Debrief for {company} round {N} filed. {N} open questions flagged. {N} action items filed to follow-ups.md ({N} owned by you, {N} tracking theirs). Next-round prep covers {topics}."

## Logging a Round (Pre-Debrief)

When the user pastes a transcript or Granola summary, create the round file BEFORE running debrief:

1. Ask for (or infer): company, role, round number, date, kind, interviewers.
2. Create directories if needed: `interview-prep/{company-slug}-{role-slug}/rounds/`
3. Write `interview-prep/{company-slug}-{role-slug}/rounds/{NNN}-{YYYY-MM-DD}-{kind}.md` with frontmatter + pasted content in the appropriate section (Granola Summary, Transcript, My Notes).
4. Confirm: "Round {N} logged for {company}. Run debrief?"
```

- [ ] **Step 2: Add `debrief.md` to mode integrity test**

In `test-all.mjs`, Section 8 (Mode file integrity), add `'debrief.md'` to the `expectedModes` array:

```javascript
const expectedModes = [
  '_shared.md', '_profile.template.md', 'offer.md', 'pdf.md', 'scan.md',
  'batch.md', 'apply.md', 'auto-pipeline.md', 'contact.md', 'deep.md',
  'offers.md', 'pipeline.md', 'project.md', 'tracker.md', 'training.md',
  'debrief.md',
];
```

- [ ] **Step 3: Run tests**

```bash
node test-all.mjs --quick
```

Expected: All pass, including Section 8 now checking for `debrief.md`.

- [ ] **Step 4: Commit**

```bash
git add modes/debrief.md test-all.mjs
git commit -m "feat: add debrief mode for interview round synthesis

New modes/debrief.md: reads round transcripts, produces structured
debrief (discussed/questions/self-critique/action-items/next-prep),
files action items through review gate into follow-ups.md."
```

---

### Task 6: Update `CLAUDE.md`, `DATA_CONTRACT.md`, `FORK_NOTES.md`

**Files:**
- Modify: `CLAUDE.md` (skill modes table + main files table)
- Modify: `DATA_CONTRACT.md` (user layer paths)
- Modify: `FORK_NOTES.md` (local features log)

- [ ] **Step 1: Add `debrief` to CLAUDE.md skill modes table**

In the `### Skill Modes` table (around line 222), add two new rows:

After `| Preps for interview at specific company | \`interview-prep\` |`:
```
| Debriefs after an interview round | `debrief` |
```

After `| Asks about follow-ups or application cadence | \`followup\` |`:
```
| Adds/lists/completes tasks or obligations | `followup add`/`list`/`done` |
```

- [ ] **Step 2: Add interview round/debrief paths to CLAUDE.md main files table**

In the `### Main Files` table, add:

```
| `interview-prep/{company}-{role}/rounds/` | Interview transcripts + Granola summaries per round |
| `interview-prep/{company}-{role}/debriefs/` | Structured debriefs with action items |
```

- [ ] **Step 3: Update DATA_CONTRACT.md user layer**

Add to the User Layer table:

```
| `interview-prep/*/rounds/*` | Your interview transcripts and Granola summaries |
| `interview-prep/*/debriefs/*` | Your structured interview debriefs |
```

- [ ] **Step 4: Add entry to FORK_NOTES.md local features log**

Add a new row at the top of the Local Features Log table (date and SHA to be filled at merge time):

```
| 2026-04-13 | `TBD` | Correspondence tracker: interview archive + debrief + task tracker | `data/follow-ups.md` extended to 11-column schema (Type/Due/Status). New `modes/debrief.md`. `modes/followup.md` gains add/list/done verbs. `followup-cadence.mjs` emits `standalone_tasks`. Spec: `docs/superpowers/specs/2026-04-13-correspondence-tracker-design.md`. |
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md DATA_CONTRACT.md FORK_NOTES.md
git commit -m "docs: register correspondence tracker in CLAUDE.md, DATA_CONTRACT.md, FORK_NOTES.md

Add debrief mode and followup verbs to skill modes table. Add
rounds/ and debriefs/ to data contract user layer. Log as local
feature in fork notes."
```

---

### Task 7: Run full test suite and verify

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

```bash
node test-all.mjs
```

Expected: All sections pass (1-12). No regressions. The only acceptable warnings are pre-existing ones (e.g., `cv-sync-check.mjs` without cv.md, `verify-pipeline.mjs` data quality issues).

- [ ] **Step 2: Verify cadence script JSON output**

```bash
node followup-cadence.mjs | python3 -m json.tool | head -50
```

Expected: Valid JSON with `metadata`, `entries`, `standalone_tasks`, `cadenceConfig`.

- [ ] **Step 3: Verify cadence script summary mode**

```bash
node followup-cadence.mjs --summary
```

Expected: Human-readable dashboard renders without errors.

- [ ] **Step 4: Spot-check the data file**

```bash
head -5 data/follow-ups.md
```

Expected: New 11-column header with `# | App# | Type | Date | Due | ...`

- [ ] **Step 5: Review diff**

```bash
git diff main --stat
```

Expected changes:
- `data/follow-ups.md` — modified
- `followup-cadence.mjs` — modified
- `modes/followup.md` — modified
- `modes/debrief.md` — new
- `test-all.mjs` — modified
- `CLAUDE.md` — modified
- `DATA_CONTRACT.md` — modified
- `FORK_NOTES.md` — modified

No unexpected files.

- [ ] **Step 6: Commit verification (if any fixups needed)**

If any test failed and you fixed it, commit the fix:

```bash
git add -A
git commit -m "fix: address test failures from correspondence tracker implementation"
```
