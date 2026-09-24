---
name: decisions
description: Record a decision Stijn confirmed, or add an open question, in docs/decisions.md. Use whenever a design or scope choice is made or discovered; never invent a decision that was not made.
---

# Recording decisions

`docs/decisions.md` is the only source of truth for what has been decided. Rules:

1. Only record what Stijn (or his partner, via Stijn) actually confirmed in his own words. A recommendation he did not answer is **not** a decision: put it under "Still open" instead.
2. Append to the newest dated round (`## YYYY-MM-DD — <n>th round`) or start a new one for today. Never rewrite history; if a decision changes, add a new row that says "supersedes #N".
3. Each row: running number, topic, the decision in one sentence, notes with the reasoning he gave and any consequence you told him about.
4. Keep the "Still open" list accurate: remove what got answered, add what surfaced.
5. If the decision changes behaviour described in `docs/plan.md`, update the plan in the same commit and mark the line `*decided*`.
6. Commit with a message starting `Record decision:` and push.

When in doubt whether something was decided, ask Stijn in a numbered question and leave it open until he answers.
