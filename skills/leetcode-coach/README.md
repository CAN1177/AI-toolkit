# leetcode-coach

`leetcode-coach` is a Chinese-first interview-prep coaching skill for LeetCode and algorithm drills. It keeps the original "teach first, code later" stage gate, but now also supports a lightweight persistent pattern tracker and clearer concept explanations for learners who get stuck on fundamentals.

Chinese version: [README.zh-CN.md](README.zh-CN.md)

## Files

| File | Purpose |
| :--- | :--- |
| `SKILL.md` | Main coaching rules, stage flow, concept rescue mode, and progress-tracking instructions |
| `references/pattern-ladder.md` | Recommended pattern progression for choosing the next drill |
| `references/pattern-progress.md` | Global pattern-level study record, one row per algorithm type |
| `references/training-log-template.md` | Optional session recap template |
| `playground.js` | Local scratch playground for experiments |

## Expected workflow

1. Before opening a new drill, read `references/pattern-progress.md`.
2. Pick the next problem based on the learner's weak pattern instead of repeating comfort-zone questions.
3. If the learner is blocked by a concept, explain it in plain Chinese with a small analogy and tiny example before pushing for code.
4. Keep validation light: once the learner's direction is clearly right, confirm the key point and move on.
5. After the learner finishes or meaningfully practices a pattern, update the corresponding row in `references/pattern-progress.md`.

## Pattern progress file

`references/pattern-progress.md` is intentionally simple:

- one row per algorithm type
- compact updates instead of long session logs
- enough information to decide "what should we practice next?"

Recommended fields:

- `Status`
- `Last practiced`
- `Weak point`
- `Next suggested problem`

Use `references/training-log-template.md` only when a detailed per-session summary is actually useful.
