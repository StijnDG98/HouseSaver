# Household money tracker — handoff

Status: brainstorm finished, nothing built yet. This document carries the decisions from the brainstorm into the build project.

## Why this app exists

Two people (Stijn and his girlfriend) want to buy a home in Flanders in the coming years. On paper they should be able to save much more per month than they actually do. The gap is roughly €1,500/month that nobody can account for.

The app has two jobs:

1. Show where the money actually goes.
2. Show what their real saving behaviour means for the future: "at this pace, in X years you'd have €… and could bid about €… on a house".

Private tool for exactly two users. It will never be published or shared with anyone else.

## Non-goals

- **No goal tracking.** No progress bars toward a target. The projection replaces that.
- **No manual entry of every expense.** Bank exports are the backbone. Manual entry exists only for the few things that have no export.
- **No direct bank connection (PSD2/API).** Monthly CSV upload is enough and keeps it simple.
- **No public or multi-household use.**

## Users and privacy

- Two users, both with full access.
- **Everything is shared between the two users, except tags.** Tags or labels a user adds to a transaction or a receipt item are private to that user.
- Login is restricted to their two email addresses.

## Accounts and data sources

All bank, savings and investment accounts are at **Belfius**.

| Source | What | How it gets in |
|---|---|---|
| Belfius, private account (×2, one each) | Transactions | Monthly CSV export from Belfius Direct Net (website) |
| Belfius, shared account | Transactions | Monthly CSV export |
| Belfius, savings accounts (at least one each) | Transactions + balance | CSV export, plus monthly balance |
| Belfius, investment accounts | Value | Typed in once a month |
| Colruyt digital receipts | Item-level grocery purchases + payment split | PDF upload. Confirmed: **real text PDF**, not a scanned image |
| Meal voucher spending | Monthly amount per person | Typed in, or derived from the voucher part of Colruyt receipts |

**Belfius CSV format is not yet verified.** Get a sample export (personal details blanked) before writing the importer. Expect Belgian formatting (decimal comma, possibly semicolon separator), but confirm on the real file.

## Data rules (the important ones)

1. **Own transfers are not income or spending.** The app knows all of the couple's own IBANs. Any movement between private, shared, savings and investment accounts is a transfer, never an expense.
2. **Meal vouchers stay out of both income and spending.** They never touch the bank accounts, so excluding them on both sides keeps the savings figure correct. Voucher spending is tracked for information only (true food cost = bank grocery spending + voucher spending).
   - They try to spend all vouchers each month on shared groceries, mostly at Colruyt.
   - Voucher spending outside Colruyt is not tracked. This gap is accepted.
3. **A receipt splits an existing bank transaction, it never adds a new one.** The bank-card part of a Colruyt receipt is matched to the Belfius transaction (same amount, same or near date) and broken down into items. The voucher part of the receipt is logged as voucher spending. Nothing gets counted twice.
4. **Holiday pay and year-end bonus are separate income lines.** They are not included in the couple's view of their monthly savings. Keep them visible so it's clear whether they get saved or spent.
5. **Savings return = balance change − net deposits.** Belgian savings accounts pay interest in lumps, so the return line will be uneven. That's expected.

## Categorisation

- Rule-based on counterparty name and description ("COLRUYT" → groceries). Rules are learned once and reused.
- Unknown transactions go to a review queue. The user picks a category once, and a rule is created.
- Colruyt item names are heavily abbreviated. Keep a reusable mapping from receipt item name to category.
- AI categorisation is optional and later, not a requirement.

## Views

1. **This month:** in, out, saved. Household total and per person.
2. **Where it goes:** spending per category and per counterparty, compared with previous months. This is the view that should reveal the missing €1,500/month.
3. **Groceries:** item-level detail from Colruyt receipts. Shows voucher vs bank-card split.
4. **Savings and returns:** balance per account over time, split into own deposits and interest/return.
5. **Projection:** see below.

## Projection logic

The projection answers: "at our actual pace, in X years we'd have €… and could bid €…".

- **Saving rate:** based on actual saving over the last few months, not on a target.
- **Output:** a range (low / expected / high), not a single number.
- **Show the expected house price next to it.** Take today's median and let it grow by an adjustable percentage per year. Reference (Statistiek Vlaanderen, 2025): terraced/semi-detached €317,100, detached €430,000, apartments €260,000. Flanders terraced/semi-detached prices rose 5.7% from 2024 to 2025.

### Max-bid calculation

This follows the logic behind leenhelder.be. The bid is the highest price where BOTH limits hold:

- **Loan-to-value limit:** loan ≤ 90% of the price. Own money must cover the other 10% plus all purchase costs.
- **Income limit:** monthly loan payment + €35 insurance ≤ 38% of net household income. This caps the loan (annuity, e.g. 3.5% over 25 years).

Purchase costs on top of the price (Flanders, only home):

- Registration duty: 2% of the price.
- Notary fees (purchase deed + credit deed, incl. VAT): official scale, roughly €3,900–4,000 around €330–360k.
- Mortgage duties: 1% + 0.3% on a registration of 110% of the loan.
- Fixed notary deed costs: about €1,793.
- Bank file costs: about €350.

Every parameter must be adjustable in settings: 38%, 90%, interest rate, term, insurance amount, cost figures, price growth.

Scenario inputs:

- Salary raises.
- Stijn switching from 4/5 to 5/5.
- A different saving rate.

Note for the builder: below the point where the two limits meet, each extra €1 of own money adds about €7.30 of bid. Above it, it adds roughly €0.98. The projection should make this visible, because it changes what's worth doing.

**Real household figures (income, rent, savings) are entered in the app's settings. Don't hardcode them and don't commit them to the repository.**

## Hosting

- **Cloudflare free tier:**
  - Pages for the app.
  - D1 as the database (SQLite).
  - R2 for receipt PDFs.
  - Cloudflare Access for login (free up to 50 users; restrict to the two email addresses).
- Must include an **"export everything" button**. Free tiers can change terms, and the data must never be stuck.
- **Keep it portable.** D1 is SQLite, so a later move to a Synology NAS (Docker) stays easy. A NAS is a possible later step if they want one for photos and backups too.

## Build order

1. **Phase 1:** Belfius CSV import, own-transfer detection, categorisation rules + review queue, "This month" and "Where it goes" views. This alone answers the €1,500 question.
2. **Phase 2:** Colruyt receipt import, matching to bank transactions, groceries view, voucher spending.
3. **Phase 3:** Savings and returns (monthly balances, deposits vs return, investments).
4. **Phase 4:** Projection.
5. Throughout: private tags per user, export button.

## Open items

- **Blocking before phase 1:** get a sample Belfius CSV export and verify the format.
- **Blocking before deploying real data:** check whether Cloudflare's free tier can keep the data on EU servers (D1 and R2).
- **Non-blocking:** check whether a Colruyt receipt shows whose voucher card was used when both pay with vouchers. Probably doesn't matter for shared groceries.
- **Non-blocking:** interface language (Dutch or English).
