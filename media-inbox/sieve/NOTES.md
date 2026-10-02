# Sieve: live run on real websites

Recorded on 2 October 2026 on a Windows 11 PC (12 cores, 24 GB RAM), Sieve 1.0.0 started with `start.bat`.

## Site probes

| Site | What Sieve found | Engine it chose |
|---|---|---|
| indeed.com | Cloudflare challenges plain HTTP (403), a browser-grade TLS fingerprint gets through | Stealth, 90% confidence |
| g2.com | Cloudflare plus DataDome block even a real browser | Browser, 50% confidence, warns that results may be partial |
| quotes.toscrape.com/js | 3 words in the raw HTML, 192 after rendering | Browser, 90% confidence |
| news.ycombinator.com | robots.txt asks for 30 s between requests | HTTP, one request at a time, 30 s delay |
| nowsecure.nl | Cloudflare present but passive | HTTP |

## Crawls

| Job | Pages | Errors | Clean | Notes |
|---|---|---|---|---|
| Indeed (Cloudflare) | 5 | 0 | 5 | all 5 through the stealth engine, 6,177 words, 7 s |
| Quotes (JavaScript) | 10 | 0 | 9 | rendered in a browser, one thin page filtered out by the quality gate |
| Hacker News (rate-limited) | 4 | 0 | 4 | requests spaced 29.3 s, 30.0 s and 30.3 s apart, as robots.txt asks |

Peak machine load during the crawls: 69% CPU and 81% RAM (most of that RAM was in use before Sieve started). The sidebar switched to "Throttling" when RAM passed 80%.

Exports checked: JSONL, CSV and XLSX all downloaded.

## Files

- `01-overview-live-resources.png` live CPU and memory gauges
- `02-probe-indeed-cloudflare-stealth.png` the probe choosing the stealth engine
- `03-probe-g2-datadome-blocked.png` an honest "blocked" verdict
- `04-jobs-list.png`, `05-job-indeed-results.png`, `06-job-hn-crawl-delay.png` the three runs
- `07-search-clean-data.png` full-text search over the cleaned pages
- `sieve-live-run.webm` silent walkthrough of the same screens
