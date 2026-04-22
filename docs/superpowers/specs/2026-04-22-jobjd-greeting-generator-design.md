# JobJD-Greeting-Generator Design

## Problem

`JobJD-Greeting-Generator` is a reusable skill for Chinese recruiting chat scenarios such as BOSS直聘, 智联招聘, and 前程无忧. It should turn a job description plus candidate background into one concise greeting message that is easy to copy into an IM conversation.

The design goal is to prioritize `jd_url` whenever possible, because a URL can often provide cleaner position and company context than user-pasted text. The skill must not treat URL extraction failure as a hard failure on the first attempt. Instead, it should use a staged fallback strategy and only ask for `jd_text` when multiple extraction routes fail or return unreliable content.

## Scope

This skill does exactly one thing: generate one high-quality greeting message for a recruiting chat.

In scope:

- Read JD content from `jd_url` or `jd_text`
- Normalize key JD fields and candidate fields
- Generate one final greeting for `first_contact`, `follow_up_read`, or `follow_up_silent`
- Respect tone, platform, length, and safety constraints

Out of scope:

- Logging into recruiting platforms
- Sending messages on behalf of the user
- Rewriting resumes or producing full application materials
- Generating multiple variants by default

## User Experience

The default interaction should be simple:

1. User provides `jd_url`, `jd_text`, or both
2. User may provide candidate summary, highlights, status, tone, platform, and scenario
3. Skill extracts or infers JD structure
4. Skill returns one final copy-ready greeting

By default, the skill returns only the final greeting. Structural explanation is optional and should appear only when the user explicitly asks for it or when a debug-oriented workflow needs it.

## Inputs

### Required JD input

At least one of the following must be provided:

- `jd_url`
- `jd_text`

When both are present, the skill should try to extract the primary JD body from `jd_url` first, then use `jd_text` as supplemental material for validation, correction, or missing details.

### Optional override fields

- `position_name`
- `company_name`

These fields always override automatically extracted values. This prevents incorrect page parsing from leaking into the final greeting.

### Optional candidate and context fields

- `candidate_brief`
- `candidate_highlights`
- `candidate_status`
- `hr_role`
- `hr_gender`
- `tone_style`
- `scenario`
- `length_limit`
- `platform`

`candidate_highlights` is the most important optional input because it anchors the greeting in real experience rather than generic praise.

## JD Extraction Strategy

The extraction pipeline should be deterministic and staged.

### Stage 1: Direct page extraction

If `jd_url` is provided, first try to read the target page directly and extract:

- page title
- main heading
- company block
- readable JD body

This route is preferred because it is closest to the source and can preserve explicit labels.

### Stage 2: Readability or third-party text extraction

If the direct page result is empty, too short, obviously shell-only, or blocked by frontend rendering, use a secondary readability-style extraction path. This may be a generic reader proxy or similar service that converts the page into readable text.

This route is best-effort only. It is useful for obtaining JD body text, but it is not treated as more authoritative than the original page.

### Stage 3: Text-based inference

If readable JD text is available but structured fields remain incomplete, infer:

- `position_name`
- `company_name`
- responsibilities
- skill keywords

Inference should be conservative. If a field is not reliable, leave it empty instead of inventing a value.

### Stage 4: User fallback

Only after direct extraction and readability extraction both fail, or after the extracted content remains unreliable, should the skill ask the user to provide `jd_text`.

## Field Precedence and Confidence

Field precedence should be fixed:

1. User-provided override fields
2. Explicit page fields from the source page
3. Explicit fields recovered from readability extraction
4. Fields inferred from JD body text

Confidence should also be handled conservatively:

- High confidence: user input
- Medium-high confidence: explicit title or company block on the page
- Medium confidence: body text inference
- Low confidence: partial or noisy extraction

Low-confidence fields should not be forced into the final message.

## Internal Normalized Model

Before generation, the skill should normalize the input into a single internal object containing:

- `position_name`
- `company_name`
- `jd_body`
- `jd_responsibilities`
- `jd_skills`
- `candidate_identity`
- `candidate_highlights_ranked`
- `candidate_status`
- `scenario`
- `tone_style`
- `length_limit`
- `platform`

This normalized model makes the generator stable even when some source fields are missing.

## Greeting Generation

The message should still be built from three internal components, but the default surface form for `first_contact` should be tighter and more direct:

1. brief greeting
2. years or direction plus strongest match advantage
3. concise action-oriented close

### Opening rule

Use `candidate_brief` and `candidate_status` to form a short opening that gets to value immediately.

For the default `first_contact` output, the opening should follow this order:

1. polite greeting
2. years or direction
3. strongest match advantage

The message should not spend the opening on generic recruiting small talk.

Default prohibitions for `first_contact`:

- do not open with "I noticed your company is hiring..."
- do not open with a standalone "I am [name]..."
- do not spend the first sentence on company or position narration unless the user explicitly wants that style

If the candidate profile is thin, shorten the self-description further and keep the strongest credible advantage.

### JD match points

Extract the most important 2 to 3 JD requirements, then align them with the most relevant 1 to 2 candidate highlights.

Priority order:

1. real project or result
2. directly matching skill or stack
3. domain or scenario familiarity

The message should prefer concrete language over generic self-promotion. For `first_contact`, the strongest matching point should appear in the opening sentence rather than being delayed to a later sentence.

### Closing rule

End with a respectful but compressed action-oriented close. The default close should be one short clause, not a layered polite paragraph.

Preferred shape:

- "Attached is my resume. Looking forward to your reply."
- "Resume attached. Looking forward to hearing from you."
- Chinese equivalents such as "以下是我的简历，盼回复。"

Default prohibitions:

- do not stack "thank you", "wish you smooth work", and "if convenient" in the same close
- do not add empty invitation language when a short resume-forward close is enough
- do not sound demanding, apologetic to excess, or manipulative

## Scenario Rules

### `first_contact`

Focus on:

- direct greeting
- years or direction plus strongest match
- concise resume-forward close

The default first-contact message should feel compact and sharp, not like a cover letter opening.

### `follow_up_read`

Acknowledge the prior contact lightly, then add one useful reinforcement. The tone must avoid complaint or pressure.

### `follow_up_silent`

Treat this as a polite process check-in. Do not mention "read" status. Leave the recipient a clear and respectful exit path.

## Tone Rules

- `正式`: more formal and written
- `自然专业`: default, balanced and practical
- `略活泼`: slightly conversational, but still professional

No emojis, no exaggerated enthusiasm, and no artificial "cute" phrasing should appear in any mode.

## Length Control

The default total limit is `length_limit`, with `100` as the default for first contact unless the caller sets a different value.

If the draft exceeds the limit, compress in this order:

1. remove duplicated company, title, or status phrases
2. remove weak modifiers and filler words
3. shorten result details but keep core keywords
4. preserve the minimum skeleton:
   - identity label
   - at least two core match keywords
   - polite close

Length control must preserve meaning, not just cut by character count blindly.

## Output Contract

Default output:

- one final greeting only

Default style requirements for `first_contact`:

- lead with greeting plus experience or direction plus strongest advantage
- avoid role-narration openings like "I saw your company is hiring..."
- avoid standalone self-introduction openings like "I am [name]..."
- use a concise closing, preferably resume-forward

Optional output when explicitly requested:

- final greeting
- brief structural explanation showing identity tag, match points, and scenario used

The default contract is optimized for direct copy-paste into a recruiting chat.

## Safety and Trust Constraints

The skill must not:

- invent candidate experience, projects, metrics, or education
- generate aggressive follow-up language
- shame or pressure the recruiter
- insert phone numbers, IDs, or other sensitive data unless explicitly given by the user and appropriate for the platform
- encourage sharing forbidden contact details when the target platform disallows it

When data is missing, the generator should reduce specificity rather than fabricate content.

## Failure Handling

If `jd_url` extraction fails:

1. try direct extraction
2. try readability or third-party extraction
3. try text inference on any recovered body text
4. if still unreliable, ask the user for `jd_text`

If both JD structure and candidate highlights are weak, the skill may still generate a shorter, safer greeting, but it should avoid pretending to know details it does not have.

## Testing Expectations

The implementation plan should cover at least:

- direct `jd_url` extraction success
- direct extraction failure with successful readability fallback
- total extraction failure leading to `jd_text` request
- user override of `position_name` and `company_name`
- scenario differences across all three supported scenarios
- first-contact output that avoids generic job-post openings
- first-contact output with concise resume-forward closing
- length compression preserving the minimum skeleton
- safety cases that reject fabricated or pressuring phrasing

## Recommended Implementation Shape

The repository artifact should be a reusable installable skill under `skills/JobJD-Greeting-Generator/`.

The skill should encode:

- when to trigger
- required and optional inputs
- the extraction fallback order
- the field precedence rules
- the generation skeleton
- the safety constraints
- the default output contract

No extra local service is required for the first version. The skill should rely on the agent's available fetch and analysis capabilities, while keeping `jd_url` as the preferred path.
