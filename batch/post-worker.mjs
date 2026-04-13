#!/usr/bin/env node
// Post-worker fallback: after a batch worker exits 0, ensure the tracker TSV
// exists and extract the score. Handles the case where the worker (e.g., a
// Sonnet worker on a long prompt) skipped Step 4/5 of the prompt.
//
// Usage: node batch/post-worker.mjs <id> <report_num> <date> <url>
// Reads: reports/{report_num}-*-{date}.md  and  data/applications.md
// Writes: batch/tracker-additions/{id}.tsv  (only if it doesn't already exist)
// Stdout: a single line with the extracted score (e.g. "4.25") or "-" if unknown.

import fs from "node:fs";
import path from "node:path";

const [, , id, reportNum, date, url] = process.argv;
if (!id || !reportNum || !date) {
  console.error("usage: post-worker.mjs <id> <report_num> <date> <url>");
  process.exit(2);
}

const PROJECT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const reportsDir = path.join(PROJECT_DIR, "reports");
const trackerPath = path.join(PROJECT_DIR, "batch", "tracker-additions", `${id}.tsv`);
const applicationsPath = path.join(PROJECT_DIR, "data", "applications.md");

// Find the report file matching {reportNum}-*-{date}.md
const reportFile = fs.readdirSync(reportsDir).find(f =>
  f.startsWith(`${reportNum}-`) && f.endsWith(`-${date}.md`)
);

if (!reportFile) {
  // No report written — worker failed to produce anything parseable.
  console.log("-");
  process.exit(0);
}

const reportPath = path.join(reportsDir, reportFile);
const md = fs.readFileSync(reportPath, "utf8");

// Extract header fields.
const h1 = md.match(/^#\s*Evaluation:\s*(.+?)\s+[—-]\s+(.+?)\s*$/m);
const scoreMatch = md.match(/^\*\*Score:\*\*\s*([0-9.]+)\s*\/\s*5/mi);
const legitMatch = md.match(/^\*\*Legitimacy:\*\*\s*(.+?)\s*$/mi);

const company = h1 ? h1[1].trim() : "Unknown";
const role = h1 ? h1[2].trim() : "Unknown";
const score = scoreMatch ? scoreMatch[1] : null;
const legit = legitMatch ? legitMatch[1].trim() : "";

if (score) {
  console.log(score);
} else {
  console.log("-");
}

// If tracker TSV already exists, don't overwrite it — the worker did its job.
if (fs.existsSync(trackerPath)) process.exit(0);

// Compute next_num by reading applications.md and finding the max existing #.
let nextNum = 1;
try {
  const apps = fs.readFileSync(applicationsPath, "utf8");
  const nums = [...apps.matchAll(/^\|\s*(\d+)\s*\|/gm)].map(m => parseInt(m[1], 10));
  // Also look at any already-pending tracker-additions so parallel workers
  // don't collide on the same next_num.
  const pendingDir = path.join(PROJECT_DIR, "batch", "tracker-additions");
  if (fs.existsSync(pendingDir)) {
    for (const f of fs.readdirSync(pendingDir)) {
      if (!f.endsWith(".tsv")) continue;
      try {
        const line = fs.readFileSync(path.join(pendingDir, f), "utf8").split("\n")[0];
        const firstCol = line.split("\t")[0];
        const n = parseInt(firstCol, 10);
        if (Number.isFinite(n)) nums.push(n);
      } catch {}
    }
  }
  if (nums.length) nextNum = Math.max(...nums) + 1;
} catch {
  // applications.md may not exist yet — start at 1.
}

const scoreStr = score ? `${score}/5` : "N/A";
const reportLink = `[${reportNum}](reports/${reportFile})`;
const notes = `Eval-only batch run · ${legit || "legit n/a"}`;

const tsvLine = [
  nextNum,
  date,
  company,
  role,
  "Evaluated",
  scoreStr,
  "❌",
  reportLink,
  notes,
].join("\t");

fs.mkdirSync(path.dirname(trackerPath), { recursive: true });
fs.writeFileSync(trackerPath, tsvLine + "\n");
