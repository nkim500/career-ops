#!/usr/bin/env node
/**
 * followup-cadence.mjs — Follow-up Cadence Tracker for career-ops
 *
 * Parses applications.md + follow-ups.md, calculates follow-up cadence
 * for active applications, extracts contacts, and flags overdue entries.
 *
 * Run: node followup-cadence.mjs             (JSON to stdout)
 *      node followup-cadence.mjs --summary   (human-readable dashboard)
 *      node followup-cadence.mjs --overdue-only
 *      node followup-cadence.mjs --applied-days 10
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const CAREER_OPS = dirname(fileURLToPath(import.meta.url));
const APPS_FILE = existsSync(join(CAREER_OPS, 'data/applications.md'))
  ? join(CAREER_OPS, 'data/applications.md')
  : join(CAREER_OPS, 'applications.md');
const FOLLOWUPS_FILE = join(CAREER_OPS, 'data/follow-ups.md');


// --- CLI args ---
const args = process.argv.slice(2);
const summaryMode = args.includes('--summary');
const overdueOnly = args.includes('--overdue-only');
const appliedDaysIdx = args.indexOf('--applied-days');
const APPLIED_FIRST = appliedDaysIdx !== -1 ? parseInt(args[appliedDaysIdx + 1]) || 7 : 7;

// --- Cadence config ---
const CADENCE = {
  applied_first: APPLIED_FIRST,
  applied_subsequent: 7,
  applied_max_followups: 2,
  responded_initial: 1,
  responded_subsequent: 3,
  interview_thankyou: 1,
};

// --- Status normalization (mirrors verify-pipeline.mjs) ---
const ALIASES = {
  'evaluada': 'evaluated', 'condicional': 'evaluated', 'hold': 'evaluated',
  'evaluar': 'evaluated', 'verificar': 'evaluated',
  'aplicado': 'applied', 'enviada': 'applied', 'aplicada': 'applied',
  'applied': 'applied', 'sent': 'applied',
  'respondido': 'responded',
  'entrevista': 'interview',
  'oferta': 'offer',
  'rechazado': 'rejected', 'rechazada': 'rejected',
  'descartado': 'discarded', 'descartada': 'discarded',
  'cerrada': 'discarded', 'cancelada': 'discarded',
  'no aplicar': 'skip', 'no_aplicar': 'skip', 'monitor': 'skip', 'geo blocker': 'skip',
};

const ACTIONABLE_STATUSES = ['applied', 'responded', 'interview'];

function normalizeStatus(raw) {
  const clean = raw.replace(/\*\*/g, '').trim().toLowerCase()
    .replace(/\s+\d{4}-\d{2}-\d{2}.*$/, '').trim();
  return ALIASES[clean] || clean;
}

// --- Date helpers ---
function today() {
  return new Date(new Date().toISOString().split('T')[0]);
}

function parseDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return null;
  return new Date(dateStr.trim());
}

function daysBetween(d1, d2) {
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().split('T')[0];
}

// --- Parse applications.md ---
function parseTracker() {
  if (!existsSync(APPS_FILE)) return [];
  const content = readFileSync(APPS_FILE, 'utf-8');
  const entries = [];
  for (const line of content.split('\n')) {
    if (!line.startsWith('|')) continue;
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 9) continue;
    const num = parseInt(parts[1]);
    if (isNaN(num)) continue;
    entries.push({
      num, date: parts[2], company: parts[3], role: parts[4],
      score: parts[5], status: parts[6], pdf: parts[7], report: parts[8],
      notes: parts[9] || '',
    });
  }
  return entries;
}

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
    const appNumRaw = parts[2].replace(/-/g, '').trim();
    entries.push({
      num,
      appNum: appNumRaw ? parseInt(appNumRaw) : null,
      type: parts[3] || 'followup',
      date: parts[4],
      due: parts[5] && parts[5] !== '-' ? parts[5] : null,
      company: parts[6],
      role: parts[7],
      channel: parts[8] && parts[8] !== '-' ? parts[8] : null,
      contact: parts[9] && parts[9] !== '-' ? parts[9] : null,
      status: parts[10] || 'open',
      notes: parts[11] || '',
    });
  }
  return entries;
}

// --- Extract contacts from notes ---
function extractContacts(notes) {
  if (!notes) return [];
  const contacts = [];
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const emails = notes.match(emailRegex) || [];
  for (const email of emails) {
    // Try to extract name before email: "Emailed Name at" or "contact: Name"
    let name = null;
    const beforeEmail = notes.substring(0, notes.indexOf(email));
    const nameMatch = beforeEmail.match(/(?:Emailed|emailed|contact[:\s]+|to\s+)([A-Z][a-z]+ ?[A-Z]?[a-z]*)\s*(?:at|@|$)/i);
    if (nameMatch) name = nameMatch[1].trim();
    contacts.push({ email, name });
  }
  return contacts;
}

// --- Resolve report path ---
function resolveReportPath(reportField) {
  const match = reportField.match(/\]\(([^)]+)\)/);
  if (!match) return null;
  const fullPath = join(CAREER_OPS, match[1]);
  return existsSync(fullPath) ? match[1] : null;
}

// --- Compute urgency ---
function computeUrgency(status, daysSinceApp, daysSinceLastFollowup, followupCount) {
  if (status === 'applied') {
    if (followupCount >= CADENCE.applied_max_followups) return 'cold';
    if (followupCount === 0 && daysSinceApp >= CADENCE.applied_first) return 'overdue';
    if (followupCount > 0 && daysSinceLastFollowup !== null && daysSinceLastFollowup >= CADENCE.applied_subsequent) return 'overdue';
    return 'waiting';
  }
  if (status === 'responded') {
    if (daysSinceApp < CADENCE.responded_initial) return 'urgent';
    if (daysSinceApp >= CADENCE.responded_subsequent) return 'overdue';
    return 'waiting';
  }
  if (status === 'interview') {
    if (daysSinceApp >= CADENCE.interview_thankyou) return 'overdue';
    return 'waiting';
  }
  return 'waiting';
}

// --- Compute next follow-up date ---
function computeNextFollowupDate(status, appDate, lastFollowupDate, followupCount) {
  if (status === 'applied') {
    if (followupCount >= CADENCE.applied_max_followups) return null; // cold
    if (followupCount === 0) return addDays(parseDate(appDate), CADENCE.applied_first);
    if (lastFollowupDate) return addDays(parseDate(lastFollowupDate), CADENCE.applied_subsequent);
    return addDays(parseDate(appDate), CADENCE.applied_first);
  }
  if (status === 'responded') {
    if (lastFollowupDate) return addDays(parseDate(lastFollowupDate), CADENCE.responded_subsequent);
    return addDays(parseDate(appDate), CADENCE.responded_subsequent);
  }
  if (status === 'interview') {
    return addDays(parseDate(appDate), CADENCE.interview_thankyou);
  }
  return null;
}

// --- Main analysis ---
function analyze() {
  const apps = parseTracker();
  const allFollowups = parseFollowups();

  if (apps.length === 0 && allFollowups.length === 0) {
    return {
      metadata: { analysisDate: today().toISOString().split('T')[0], totalTracked: 0, actionable: 0, overdue: 0, urgent: 0, cold: 0, waiting: 0, standaloneTasks: 0, standaloneOverdue: 0 },
      entries: [],
      standalone_tasks: [],
      cadenceConfig: CADENCE,
    };
  }

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

// --- Summary mode ---
function printSummary(result) {
  if (result.error) {
    console.log(`\n${result.error}\n`);
    return;
  }

  const { metadata, entries } = result;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  Follow-up Cadence Dashboard — ${metadata.analysisDate}`);
  console.log(`  ${metadata.totalTracked} total applications, ${metadata.actionable} actionable`);
  console.log(`${'='.repeat(70)}\n`);

  if (entries.length === 0) {
    console.log('  No active applications to track. Apply to some roles first.\n');
    return;
  }

  // Status summary
  const urgencyIcon = { urgent: 'URGENT', overdue: 'OVERDUE', waiting: 'waiting', cold: 'COLD' };
  console.log(`  ${metadata.urgent} urgent | ${metadata.overdue} overdue | ${metadata.waiting} waiting | ${metadata.cold} cold\n`);

  // Table header
  console.log('  ' + '#'.padEnd(5) + 'Company'.padEnd(16) + 'Status'.padEnd(12) + 'Days'.padEnd(6) + 'F/U'.padEnd(5) + 'Next'.padEnd(13) + 'Urgency'.padEnd(10) + 'Contact');
  console.log('  ' + '-'.repeat(80));

  for (const e of entries) {
    const urgLabel = urgencyIcon[e.urgency] || e.urgency;
    const nextStr = e.nextFollowupDate || '-';
    const contactStr = e.contacts.length > 0 ? e.contacts[0].email : '-';
    console.log(
      '  ' +
      String(e.num).padEnd(5) +
      e.company.substring(0, 15).padEnd(16) +
      e.status.padEnd(12) +
      String(e.daysSinceApplication).padEnd(6) +
      String(e.followupCount).padEnd(5) +
      nextStr.padEnd(13) +
      urgLabel.padEnd(10) +
      contactStr
    );
  }

  console.log('');
}

// --- Run ---
const result = analyze();

if (summaryMode) {
  printSummary(result);
} else {
  console.log(JSON.stringify(result, null, 2));
}

if (result.error) process.exit(1);
