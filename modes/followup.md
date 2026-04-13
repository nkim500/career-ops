# Mode: followup -- Follow-up Cadence Tracker

## Purpose

Track follow-up cadence for active applications. Flag overdue follow-ups, extract contacts from notes, and generate tailored follow-up email/LinkedIn drafts using report context.

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

## Inputs

- `data/follow-ups.md` — Task and follow-up tracker (11-column schema: `# | App# | Type | Date | Due | Company | Role | Channel | Contact | Status | Notes`)
- `data/applications.md` — Application tracker (for app-linked rows)
- `reports/` — Evaluation reports (for context in drafts)
- `config/profile.yml` — User profile (name, identity)
- `cv.md` — CV for proof points in drafts

## Step 1 — Run Cadence Script

Execute:

```bash
node followup-cadence.mjs
```

Parse the JSON output. It contains:

| Key | Contents |
|-----|----------|
| `metadata` | Analysis date, total tracked, actionable count, overdue/urgent/cold/waiting counts |
| `entries` | Per-application: company, role, status, days since application, follow-up count, urgency, next follow-up date, extracted contacts, report path |
| `cadenceConfig` | Cadence rules (applied: 7 days, responded: 3 days, interview: 1 day) |

If no actionable entries, tell the user:
> "No active applications to follow up on. Apply to some roles first with `/career-ops` and come back when they're aging."

## Step 2 — Display Dashboard

Show a cadence dashboard sorted by urgency (urgent > overdue > waiting > cold):

```
Follow-up Cadence Dashboard — {date}
{N} applications tracked, {N} actionable

| # | Company | Role | Status | Days | Follow-ups | Next | Urgency | Contact |
```

Use visual indicators:
- **URGENT** — respond within 24 hours (company replied)
- **OVERDUE** — follow-up is past due
- **waiting (X days)** — on track, follow-up scheduled
- **COLD** — 2+ follow-ups sent, suggest closing

## Step 3 — Generate Follow-up Drafts

For each **overdue** or **urgent** entry only:

1. Read the linked report (`reportPath` from JSON) for company context
2. Read `cv.md` for proof points
3. Read `config/profile.yml` for candidate name and identity

### Email Follow-up Framework (first follow-up, followupCount == 0)

Generate a 3-4 sentence email:

1. **Sentence 1:** Reference the specific role + when you applied. Be specific — mention the company name and role title.
2. **Sentence 2:** One concrete value-add from the report's Block B match or a proof point from cv.md. Quantify if possible.
3. **Sentence 3:** Soft ask + availability. Offer a specific time window ("this week" or "next Tuesday").
4. **Sentence 4 (optional):** Brief mention of a relevant recent project or achievement.

**Rules:**
- Professional but warm, NOT desperate
- **NEVER** use "just checking in", "just following up", "touching base", or "circling back"
- Lead with value, not with the ask
- Reference something specific to THAT company (from report Block A)
- Keep under 150 words
- Include a subject line
- Use the candidate's name from `config/profile.yml`

**Example tone:**
> Subject: Re: Senior PHP/Laravel Developer — IxDF
>
> Hi [contact name or "team"],
>
> I submitted my application for the Senior PHP/Laravel Developer role on April 7th. I wanted to share that my production Laravel app (Barbeiro.app — 120 models, 315 API endpoints, full test suite) closely mirrors the TDD-driven culture described in the posting.
>
> I'd love to discuss how my 15 years of PHP experience and hands-on AI tooling workflow could contribute to IxDF's platform. Would any time this week work for a brief conversation?
>
> Best,
> [Name]

### LinkedIn Follow-up (if no email contact found)

Reuse the contacto framework: 3 sentences, 300 character max.
- Hook specific to company → proof point → soft ask
- Suggest the user run `/career-ops contacto {company}` to find the right person first

### Second Follow-up (followupCount == 1)

Shorter than first (2-3 sentences). Take a **new angle**:
- Share a relevant insight, article, or project update
- Don't repeat the first follow-up's content
- Still reference the role specifically

### Cold Application (followupCount >= 2)

Do NOT generate another follow-up. Instead suggest:
> "This application has had {N} follow-ups with no response. Consider:
> - Updating status to `Discarded` if the role seems filled
> - Trying a different contact via `/career-ops contacto`
> - Keeping in `Applied` status but deprioritizing"

## Step 4 — Present Drafts

For each draft, show:

```
## Follow-up: {Company} — {Role} (#{num})

**To:** {email or "No contact found — run `/career-ops contacto` first"}
**Subject:** {subject line}
**Days since application:** {N}
**Follow-ups sent:** {N}
**Channel:** Email / LinkedIn

{draft text}
```

## Step 5 — Record Follow-ups

After the user reviews and says they've sent a follow-up, record it:

1. If `data/follow-ups.md` doesn't exist, create it:
   ```markdown
   # Follow-up History

   | # | App# | Type | Date | Due | Company | Role | Channel | Contact | Status | Notes |
   |---|------|------|------|-----|---------|------|---------|---------|--------|-------|
   ```

2. Append a row with:
   - `#` = next sequential number in the follow-ups table
   - `App#` = application number from tracker
   - `Type` = `followup`
   - `Date` = today's date
   - `Due` = blank
   - `Company` = company name
   - `Role` = role title
   - `Channel` = Email / LinkedIn / Other
   - `Contact` = who it was sent to
   - `Status` = `open`
   - `Notes` = brief note (e.g., "First follow-up, referenced Barbeiro.app")

3. Optionally update the Notes column in `data/applications.md` with "Follow-up {N} sent {YYYY-MM-DD}"

**IMPORTANT:** Only record follow-ups the user confirms they actually sent. Never record a draft as sent.

## Step 6 — Summary

After showing all drafts, summarize:

> **Follow-up Dashboard** ({date})
> - {N} applications being tracked
> - {N} overdue — drafts generated above
> - {N} urgent — respond today
> - {N} waiting — next follow-up dates shown
> - {N} cold — consider closing
>
> Review the drafts above and tell me which ones you've sent so I can record them.

## Cadence Rules Reference

| Status | First follow-up | Subsequent | Max attempts |
|--------|----------------|------------|-------------|
| Applied | 7 days after application | Every 7 days | 2 (then mark cold) |
| Responded | 1 day (urgent reply) | Every 3 days | No limit |
| Interview | 1 day after (thank-you) | Every 3 days | No limit |

These defaults can be overridden via `node followup-cadence.mjs --applied-days N`.
