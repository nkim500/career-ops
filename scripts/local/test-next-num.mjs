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
