# leetcode-coach skill design

## Problem

The `skills/leetcode-coach` skill needs three behavior-level improvements:

1. Add a persistent global learning record for algorithm patterns learned across study sessions.
2. Add a dedicated `README.md` for humans to understand how the skill works.
3. Make concept explanations more plain, concrete, and beginner-friendly when the learner says they do not understand a concept.

The changes should preserve the existing coaching style: staged guidance, delayed code answers, and interview-oriented thinking.

## Proposed approach

Keep the current skill structure and make a focused documentation-and-behavior update:

- extend `SKILL.md` with explicit rules for global progress tracking and plain-language concept teaching
- add `references/global-learning-log.md` as the shared record file
- add `README.md` as the user-facing guide

This keeps the skill lightweight while making the new behavior explicit and repeatable.

## Scope

### In scope

- update the skill instructions in `skills/leetcode-coach/SKILL.md`
- add a global learning log template at `skills/leetcode-coach/references/global-learning-log.md`
- add `skills/leetcode-coach/README.md`
- define when and how the coach should write or reference the global record
- define a fixed plain-explanation mode for unknown concepts

### Out of scope

- changes to `playground.js`
- changes to unrelated skills
- adding persistence outside the repository
- changing the core stage-gate coaching model

## Design

### 1. File responsibilities

#### `skills/leetcode-coach/SKILL.md`

Add or revise guidance so the skill explicitly covers:

- checking prior learning history through the global record
- updating the global record after completing a pattern-focused drill
- switching into a plain-explanation mode when the learner says a concept is unclear

The current structure should remain recognizable. The update should fit into the existing sections rather than rewriting the skill from scratch.

#### `skills/leetcode-coach/references/global-learning-log.md`

Add a persistent record template that the coach can reuse across sessions.

Recommended fields:

| Field | Purpose |
| :--- | :--- |
| Date | when the pattern was studied |
| Algorithm pattern | what category was practiced |
| Mastery status | current confidence or completion state |
| Notes | key weakness, reminder, or next step |

The file should contain a brief instruction section plus a starter table with sample rows so the format is obvious.

#### `skills/leetcode-coach/README.md`

Add a practical README that explains:

- what the skill is for
- who should use it
- the coaching stages
- how the global learning log works
- how concept explanations are handled
- which reference files exist

### 2. Training flow updates

#### Global record usage

The coach should treat pattern history as part of the normal workflow:

- at the start of a fresh session, the coach may use the global record to avoid repeating a recently studied pattern
- at the end of a completed drill, the coach should remind the learner to record the pattern in the global file
- when suggesting the next topic, the coach should prefer weak or incomplete patterns over comfort-zone repetition

This is a lightweight memory aid, not a full learner profile system.

#### Plain-explanation mode

When the learner says a concept is unclear, abstract, or still confusing, the coach should switch to a fixed four-step explanation order:

1. **Plain-language summary** — one sentence in everyday Chinese
2. **Real-life analogy** — map the concept to something familiar
3. **Minimal example** — the smallest concrete example that shows the idea
4. **Return to algorithm meaning** — reconnect the intuition to the formal interview usage

This mode should not bypass the coaching flow or jump straight to full code. Its goal is comprehension, not shortcutting the drill.

### 3. Content consistency

The three files should reinforce the same behavior:

- `SKILL.md` defines what the coach must do
- `README.md` explains the behavior in user-friendly language
- `global-learning-log.md` gives the exact recording format

Cross-references between these files should be added where useful so the workflow is discoverable.

## Error handling and constraints

- Do not add vague instructions like "explain more simply if needed"; the plain-explanation trigger and sequence should be explicit.
- Do not require external storage or tooling.
- Do not weaken the existing stage gate by giving code too early just because the learner asked for simpler explanations.

## Validation goals

After implementation:

- the skill documentation should clearly mention the global learning record
- the new README should make the skill understandable without reading only `SKILL.md`
- the concept explanation flow should be specific enough that future sessions consistently produce simpler explanations

## Implementation notes

- prefer surgical edits to existing sections in `SKILL.md`
- keep wording concise and operational
- keep all new files in ASCII-compatible Markdown
