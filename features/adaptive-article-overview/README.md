# Adaptive Article Overview

Creates article overviews based on the article and the user's approved reading memory.

This v0 feature is deterministic. It does not call external APIs and does not pretend to be a full AI summary. It chooses a useful overview style from the article input and approved reading memory.

## Input

- `article`: title, excerpt/body, topic, source, and estimated read time.
- `reading_memory`: approved reading patterns such as average read time, scroll depth, finish rate, preferred topics, skipped topics, and preferred summary style.
- `recent_events`: optional recent article events.

## Output

- `summary_style`
- `overview`
- `why_this_style`
- `follow_up_suggestions`
- `confidence`
- `signals_used`

## Guardrails

- No external APIs in v0.
- No sensitive trait inference.
- Only use provided article data and approved reading memory.
- Return low confidence when reading memory is weak.
