# Posting Freshness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract job posting dates from ATS APIs, surface freshness in pipeline.md and the dashboard TUI, and let the LLM backfill dates during evaluation.

**Architecture:** `scan.mjs` parsers extract `datePosted` from Greenhouse/Ashby/Lever API responses → stored in `scan-history.tsv` (new column) → annotated in `pipeline.md` → dashboard reads from scan-history.tsv to enrich `CareerApplication.DatePosted` → new Age column and sortAge mode in the TUI. During evaluation, the LLM extracts posting date from page content as fallback and writes it back to scan-history.tsv.

**Tech Stack:** Node.js (scan.mjs), Go (dashboard TUI with Bubble Tea + Lipgloss), Markdown (modes)

**Spec:** `docs/superpowers/specs/2026-04-14-posting-freshness-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scan.mjs` | Modify | Extract `datePosted` from API parsers, write to TSV + pipeline |
| `data/scan-history.tsv` | Migrate | Add `date_posted` column to existing rows |
| `dashboard/internal/model/career.go` | Modify | Add `DatePosted` field |
| `dashboard/internal/data/career.go` | Modify | Enrich `DatePosted` from scan-history.tsv, add age helper |
| `dashboard/internal/data/career_test.go` | Create | Tests for date enrichment and age formatting |
| `dashboard/internal/ui/screens/pipeline.go` | Modify | Age column, `sortAge` mode, color coding |
| `dashboard/internal/ui/screens/pipeline_test.go` | Modify | Test sortAge |
| `modes/scan.md` | Modify | Document `date_posted` extraction |
| `modes/pipeline.md` | Modify | Document LLM fallback date extraction |
| `modes/offer.md` | Modify | Add `**Posted:**` to report header format |

---

### Task 1: Extract `datePosted` from scan.mjs API parsers

**Files:**
- Modify: `scan.mjs:77-107` (parsers), `scan.mjs:219-229` (appendToScanHistory), `scan.mjs:188-216` (appendToPipeline)

- [ ] **Step 1: Update parseGreenhouse to extract datePosted**

In `scan.mjs`, replace the `parseGreenhouse` function (lines 77-85):

```javascript
function parseGreenhouse(json, companyName) {
  const jobs = json.jobs || [];
  return jobs.map(j => ({
    title: j.title || '',
    url: j.absolute_url || '',
    company: companyName,
    location: j.location?.name || '',
    datePosted: j.updated_at ? j.updated_at.slice(0, 10) : '',
  }));
}
```

- [ ] **Step 2: Update parseAshby to extract datePosted**

Replace the `parseAshby` function (lines 87-95):

```javascript
function parseAshby(json, companyName) {
  const jobs = json.jobs || [];
  return jobs.map(j => ({
    title: j.title || '',
    url: j.jobUrl || '',
    company: companyName,
    location: j.location || '',
    datePosted: j.publishedDate ? j.publishedDate.slice(0, 10) : '',
  }));
}
```

Note: The Ashby posting API field name may be `publishedDate`, `createdAt`, or similar. During implementation, log one sample response to verify the actual field name. If neither exists, leave as empty string.

- [ ] **Step 3: Update parseLever to extract datePosted**

Replace the `parseLever` function (lines 97-105):

```javascript
function parseLever(json, companyName) {
  if (!Array.isArray(json)) return [];
  return json.map(j => ({
    title: j.text || '',
    url: j.hostedUrl || '',
    company: companyName,
    location: j.categories?.location || '',
    datePosted: j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : '',
  }));
}
```

Lever returns `createdAt` as Unix milliseconds — `new Date(ms)` converts it.

- [ ] **Step 4: Add age formatting helper**

Add this function after the parsers (after line 107):

```javascript
function formatAge(datePosted, referenceDate) {
  if (!datePosted) return '';
  const posted = new Date(datePosted);
  const ref = new Date(referenceDate);
  const days = Math.floor((ref - posted) / (1000 * 60 * 60 * 24));
  if (days < 0) return '';
  if (days <= 1) return '📅 today';
  if (days <= 6) return `📅 ${days}d`;
  const weeks = Math.floor(days / 7);
  if (days <= 59) return `📅 ${weeks}w`;
  return '📅 60d+';
}
```

- [ ] **Step 5: Update appendToScanHistory to write datePosted column**

Replace the `appendToScanHistory` function (lines 219-229):

```javascript
function appendToScanHistory(offers, date) {
  // Ensure file + header exist
  if (!existsSync(SCAN_HISTORY_PATH)) {
    writeFileSync(SCAN_HISTORY_PATH, 'url\tfirst_seen\tportal\ttitle\tcompany\tdate_posted\tstatus\n', 'utf-8');
  }

  const lines = offers.map(o =>
    `${o.url}\t${date}\t${o.source}\t${o.title}\t${o.company}\t${o.datePosted || ''}\tadded`
  ).join('\n') + '\n';

  appendFileSync(SCAN_HISTORY_PATH, lines, 'utf-8');
}
```

- [ ] **Step 6: Update appendToPipeline to include age annotation**

In `appendToPipeline` (lines 188-216), update the two places where pipeline entries are formatted. Replace:

```javascript
`- [ ] ${o.url} | ${o.company} | ${o.title}`
```

with:

```javascript
`- [ ] ${o.url} | ${o.company} | ${o.title}${o.ageLabel ? ' | ' + o.ageLabel : ''}`
```

This appears on lines 201 and 211. Both must be updated.

- [ ] **Step 7: Compute ageLabel before writing to pipeline**

In the main function, after `newOffers.push(...)` (line 316), the offers don't have `ageLabel` yet. Add it after the scan completes, before writing results. Insert after line 323 (`await parallelFetch(tasks, CONCURRENCY);`) and before line 326 (`if (!dryRun && newOffers.length > 0)`):

```javascript
  // Compute age labels for pipeline annotation
  for (const o of newOffers) {
    o.ageLabel = formatAge(o.datePosted, date);
  }

  // Sort new offers by freshness (freshest first)
  newOffers.sort((a, b) => {
    if (!a.datePosted && !b.datePosted) return 0;
    if (!a.datePosted) return 1;
    if (!b.datePosted) return -1;
    return b.datePosted.localeCompare(a.datePosted);
  });
```

- [ ] **Step 8: Update scan summary to show posting date**

In the summary output (lines 348-357), update the new offers display. Replace:

```javascript
      console.log(`  + ${o.company} | ${o.title} | ${o.location || 'N/A'}`);
```

with:

```javascript
      const age = o.ageLabel || '';
      console.log(`  + ${o.company} | ${o.title} | ${o.location || 'N/A'}${age ? ' | ' + age : ''}`);
```

- [ ] **Step 9: Test scan.mjs manually**

Run:
```bash
node scan.mjs --dry-run --company Anthropic
```

Expected: Output shows age annotations next to job titles (e.g. `📅 4d`). No files written (dry run).

- [ ] **Step 10: Commit**

```bash
git add scan.mjs
git commit -m "feat: extract datePosted from ATS APIs in scan.mjs

Parse posting dates from Greenhouse (updated_at), Ashby
(publishedDate), and Lever (createdAt). Annotate pipeline entries
with age labels and sort new offers freshest-first."
```

---

### Task 2: Migrate existing scan-history.tsv

**Files:**
- Modify: `data/scan-history.tsv`

- [ ] **Step 1: Check if scan-history.tsv has the old 6-column format**

Read the header line of `data/scan-history.tsv`. If it reads:
```
url	first_seen	portal	title	company	status
```
then migration is needed. If it already has `date_posted`, skip this task.

- [ ] **Step 2: Add empty date_posted column to existing rows**

Run this one-liner to insert an empty `date_posted` column between `company` (col 5) and `status` (col 6):

```bash
awk -F'\t' 'BEGIN{OFS="\t"} NR==1{print $1,$2,$3,$4,$5,"date_posted",$6} NR>1{print $1,$2,$3,$4,$5,"",$6}' data/scan-history.tsv > data/scan-history.tsv.tmp && mv data/scan-history.tsv.tmp data/scan-history.tsv
```

- [ ] **Step 3: Verify migration**

```bash
head -3 data/scan-history.tsv
```

Expected: Header has 7 columns ending with `date_posted	status`. Data rows have an empty field between company and status.

- [ ] **Step 4: Update loadSeenUrls in scan.mjs**

The `loadSeenUrls` function (line 139-168) reads `scan-history.tsv` and extracts the URL from column 0 (`line.split('\t')[0]`). This still works regardless of column count — no change needed. Verify by reading the function and confirming it only uses `fields[0]`.

- [ ] **Step 5: Commit**

```bash
git add data/scan-history.tsv
git commit -m "chore: migrate scan-history.tsv to 7-column format

Add empty date_posted column between company and status for
existing entries. New scans will populate this field from API data."
```

---

### Task 3: Dashboard model — add DatePosted field

**Files:**
- Modify: `dashboard/internal/model/career.go:4-22`

- [ ] **Step 1: Add DatePosted to CareerApplication struct**

In `dashboard/internal/model/career.go`, add `DatePosted` after `JobURL`:

```go
type CareerApplication struct {
	Number       int
	Date         string
	Company      string
	Role         string
	Status       string
	Score        float64
	ScoreRaw     string
	HasPDF       bool
	ReportPath   string
	ReportNumber string
	Notes        string
	JobURL       string // URL of the original job posting
	DatePosted   string // ISO date (YYYY-MM-DD) when the job was posted, or empty
	// Enrichment (lazy loaded from report)
	Archetype    string
	TlDr         string
	Remote       string
	CompEstimate string
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd dashboard && go build ./...
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add dashboard/internal/model/career.go
git commit -m "feat(dashboard): add DatePosted field to CareerApplication"
```

---

### Task 4: Dashboard data layer — enrich DatePosted from scan-history.tsv

**Files:**
- Create: `dashboard/internal/data/career_test.go`
- Modify: `dashboard/internal/data/career.go:283-342` (enrichFromScanHistory)

- [ ] **Step 1: Write test for FormatAge helper**

Create `dashboard/internal/data/career_test.go`:

```go
package data

import (
	"testing"
)

func TestFormatAge(t *testing.T) {
	tests := []struct {
		datePosted string
		today      string
		want       string
	}{
		{"2026-04-14", "2026-04-14", "today"},
		{"2026-04-13", "2026-04-14", "today"},
		{"2026-04-11", "2026-04-14", "3d"},
		{"2026-04-08", "2026-04-14", "6d"},
		{"2026-04-07", "2026-04-14", "1w"},
		{"2026-03-25", "2026-04-14", "2w"},
		{"2026-02-15", "2026-04-14", "8w"},
		{"2026-02-13", "2026-04-14", "8w"},
		{"2026-02-01", "2026-04-14", "60d+"},
		{"", "2026-04-14", ""},
	}

	for _, tt := range tests {
		t.Run(tt.datePosted+"->"+tt.want, func(t *testing.T) {
			got := FormatAge(tt.datePosted, tt.today)
			if got != tt.want {
				t.Errorf("FormatAge(%q, %q) = %q, want %q", tt.datePosted, tt.today, got, tt.want)
			}
		})
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd dashboard && go test ./internal/data/ -run TestFormatAge -v
```

Expected: FAIL — `FormatAge` not defined.

- [ ] **Step 3: Implement FormatAge**

Add to `dashboard/internal/data/career.go` (after the `safePct` function at the end):

```go
// FormatAge returns a human-readable age string given a posting date and today's date.
// Both must be in YYYY-MM-DD format. Returns "" if datePosted is empty or unparseable.
func FormatAge(datePosted, today string) string {
	if datePosted == "" {
		return ""
	}
	posted, err := time.Parse("2006-01-02", datePosted)
	if err != nil {
		return ""
	}
	ref, err := time.Parse("2006-01-02", today)
	if err != nil {
		return ""
	}
	days := int(ref.Sub(posted).Hours() / 24)
	if days < 0 {
		return ""
	}
	if days <= 1 {
		return "today"
	}
	if days <= 6 {
		return fmt.Sprintf("%dd", days)
	}
	weeks := days / 7
	if days <= 59 {
		return fmt.Sprintf("%dw", weeks)
	}
	return "60d+"
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd dashboard && go test ./internal/data/ -run TestFormatAge -v
```

Expected: PASS.

- [ ] **Step 5: Write test for DatePosted enrichment from scan-history.tsv**

Add to `dashboard/internal/data/career_test.go`:

```go
func TestEnrichDatePostedFromScanHistory(t *testing.T) {
	tests := []struct {
		name       string
		tsvLine    string
		appURL     string
		wantDate   string
	}{
		{
			name:     "7-col format with date",
			tsvLine:  "https://example.com/job1\t2026-04-11\tghapi\tEngineer\tAcme\t2026-04-08\tadded",
			appURL:   "https://example.com/job1",
			wantDate: "2026-04-08",
		},
		{
			name:     "7-col format without date",
			tsvLine:  "https://example.com/job2\t2026-04-11\tghapi\tEngineer\tAcme\t\tadded",
			appURL:   "https://example.com/job2",
			wantDate: "",
		},
		{
			name:     "6-col legacy format",
			tsvLine:  "https://example.com/job3\t2026-04-11\tghapi\tEngineer\tAcme\tadded",
			appURL:   "https://example.com/job3",
			wantDate: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			entry := parseScanHistoryLine(tt.tsvLine)
			if entry.datePosted != tt.wantDate {
				t.Errorf("parseScanHistoryLine datePosted = %q, want %q", entry.datePosted, tt.wantDate)
			}
		})
	}
}
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd dashboard && go test ./internal/data/ -run TestEnrichDatePosted -v
```

Expected: FAIL — `parseScanHistoryLine` not defined.

- [ ] **Step 7: Implement scan-history.tsv parsing with date_posted support**

In `dashboard/internal/data/career.go`, refactor `enrichFromScanHistory` (lines 283-342). Replace the existing `scanEntry` type and the scan-history parsing logic:

```go
type scanEntry struct {
	url        string
	company    string
	title      string
	datePosted string
}

// parseScanHistoryLine parses a single TSV line from scan-history.tsv.
// Supports both 6-column (legacy) and 7-column (with date_posted) formats.
func parseScanHistoryLine(line string) scanEntry {
	fields := strings.Split(line, "\t")
	if len(fields) < 6 || fields[0] == "url" {
		return scanEntry{}
	}
	e := scanEntry{
		url:     fields[0],
		title:   fields[3],
		company: fields[4],
	}
	// 7-column format: url, first_seen, portal, title, company, date_posted, status
	// 6-column format: url, first_seen, portal, title, company, status
	if len(fields) >= 7 {
		e.datePosted = fields[5]
	}
	return e
}
```

Then update `enrichFromScanHistory` to use `parseScanHistoryLine` and also build a URL→datePosted index:

```go
func enrichFromScanHistory(careerOpsPath string, apps []model.CareerApplication) {
	scanPath := filepath.Join(careerOpsPath, "scan-history.tsv")
	if _, err := os.Stat(scanPath); err != nil {
		scanPath = filepath.Join(careerOpsPath, "data", "scan-history.tsv")
	}
	scanData, err := os.ReadFile(scanPath)
	if err != nil {
		return
	}

	byCompany := make(map[string][]scanEntry)
	byURL := make(map[string]scanEntry)
	for _, line := range strings.Split(string(scanData), "\n") {
		e := parseScanHistoryLine(line)
		if e.url == "" || !strings.HasPrefix(e.url, "http") {
			continue
		}
		key := normalizeCompany(e.company)
		byCompany[key] = append(byCompany[key], e)
		byURL[e.url] = e
	}

	for i := range apps {
		// Enrich DatePosted by exact URL match (works even if JobURL was set by earlier strategy)
		if apps[i].JobURL != "" {
			if entry, ok := byURL[apps[i].JobURL]; ok && entry.datePosted != "" {
				apps[i].DatePosted = entry.datePosted
			}
		}

		// Enrich JobURL if still empty (existing logic)
		if apps[i].JobURL != "" {
			continue
		}
		key := normalizeCompany(apps[i].Company)
		matches := byCompany[key]
		if len(matches) == 1 {
			apps[i].JobURL = matches[0].url
			apps[i].DatePosted = matches[0].datePosted
		} else if len(matches) > 1 {
			appRole := strings.ToLower(apps[i].Role)
			best := matches[0]
			bestScore := 0
			for _, m := range matches {
				score := 0
				mTitle := strings.ToLower(m.title)
				for _, word := range strings.Fields(appRole) {
					if len(word) > 2 && strings.Contains(mTitle, word) {
						score++
					}
				}
				if score > bestScore {
					bestScore = score
					best = m
				}
			}
			apps[i].JobURL = best.url
			apps[i].DatePosted = best.datePosted
		}
	}
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
cd dashboard && go test ./internal/data/ -v
```

Expected: All tests PASS.

- [ ] **Step 9: Commit**

```bash
git add dashboard/internal/data/career.go dashboard/internal/data/career_test.go
git commit -m "feat(dashboard): enrich DatePosted from scan-history.tsv

Add FormatAge helper for human-readable posting age. Parse
date_posted column from scan-history.tsv (supports legacy 6-col
and new 7-col formats). Enrich CareerApplication.DatePosted by
URL match during the scan-history enrichment pass."
```

---

### Task 5: Dashboard TUI — Age column and sortAge mode

**Files:**
- Modify: `dashboard/internal/ui/screens/pipeline.go:58-64,90,447-488,722-777,824-860`
- Modify: `dashboard/internal/ui/screens/pipeline_test.go`

- [ ] **Step 1: Write test for sortAge**

Add to `dashboard/internal/ui/screens/pipeline_test.go`:

```go
func TestSortAgeOrdersFreshestFirst(t *testing.T) {
	apps := []model.CareerApplication{
		{Company: "Old", Role: "Eng", Status: "Evaluated", Score: 4.0, DatePosted: "2026-03-01"},
		{Company: "Fresh", Role: "Eng", Status: "Evaluated", Score: 3.5, DatePosted: "2026-04-12"},
		{Company: "NoDate", Role: "Eng", Status: "Evaluated", Score: 4.5, DatePosted: ""},
	}

	pm := NewPipelineModel(
		theme.NewTheme("catppuccin-mocha"),
		apps,
		model.PipelineMetrics{Total: len(apps)},
		"..",
		120, 40,
	)
	pm.sortMode = sortAge
	pm.viewMode = "flat"
	pm.applyFilterAndSort()

	if len(pm.filtered) != 3 {
		t.Fatalf("expected 3 filtered, got %d", len(pm.filtered))
	}
	if pm.filtered[0].Company != "Fresh" {
		t.Errorf("expected Fresh first (freshest), got %s", pm.filtered[0].Company)
	}
	if pm.filtered[1].Company != "Old" {
		t.Errorf("expected Old second, got %s", pm.filtered[1].Company)
	}
	if pm.filtered[2].Company != "NoDate" {
		t.Errorf("expected NoDate last (no date sorts to bottom), got %s", pm.filtered[2].Company)
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd dashboard && go test ./internal/ui/screens/ -run TestSortAge -v
```

Expected: FAIL — `sortAge` not defined.

- [ ] **Step 3: Add sortAge constant and update sort cycle**

In `pipeline.go`, update the constants (lines 58-64) and sort cycle (line 90):

```go
const (
	sortScore   = "score"
	sortDate    = "date"
	sortCompany = "company"
	sortStatus  = "status"
	sortAge     = "age"
)
```

```go
var sortCycle = []string{sortScore, sortDate, sortCompany, sortStatus, sortAge}
```

- [ ] **Step 4: Add sortAge case to applyFilterAndSort**

In `applyFilterAndSort` (line 447), add a new case in the sort switch after the `sortStatus` case:

```go
	case sortAge:
		sort.SliceStable(filtered, func(i, j int) bool {
			di := filtered[i].DatePosted
			dj := filtered[j].DatePosted
			if di == "" && dj == "" {
				return false
			}
			if di == "" {
				return false // no date sorts to bottom
			}
			if dj == "" {
				return true
			}
			return di > dj // newer dates first
		})
```

Also add the `sortAge` case inside the grouped-mode sort (within the same-group switch around line 476):

```go
			case sortAge:
				di := filtered[i].DatePosted
				dj := filtered[j].DatePosted
				if di == "" && dj == "" {
					return false
				}
				if di == "" {
					return false
				}
				if dj == "" {
					return true
				}
				return di > dj
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd dashboard && go test ./internal/ui/screens/ -v
```

Expected: All tests PASS.

- [ ] **Step 6: Add Age column to renderAppLine**

In `renderAppLine` (lines 722-777), add an `ageW` column and render it. Update column widths:

```go
func (m PipelineModel) renderAppLine(app model.CareerApplication, selected bool) string {
	padStyle := lipgloss.NewStyle().Padding(0, 2)

	// Column widths
	scoreW := 5
	companyW := 20
	statusW := 12
	ageW := 7
	compW := 14
	roleW := m.width - scoreW - companyW - statusW - ageW - compW - 12
	if roleW < 15 {
		roleW = 15
	}

	// Score with color
	scoreStyle := m.scoreStyle(app.Score)
	score := scoreStyle.Render(fmt.Sprintf("%.1f", app.Score))

	// Company (truncate)
	company := truncateRunes(app.Company, companyW)
	companyStyle := lipgloss.NewStyle().Foreground(m.theme.Text).Width(companyW)

	// Role (truncate)
	role := truncateRunes(app.Role, roleW)
	roleStyle := lipgloss.NewStyle().Foreground(m.theme.Subtext).Width(roleW)

	// Status with color
	norm := data.NormalizeStatus(app.Status)
	statusColor := m.statusColorMap()[norm]
	statusStyle := lipgloss.NewStyle().Foreground(statusColor).Width(statusW)
	statusText := statusStyle.Render(statusLabel(norm))

	// Age with color coding
	// Primary: DatePosted (actual posting date from API)
	// Fallback: Date (first_seen / evaluation date) with ~ prefix
	today := time.Now().Format("2006-01-02")
	ageText := ""
	if app.DatePosted != "" {
		ageStr := data.FormatAge(app.DatePosted, today)
		ageStyle := m.ageStyle(app.DatePosted, today)
		ageText = ageStyle.Width(ageW).Render(ageStr)
	} else if app.Date != "" {
		ageStr := data.FormatAge(app.Date, today)
		if ageStr != "" {
			ageStr = "~" + ageStr
		}
		ageText = lipgloss.NewStyle().Foreground(m.theme.Subtext).Width(ageW).Render(ageStr)
	} else {
		ageText = lipgloss.NewStyle().Foreground(m.theme.Subtext).Width(ageW).Render("—")
	}

	// Comp from report cache
	compText := ""
	if summary, ok := m.reportCache[app.ReportPath]; ok && summary.comp != "" {
		comp := truncateRunes(summary.comp, compW-1)
		compStyle := lipgloss.NewStyle().Foreground(m.theme.Yellow)
		compText = compStyle.Render(comp)
	}

	line := fmt.Sprintf(" %s %s %s %s %s %s",
		score,
		companyStyle.Render(company),
		roleStyle.Render(role),
		statusText,
		ageText,
		compText,
	)

	if selected {
		selStyle := lipgloss.NewStyle().
			Background(m.theme.Overlay).
			Width(m.width - 4)
		return padStyle.Render(selStyle.Render(line))
	}
	return padStyle.Render(line)
}
```

- [ ] **Step 7: Add ageStyle helper**

Add after the `scoreStyle` method (around line 894):

```go
func (m PipelineModel) ageStyle(datePosted, today string) lipgloss.Style {
	posted, err := time.Parse("2006-01-02", datePosted)
	if err != nil {
		return lipgloss.NewStyle().Foreground(m.theme.Subtext)
	}
	ref, err := time.Parse("2006-01-02", today)
	if err != nil {
		return lipgloss.NewStyle().Foreground(m.theme.Subtext)
	}
	days := int(ref.Sub(posted).Hours() / 24)
	switch {
	case days <= 7:
		return lipgloss.NewStyle().Foreground(m.theme.Green)
	case days <= 30:
		return lipgloss.NewStyle().Foreground(m.theme.Yellow)
	default:
		return lipgloss.NewStyle().Foreground(m.theme.Red)
	}
}
```

- [ ] **Step 8: Add time import to pipeline.go**

Add `"time"` to the import block at the top of `pipeline.go`.

- [ ] **Step 9: Verify it compiles and tests pass**

```bash
cd dashboard && go build ./... && go test ./... -v
```

Expected: Build succeeds, all tests PASS.

- [ ] **Step 10: Commit**

```bash
git add dashboard/internal/ui/screens/pipeline.go dashboard/internal/ui/screens/pipeline_test.go
git commit -m "feat(dashboard): add Age column and sortAge mode

Show posting age with green/yellow/red color coding (≤7d/≤30d/31d+).
New 'age' sort mode cycles via 's' key — freshest first, unknown
dates sort to bottom. Works in both flat and grouped views."
```

---

### Task 6: Update mode documentation

**Files:**
- Modify: `modes/scan.md`
- Modify: `modes/pipeline.md`
- Modify: `modes/offer.md`

- [ ] **Step 1: Update modes/scan.md — document date_posted in scan-history format**

In `modes/scan.md`, update the scan history section (lines 172-180). Replace the existing format block:

```
url	first_seen	portal	title	company	date_posted	status
https://...	2026-02-10	Ashby — AI PM	PM AI	Acme	2026-02-08	added
https://...	2026-02-10	Greenhouse — SA	Junior Dev	BigCo		skipped_title
https://...	2026-02-10	Ashby — AI PM	SA AI	OldCo		skipped_dup
https://...	2026-02-10	WebSearch — AI PM	PM AI	ClosedCo		skipped_expired
```

Also add a note after the scan history section:

```markdown
### Posting date extraction

The scanner extracts `date_posted` from ATS API responses when available:
- **Greenhouse:** `updated_at` field
- **Ashby:** `publishedDate` field
- **Lever:** `createdAt` field (Unix ms → ISO date)

Pipeline entries are annotated with age (e.g., `📅 3d`) and sorted freshest-first within each scan batch.

If the API doesn't return a posting date, the field is left empty. The LLM can backfill it during evaluation (see pipeline mode).
```

- [ ] **Step 2: Update modes/pipeline.md — document LLM fallback date extraction**

Add a new section before "## Smart JD detection from URL" (before line 36) in `modes/pipeline.md`:

```markdown
## Posting date backfill

During evaluation, if the job's `date_posted` is missing from `scan-history.tsv`:

1. While reading the page snapshot (already happening for JD extraction), look for posting date signals:
   - Explicit: "Posted on April 10, 2026", "Listed 3 days ago", "Published: 2026-04-10"
   - Implicit: metadata dates, breadcrumbs, page footer
2. If found: include `**Posted:** YYYY-MM-DD` in the report header and write the date back to `scan-history.tsv` by finding the matching URL row and filling in the `date_posted` column.
3. If not found: leave empty. Don't guess. The `first_seen` date serves as a ceiling.
```

- [ ] **Step 3: Update modes/offer.md — add Posted field to report header**

In `modes/offer.md`, in the report format section (around line 106), add `**Posted:**` after `**URL:**`:

```markdown
**Date:** {YYYY-MM-DD}
**Archetype:** {detected}
**Score:** {X/5}
**URL:** {job posting URL}
**Posted:** {YYYY-MM-DD or "unknown"}
**PDF:** {path or pending}
```

- [ ] **Step 4: Commit**

```bash
git add modes/scan.md modes/pipeline.md modes/offer.md
git commit -m "docs: document posting date extraction in scan, pipeline, and offer modes

Add date_posted column to scan-history format docs. Document LLM
fallback date extraction during evaluation. Add **Posted:** field
to report header format."
```

---

### Task 7: End-to-end verification

- [ ] **Step 1: Run scan dry-run to verify date extraction**

```bash
node scan.mjs --dry-run 2>&1 | head -30
```

Verify: Output includes age annotations for companies where APIs return dates.

- [ ] **Step 2: Run a real single-company scan**

```bash
node scan.mjs --company Anthropic
```

Verify: `data/scan-history.tsv` has `date_posted` populated for new Greenhouse entries. `data/pipeline.md` entries have `📅` annotations.

- [ ] **Step 3: Build and run dashboard**

```bash
cd dashboard && go build -o career-dashboard . && ./career-dashboard
```

Verify:
- Age column appears in the pipeline list
- Press `s` to cycle to `age` sort — freshest jobs appear first
- Color coding: green for ≤7d, yellow for 8-30d, red for 31d+

- [ ] **Step 4: Run all tests**

```bash
cd dashboard && go test ./... -v
node test-all.mjs 2>&1 | tail -10
```

Expected: All Go tests pass. Node test suite passes (or at least no regressions in scan-related tests).

- [ ] **Step 5: Final commit if any fixes needed**

Only if previous steps revealed issues that needed fixing.
