# Vigil: live run on real websites

Recorded on 2 October 2026 on a Windows 11 PC (12 cores, 24 GB RAM), Vigil 2.0.0 started with `start.bat`.

## Quick checks on hard cases

| Link | Verdict | Why Vigil said so |
|---|---|---|
| g2.com | Working, restricted (83) | a bot-protection challenge (Cloudflare and DataDome) blocks automated access |
| citynews.org | Parked domain (90) | the domain resolves to a parking or for-sale page |
| a domain that does not exist | Down | DNS has no such domain, and no fallback address opens either |
| httpbin.org/status/404 | Site up, page missing | HTTP 404, while the site itself opens |
| httpbin.org/status/503 | Site up, page broken | HTTP 503, while the site itself opens |
| indeed.com, github.com, example.com | Working | HTTP 200 |

## Batch: samples/sample_test_urls.xlsx (5,210 news sites)

A slice of 3,402 links was checked in 54 minutes before the run was stopped on purpose (5,077 unique addresses in the file).

| Verdict | Links |
|---|---|
| Working | 2,653 |
| Working, restricted | 126 |
| Site up, page missing | 78 |
| Server error | 68 |
| Parked domain | 41 |
| Down | 367 |
| Uncertain | 69 |

- Latency: p50 1.0 s, p95 14.6 s.
- Vigil's own process stayed near 140 MB of RAM. It ran at 4 parallel checks, because the PC was already at 80 to 85% memory from other programs.
- Excel export: 1.2 MB in 3.1 s with Summary, Results, Working, Not working and Fixed by fallback sheets. The original columns are kept next to Vigil's verdict. The CSV export took 0.4 s.

## Files

- `01-home.png` the check screen
- `02-quick-check-bot-wall.png`, `03-quick-check-parked.png`, `04-quick-check-dead-domain.png` quick checks
- `05-batch-5210-live.png`, `06-batch-results-table.png`, `07-batch-insights.png` the batch while it ran
- `08-runs.png` the runs list
- `vigil-live-run.webm` silent walkthrough of the same screens
