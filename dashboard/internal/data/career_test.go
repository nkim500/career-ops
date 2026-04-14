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
