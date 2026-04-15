#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseYC, parseYCLastActive, detectApi, PARSERS } from '../scan.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, 'fixtures/waas-software-engineer.html');

let passed = 0;
let failed = 0;

function assert(label, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
  }
}

// ── parseYCLastActive ───────────────────────────────────────────────

console.log('parseYCLastActive');

const now = new Date('2026-04-15T00:00:00Z');
assert('9 days ago → 2026-04-06', parseYCLastActive('9 days ago', now) === '2026-04-06');
assert('1 day ago → 2026-04-14', parseYCLastActive('1 day ago', now) === '2026-04-14');
assert('2 weeks ago → 2026-04-01', parseYCLastActive('2 weeks ago', now) === '2026-04-01');
assert('1 month ago → 2026-03-16', parseYCLastActive('1 month ago', now) === '2026-03-16');
assert('empty string → empty', parseYCLastActive('') === '');
assert('null → empty', parseYCLastActive(null) === '');
assert('garbage → empty', parseYCLastActive('just now') === '');

// ── detectApi for YC URLs ───────────────────────────────────────────

console.log('\ndetectApi (YC URLs)');

const ycBare = detectApi({ careers_url: 'https://www.workatastartup.com/jobs' });
assert('bare /jobs → type yc', ycBare?.type === 'yc');
assert('bare /jobs → preserves URL', ycBare?.url === 'https://www.workatastartup.com/jobs');

const ycRole = detectApi({ careers_url: 'https://www.workatastartup.com/jobs/l/software-engineer' });
assert('role URL → type yc', ycRole?.type === 'yc');
assert('role URL → preserves URL', ycRole?.url === 'https://www.workatastartup.com/jobs/l/software-engineer');

const notYC = detectApi({ careers_url: 'https://example.com/jobs' });
assert('non-YC URL → null', notYC === null);

// ── parseYC against real HTML fixture ───────────────────────────────

console.log('\nparseYC (real HTML fixture)');

const html = readFileSync(FIXTURE, 'utf-8');
const jobs = parseYC(html, 'ignored-name');

assert('parses fixture into non-empty array', Array.isArray(jobs) && jobs.length > 0, `got ${jobs?.length} jobs`);
assert('fixture contains expected ~29 jobs', jobs.length >= 20 && jobs.length <= 40, `got ${jobs.length}`);

const first = jobs[0];
assert('first job has title', typeof first?.title === 'string' && first.title.length > 0);
assert('first job has url', typeof first?.url === 'string' && first.url.startsWith('https://www.workatastartup.com/jobs/'));
assert('first job has company from data (not passed arg)', first?.company && first.company !== 'ignored-name');
assert('first job has location', typeof first?.location === 'string');
assert('first job has datePosted (ISO or empty)', first?.datePosted === '' || /^\d{4}-\d{2}-\d{2}$/.test(first?.datePosted));

const withLocation = jobs.filter(j => j.location && j.location.length > 0);
assert('most jobs have a location', withLocation.length >= jobs.length * 0.5, `${withLocation.length}/${jobs.length} had location`);

// Verify no two jobs have the same URL (dedup sanity)
const urls = new Set(jobs.map(j => j.url));
assert('all jobs have distinct URLs', urls.size === jobs.length, `${urls.size}/${jobs.length} unique`);

// Verify company names look real (non-empty, not YC-pseudo)
const companies = [...new Set(jobs.map(j => j.company))];
assert('parser extracts >1 distinct company from a role page', companies.length > 1, `got ${companies.length}`);

// PARSERS registry wiring
assert('PARSERS.yc is registered', PARSERS.yc === parseYC);

// ── parseYC edge cases ──────────────────────────────────────────────

console.log('\nparseYC edge cases');

assert('missing data-page → empty array', parseYC('<html>no data page</html>').length === 0);
assert('malformed JSON in data-page → empty array', parseYC('<html data-page="not&quot;json">').length === 0);
assert('valid data-page with no jobs → empty array',
  parseYC('<div data-page="{&quot;props&quot;:{}}"></div>').length === 0);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
