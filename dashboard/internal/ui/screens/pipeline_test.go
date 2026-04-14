package screens

import (
	"testing"

	"github.com/santifer/career-ops/dashboard/internal/model"
	"github.com/santifer/career-ops/dashboard/internal/theme"
)

func TestWithReloadedDataPreservesStateAndSelection(t *testing.T) {
	initialApps := []model.CareerApplication{
		{
			Company:    "Acme",
			Role:       "Backend Engineer",
			Status:     "Evaluated",
			Score:      4.2,
			ReportPath: "reports/001-acme.md",
		},
		{
			Company:    "Beta",
			Role:       "Platform Engineer",
			Status:     "Applied",
			Score:      4.6,
			ReportPath: "reports/002-beta.md",
		},
	}

	pm := NewPipelineModel(
		theme.NewTheme("catppuccin-mocha"),
		initialApps,
		model.PipelineMetrics{Total: len(initialApps)},
		"..",
		120,
		40,
	)
	pm.sortMode = sortCompany
	pm.activeTab = 0
	pm.viewMode = "flat"
	pm.applyFilterAndSort()
	pm.cursor = 1
	pm.reportCache["reports/002-beta.md"] = reportSummary{tldr: "cached"}

	refreshedApps := []model.CareerApplication{
		initialApps[0],
		initialApps[1],
		{
			Company:    "Gamma",
			Role:       "AI Engineer",
			Status:     "Interview",
			Score:      4.8,
			ReportPath: "reports/003-gamma.md",
		},
	}

	reloaded := pm.WithReloadedData(refreshedApps, model.PipelineMetrics{Total: len(refreshedApps)})

	if reloaded.sortMode != sortCompany {
		t.Fatalf("expected sort mode %q, got %q", sortCompany, reloaded.sortMode)
	}
	if reloaded.viewMode != "flat" {
		t.Fatalf("expected view mode to stay flat, got %q", reloaded.viewMode)
	}
	if got := len(reloaded.filtered); got != 3 {
		t.Fatalf("expected 3 filtered apps after refresh, got %d", got)
	}
	if app, ok := reloaded.CurrentApp(); !ok || app.ReportPath != "reports/002-beta.md" {
		t.Fatalf("expected selection to stay on beta app, got %+v (ok=%v)", app, ok)
	}
	if reloaded.reportCache["reports/002-beta.md"].tldr != "cached" {
		t.Fatal("expected cached report summaries to survive refresh")
	}
}

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
