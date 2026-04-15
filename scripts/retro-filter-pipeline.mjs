#!/usr/bin/env node

/**
 * retro-filter-pipeline.mjs — Retro-apply filters to data/pipeline.md
 *
 * Re-fetches all tracked-company ATS APIs, builds a URL → location map,
 * then rewrites data/pipeline.md to keep only entries whose URL matches
 * a job that passes the current title + location filters in portals.yml.
 *
 * Use this after tweaking filter config to prune already-added entries
 * without rescanning history (scan.mjs dedup against scan-history.tsv
 * prevents a plain re-scan from re-adding them).
 *
 * Entries whose URL can't be found in any tracked company's current job
 * list are preserved by default (they might be hand-added or from an
 * aggregator). Pass --drop-unknown to prune them too.
 *
 * Pipeline.md is backed up to data/pipeline.md.bak-{timestamp} before
 * rewriting.
 *
 * Usage:
 *   node scripts/retro-filter-pipeline.mjs               # report + rewrite
 *   node scripts/retro-filter-pipeline.mjs --dry-run     # report only
 *   node scripts/retro-filter-pipeline.mjs --drop-unknown
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

import {
  detectApi,
  PARSERS,
  fetchJson,
  buildTitleFilter,
  buildLocationFilter,
} from '../scan.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORTALS_PATH = join(ROOT, 'portals.yml');
const PIPELINE_PATH = join(ROOT, 'data/pipeline.md');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const dropUnknown = args.includes('--drop-unknown');

// ── Fetch all jobs from tracked companies ───────────────────────────

async function fetchAllJobs(config) {
  const companies = (config.tracked_companies || [])
    .filter(c => c.enabled !== false)
    .map(c => ({ ...c, _api: detectApi(c) }))
    .filter(c => c._api !== null);

  const CONCURRENCY = 10;
  const results = [];
  const errors = [];

  async function worker(company) {
    const { type, url } = company._api;
    try {
      const json = await fetchJson(url);
      const jobs = PARSERS[type](json, company.name);
      for (const j of jobs) results.push(j);
    } catch (err) {
      errors.push({ company: company.name, error: err.message });
    }
  }

  // Simple pool
  let idx = 0;
  const next = async () => {
    while (idx < companies.length) {
      const i = idx++;
      await worker(companies[i]);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, next));

  return { jobs: results, errors };
}

// ── Pipeline parsing / rewriting ────────────────────────────────────

function parsePipelineEntries(text) {
  const lines = text.split('\n');
  const parsed = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^- \[( |x)\] (https?:\S+)(?:\s+\|\s+([^|]+?)(?:\s+\|\s+(.*))?)?$/);
    if (match) {
      parsed.push({
        lineIdx: i,
        raw: line,
        checked: match[1] === 'x',
        url: match[2],
        company: (match[3] || '').trim(),
        rest: (match[4] || '').trim(),
      });
    }
  }
  return { lines, entries: parsed };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(PORTALS_PATH)) {
    console.error('Error: portals.yml not found.');
    process.exit(1);
  }
  if (!existsSync(PIPELINE_PATH)) {
    console.error('Error: data/pipeline.md not found.');
    process.exit(1);
  }

  const config = yaml.load(readFileSync(PORTALS_PATH, 'utf-8'));
  const titleFilter = buildTitleFilter(config.title_filter);
  const locationFilter = buildLocationFilter(config.location_filter);

  console.log('Fetching tracked-company jobs to build URL → location map...');
  const { jobs, errors } = await fetchAllJobs(config);
  console.log(`Fetched ${jobs.length} jobs from ${config.tracked_companies.length} companies (${errors.length} errors)`);

  // Build URL → {title, location, company} map
  const jobByUrl = new Map();
  for (const j of jobs) {
    if (j.url) jobByUrl.set(j.url, j);
  }

  const pipelineText = readFileSync(PIPELINE_PATH, 'utf-8');
  const { lines, entries } = parsePipelineEntries(pipelineText);
  console.log(`Pipeline has ${entries.length} checkbox entries total.`);

  const keepIdx = new Set();
  const dropped = { pendingRemoved: 0, checkedPreserved: 0, unknownKept: 0, unknownDropped: 0, titleFail: 0, locationFail: 0 };
  const perCompany = new Map();

  for (const e of entries) {
    if (e.checked) {
      // Never drop already-processed (- [x]) entries
      keepIdx.add(e.lineIdx);
      dropped.checkedPreserved++;
      continue;
    }
    const lookup = jobByUrl.get(e.url);
    const companyKey = (e.company || lookup?.company || 'unknown').trim();
    if (!perCompany.has(companyKey)) perCompany.set(companyKey, { total: 0, kept: 0 });
    perCompany.get(companyKey).total++;

    if (!lookup) {
      if (dropUnknown) {
        dropped.unknownDropped++;
        dropped.pendingRemoved++;
      } else {
        keepIdx.add(e.lineIdx);
        perCompany.get(companyKey).kept++;
        dropped.unknownKept++;
      }
      continue;
    }
    if (!titleFilter(lookup.title)) {
      dropped.titleFail++;
      dropped.pendingRemoved++;
      continue;
    }
    if (!locationFilter(lookup.location)) {
      dropped.locationFail++;
      dropped.pendingRemoved++;
      continue;
    }
    keepIdx.add(e.lineIdx);
    perCompany.get(companyKey).kept++;
  }

  // Report
  console.log('\n━━━ Retro-filter report ━━━');
  console.log(`Entries kept:                     ${keepIdx.size}`);
  console.log(`  — already-processed (- [x]):    ${dropped.checkedPreserved}`);
  console.log(`  — pending survivors:            ${keepIdx.size - dropped.checkedPreserved}`);
  console.log(`Entries dropped:                  ${dropped.pendingRemoved}`);
  console.log(`  — title filter fail:            ${dropped.titleFail}`);
  console.log(`  — location filter fail:         ${dropped.locationFail}`);
  console.log(`  — unknown (dropped):            ${dropped.unknownDropped}`);
  console.log(`Unknown-but-kept (pass-through):  ${dropped.unknownKept}`);

  console.log('\n━━━ Per-company (known tracked) US-survivor breakdown ━━━');
  const rows = [...perCompany.entries()]
    .sort((a, b) => b[1].total - a[1].total);
  const zeroSurvivors = [];
  for (const [company, counts] of rows) {
    const ratio = counts.total > 0 ? (counts.kept / counts.total) : 0;
    const flag = counts.kept === 0 && counts.total >= 3 ? '  ⚠ ZERO US' : '';
    console.log(`  ${company.padEnd(32)} ${String(counts.kept).padStart(4)} / ${String(counts.total).padStart(4)}  (${(ratio * 100).toFixed(0)}%)${flag}`);
    if (counts.kept === 0 && counts.total >= 3) zeroSurvivors.push(company);
  }

  if (zeroSurvivors.length > 0) {
    console.log(`\n⚠ ${zeroSurvivors.length} tracked companies with 3+ entries and 0 US survivors — consider disabling in portals.yml:`);
    for (const c of zeroSurvivors) console.log(`  - ${c}`);
  }

  if (dryRun) {
    console.log('\n(dry run — pipeline.md unchanged)');
    return;
  }

  // Backup
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${PIPELINE_PATH}.bak-${ts}`;
  writeFileSync(backupPath, pipelineText);
  console.log(`\nBacked up pipeline.md → ${backupPath}`);

  // Rewrite: keep lines that are NOT checkbox entries, or that are in keepIdx
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    const isEntry = /^- \[( |x)\] https?:/.test(lines[i]);
    if (!isEntry || keepIdx.has(i)) newLines.push(lines[i]);
  }
  writeFileSync(PIPELINE_PATH, newLines.join('\n'));
  console.log(`Rewrote ${PIPELINE_PATH} — ${keepIdx.size} entries retained.`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
