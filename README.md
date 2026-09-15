# Procrastination Pattern Matcher

An extension of the "Task Autopsy" idea: instead of just prompting reflection after one delayed task, this clusters *every* delayed task you've logged — by category, time of day, and estimated effort — to surface the trigger you keep repeating (e.g. "You delay admin tasks scheduled before 10am 80% of the time").

**Live app:** https://claude.ai/artifact/JKwxLcUgh1wyCMfoeXhFyN

## How it works

The whole app is a single static HTML page (`procrastination-pattern-matcher.html`) published as a Claude Artifact. It needs no separate backend or hosting — Claude's artifact runtime provides:

- **Persistent storage** — logged tasks are written to the artifact's `db` capability (a realtime JSON document store scoped to this page), so your task log survives reloads and syncs live if you have the page open in multiple tabs.
- **Client-side analysis** — everything below runs in the browser against the current task list, recomputed on every change:
  - **Detected patterns** — every (category × time-of-day) combination with at least 3 logged tasks, ranked by a Wilson score lower bound (so a 2-for-2 combo doesn't outrank a well-supported 8-for-10) and phrased as a plain-language insight.
  - **Delay rate by category** and a **category × time-of-day heatmap**, both drawn as plain SVG/HTML — no charting library.
  - **Behavioral clusters** — an unsupervised k-means implementation (k-means++, multiple restarts, written from scratch in vanilla JS) over feature vectors built from category, scheduled hour, and estimated effort. This is the "cluster it, don't just filter it" layer: it groups tasks that behave alike even when they span different categories or times, which the manual category/time table above can't see. Kicks in once at least 12 tasks are logged.

## Task shape

Each logged task is one document in the `tasks` collection:

```json
{
  "title": "File expense report",
  "category": "admin",
  "scheduledHour": 8,
  "effortLevel": "quick",
  "status": "delayed",
  "delayMinutes": 30,
  "loggedAt": "2026-09-15T08:47:13.485Z"
}
```

`category` is one of `admin`, `comm`, `creative`, `learning`, `errands`, `physical`. `effortLevel` is one of `quick` (<15 min), `medium` (15–60 min), `deep` (60 min+).

## Demo data

The live artifact is seeded with 64 synthetic-but-plausible logged tasks (via Claude's artifact database tool, not hardcoded in the page) so the patterns and clusters are populated the first time you open it. Add or delete your own tasks from the "Log a task" panel — the analysis recomputes live.

If the page is opened somewhere the `db` capability isn't available (e.g. a raw file preview), it falls back to a small in-memory example dataset, clearly marked as illustrative, so the page never renders empty.
