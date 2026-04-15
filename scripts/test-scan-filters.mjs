#!/usr/bin/env node

import { buildLocationFilter } from '../scan.mjs';

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.log(`  ❌ ${label} — got ${actual}, expected ${expected}`);
  }
}

console.log('buildLocationFilter');

// Semantics:
//   1. blank/null/undefined location → pass (missing data, don't silently drop)
//   2. matches any deny keyword → fail (even if also matches allow)
//   3. matches any allow keyword → pass
//   4. otherwise → fail (strict allow-list)
// Rationale: user wants strict Bay Area + explicit Remote-US phrases.
const cfg = {
  allow: [
    'San Francisco',
    'South San Francisco',
    'Mountain View',
    'Palo Alto',
    'East Palo Alto',
    'Menlo Park',
    'Redwood City',
    'Cupertino',
    'Sunnyvale',
    'Santa Clara',
    'San Jose',
    'Milpitas',
    'Campbell',
    'Fremont',
    'Hayward',
    'Oakland',
    'Berkeley',
    'Emeryville',
    'Alameda',
    'Foster City',
    'San Mateo',
    'Burlingame',
    'Bay Area',
    'Remote - United States',
    'Remote, United States',
    'Remote - USA',
    'Remote, USA',
    'Remote - US',
    'Remote, US',
    'Remote (US)',
    'Remote (United States)',
    'US Remote',
    'USA Remote',
    'Remote US',
    'Remote USA',
  ],
  deny: [
    'London',
    'Paris',
    'Berlin',
    'Munich',
    'Amsterdam',
    'Dublin',
    'Zurich',
    'Lausanne',
    'Lisbon',
    'Barcelona',
    'Madrid',
    'Stockholm',
    'Warsaw',
    'Tallinn',
    'Vilnius',
    'Bucharest',
    'Sofia',
    'Prague',
    'Bangalore',
    'Bengaluru',
    'India',
    'Hyderabad',
    'Mumbai',
    'Delhi',
    'Pune',
    'Tokyo',
    'Singapore',
    'Sydney',
    'Hong Kong',
    'Seoul',
    'Manila',
    'Jakarta',
    'Brazil',
    'Mexico City',
    'Buenos Aires',
    'Cambridge, England',
    'EMEA',
    'APAC',
    'LATAM',
    'EU)',
    'Remote (EU',
    'Remote - EMEA',
    'Remote, EMEA',
  ],
};
const filter = buildLocationFilter(cfg);

// — allowed (Bay Area) —
assert('allows San Francisco, CA', filter('San Francisco, CA'), true);
assert('allows San Francisco Bay Area', filter('San Francisco Bay Area'), true);
assert('allows Mountain View, CA', filter('Mountain View, CA'), true);
assert('allows Cupertino, CA', filter('Cupertino, CA'), true);
assert('allows Palo Alto', filter('Palo Alto, CA'), true);
assert('allows Sunnyvale', filter('Sunnyvale, CA'), true);
assert('allows Oakland', filter('Oakland, CA'), true);
assert('allows San Jose, CA', filter('San Jose, CA'), true);

// — allowed (Remote US) —
assert('allows Remote - United States', filter('Remote - United States'), true);
assert('allows Remote, USA', filter('Remote, USA'), true);
assert('allows Remote (US)', filter('Remote (US)'), true);
assert('allows US Remote', filter('US Remote'), true);
assert('denies bare United States (too loose — NYC companies listed US-wide)', filter('United States'), false);
assert('denies Newark, NJ, United States (not Bay Area, not explicit remote)', filter('Newark, NJ, United States'), false);

// — allowed (multi-city, at least one Bay Area hit) —
assert('allows Hybrid - San Francisco, New York City', filter('Hybrid - San Francisco, New York City'), true);
assert('allows SF|Austin|NY', filter('San Francisco, CA | Austin, TX | New York, NY'), true);

// — denied (explicit deny-list) —
assert('denies London', filter('London'), false);
assert('denies London, England, United Kingdom (deny overrides United States-ish)', filter('London, England, United Kingdom'), false);
assert('denies Paris', filter('Paris'), false);
assert('denies Bangalore, India', filter('Bangalore, India'), false);
assert('denies Dublin, IE', filter('Dublin, IE'), false);
assert('denies Remote, EMEA/LATAM', filter('Remote, EMEA/LATAM'), false);
assert('denies Vilnius, Lithuania', filter('Vilnius, Lithuania'), false);
assert('denies São Paulo, Brazil', filter('São Paulo, Brazil'), false);
assert('denies Berlin; London; Munich', filter('Berlin; London; Munich'), false);
assert('denies Cambridge, England', filter('Cambridge, England, United Kingdom'), false);

// — not allowed and not denied → strict fail —
assert('denies New York, NY alone (user excluded NY from allow)', filter('New York, NY'), false);
assert('denies Washington, DC', filter('Washington, DC'), false);
assert('denies Seattle, WA', filter('Seattle, WA'), false);
assert('denies Austin, TX alone', filter('Austin, TX'), false);
assert('denies Los Angeles, CA (CA not allowed, only Bay Area cities)', filter('Los Angeles, CA'), false);
assert('denies bare Remote (ambiguous region)', filter('Remote'), false);

// — blank passes through —
assert('blank string passes through', filter(''), true);
assert('null passes through', filter(null), true);
assert('undefined passes through', filter(undefined), true);

// — deny-only config: no allow entries → everything not-denied passes —
const denyOnly = buildLocationFilter({ allow: [], deny: ['London'] });
assert('deny-only: unknown city passes', denyOnly('Salt Lake City, UT'), true);
assert('deny-only: London fails', denyOnly('London'), false);
assert('deny-only: blank passes', denyOnly(''), true);

// — no config → everything passes —
const noCfg = buildLocationFilter({});
assert('no config: London passes', noCfg('London'), true);
assert('no config: blank passes', noCfg(''), true);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
