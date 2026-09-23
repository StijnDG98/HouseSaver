# Decisions

Confirmed decisions, newest at the bottom. Anything not listed here is still open or is a builder choice recorded in the plan.

## 2026-09-23 — answers to the handoff review (section 5A)

| # | Topic | Decision | Notes |
|---|---|---|---|
| 1 | Hosting | Cloudflare Workers (static assets) + D1 (`jurisdiction=eu`) + R2 (`jurisdiction=eu`) + Cloudflare Access | Cloudflare was a recommendation Stijn accepted, now confirmed as a conscious choice. DB, file store and identity stay behind interfaces so a later NAS move is an adapter swap; the dump-to-local-SQLite migration is rehearsed in phase 1. |
| 2 | Visibility of private-account lines | Configurable in the app's settings | Proposed shape: per-user, each person controls whether *their own* private-account lines are visible to the other (default: visible). Not one global switch. |
| 3 | Private tags | Keep | Per-user metadata on transactions and receipt items; never used in shared computations; included in a user's own export only. |
| 4 | "Saved" | Income minus spending, wherever the money sits | Headline figure. Under it: "moved to savings/investments" and "left on current accounts". |
| 5 | Per person | Three tabs: Stijn / partner / shared | The personal tab is split into current account, savings account(s) and credit card. A transfer into the shared account counts as that person's outflow. |
| 6 | Credit cards | Both have one | Card statements become a phase-1 import; the monthly settlement on the current account is a transfer to the card account. Card issuer/bank to confirm. |
| 7 | Money flow | Wages land on each personal current account. Rent, fixed costs and groceries are paid from the shared current account. No joint savings account. | Contributions to the shared account are personal→shared transfers. |
| 8 | Language | Dutch UI, single language, no i18n framework | Repo, code and conversations in English. |
| 9 | Devices | Phone, PC, tablet | Responsive layout from day one; phone-friendly upload flow. |
| 10 | Cloudflare account | Stijn's account; card on file accepted | Partner logs in through Access only. |

## Still open (handoff review section 5B)

Cash policy; bonuses in the projection and the saving-rate window; voucher source and issuers; Colruyt payment method, e-mail receipts and a sample receipt; projection house type, province and horizon; max-bid inputs (borrowers, existing loans, property owned, purpose of rent); range vs scenarios; goal line; build order; category seed list.
