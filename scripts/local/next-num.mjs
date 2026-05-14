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
import { fileURLToPath, pathToFileURL } from 'url';

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

const isCLI = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
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
