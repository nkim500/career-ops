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
