# HouseSaver — build plan

Status: decisions closed for the build to start (see `decisions.md`); formats verified (see `sources.md`); UI direction in `mockup/`. This plan is the builder's contract. Anything marked _builder choice_ can be changed without asking; anything marked _decided_ traces to `decisions.md`.

## 1. What the app does, in one paragraph

Two people upload Belfius statement PDFs (current, savings, Mastercard) and Colruyt receipt PDFs whenever they like. The browser extracts the text, the server parses each document, refuses any that does not reconcile against its own totals, stores the transactions once, links own transfers between the couple's accounts, categorises by rules, and shows five views: this month (household and per person), where it goes, groceries, savings and returns, and a projection of own money and maximum bid with user-defined scenarios. Everything is exportable in one zip.

## 2. Stack (builder choices unless marked)

| Layer    | Choice                                                                                              | Why                                                                    |
| -------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Hosting  | Cloudflare Worker with static assets; D1 `jurisdiction=eu`; R2 `jurisdiction=eu`; Cloudflare Access | _decided_                                                              |
| Language | TypeScript everywhere                                                                               | one language, shared types between parser, API and UI                  |
| Server   | Hono on the Worker                                                                                  | tiny router, runs on workerd and Node, typed routes                    |
| Database | Drizzle ORM + SQL migration files; D1 in prod, better-sqlite3 locally and on a future NAS           | same schema on both; migrations committed to the repo                  |
| Frontend | React + Vite + Tailwind; charts as hand-drawn SVG components (as in the mock-up)                    | responsive from day one; no chart library to fight                     |
| PDF text | pdfjs-dist in the browser; the server receives text lines with positions plus the original file     | keeps the Worker under the 10 ms CPU limit; the file is archived in R2 |
| Tests    | Vitest on the `core` package with anonymised fixtures                                               | the value is in a few pure functions                                   |
| CI       | GitHub Actions: typecheck + tests on every push; deploy to Cloudflare from `main`                   |                                                                        |
| Money    | integer cents everywhere; Belgian formatting only in the UI                                         | no float rounding                                                      |
| Language | Dutch UI, English code and docs                                                                     | _decided_                                                              |

Repository layout:

```
packages/core      pure TypeScript, no I/O: parsers, classifier, dedup, matcher, rules, projection maths
packages/db        Drizzle schema + migrations
apps/worker        Hono API + static asset serving + Access JWT check + R2/D1 bindings
apps/web           React UI
fixtures/          anonymised PDFs and expected JSON (synthetic; never real files)
docs/              this folder
```

Portability seams (so the NAS move is an adapter swap): `Db` (Drizzle instance), `FileStore` (`put`, `get`, `list`), `Identity` (`getCurrentUser(request)`). Nothing else may import Cloudflare types.

## 3. Data model

All amounts in integer cents. All dates ISO strings. `id` columns are ULIDs.

- **users** — id, email, display_name. Seeded with the two addresses.
- **accounts** — id, iban (or card number, masked, for the card accounts), owner (`stijn` | `partner` | `shared`), type (`current` | `savings` | `investment` | `card`), name, counts_as_own_money (bool), opening_balance, opening_date. The own-IBAN registry: any counterparty in this table is an own transfer.
- **documents** — id, kind (`belfius_statement` | `belfius_card_statement` | `colruyt_receipt`), account_id, r2_key, sha256, uploaded_by, uploaded_at, period_start, period_end, statement_number, opening_balance, closing_balance, reconciled (bool), row_count, notes. One row per uploaded file; the same sha256 is never imported twice.
- **transactions** — id, account_id, document_id, seq_number (Belfius NNNN; card row index), booking_date, value_date, amount, description (masked), counterparty_iban, counterparty_name, merchant_key (normalised), cardholder, purchase_ts (from the text), kind (`income` | `expense` | `transfer` | `fee` | `card_settlement` | `cash`), category_id, category_source (`rule:<id>` | `manual` | `receipt`), transfer_group_id, dedup_key (unique: account_id + year + seq_number, falling back to a content hash).
- **transfer_groups** — id, created_at. Two transactions with the same group are the two legs of one own transfer; a single-member group is an own transfer whose other statement has not been uploaded yet.
- **categories** — id, name, description, kind (`expense` | `income`), sort_order, archived. Seeded: huur, boodschappen, eten buitenshuis, vervoer, abonnementen, gezondheid, cadeaus, cash, overige, plus income categories loon and overige inkomsten. Names and descriptions editable (_decided_).
- **rules** — id, priority, field (`counterparty_iban` | `merchant_key` | `description`), operator (`is` | `contains` | `starts_with`), value, category_id, created_by, created_from_transaction_id. Shared between users (_decided_).
- **merchants** — merchant_key, display_name, default_category_id. Alias layer so `3536 COLRUYT WETTEREN` and `COLRUYT WETTEREN 3536` are one merchant.
- **receipts** — id, document_id, store, ticket_number, order_number, purchased_at, total, xtra_discount, status (`pending` | `matched` | `manual` | `no_bank_part` | `orphan`).
- **receipt_payments** — receipt_id, method (`bancontact` | `voucher` | `cash` | `other`), issuer (e.g. `Pluxee / Sodexo`), amount, paid_at, transaction_id (nullable; set when matched).
- **receipt_items** — receipt_id, line_no, article_nr, name, quantity (×1000), unit_price, amount, section (`goods` | `service` | `deposit`), discount_amount, item_group_id.
- **item_groups** — id, name, is_food (bool). Reusable mapping keyed by article_nr in **article_map** (article_nr → item_group_id).
- **investment_values** — account_id, as_of_date, value. Typed in.
- **scenarios** — id, name, created_by, overrides (JSON: any subset of the projection parameters). User-defined (_decided_).
- **settings** — key, value (JSON). Includes: projection defaults, purchase-cost parameters, goal amount (shared), visibility consents (one per user), price references with source and date.
- **tags** and **tag_links** — per-user private labels on transactions and receipt items (_decided_).

## 4. Core algorithms

### 4.1 Import pipeline

1. Browser: read the PDF with pdfjs, extract text items with x/y positions per page, detect the document kind from header text, and post `{kind, pages, fileBytes}`.
2. Server: parse with the kind-specific parser (below), compute the reconciliation, and **refuse the whole file** if it fails. Store the file in R2, the document row, and the transactions with an idempotent upsert on `dedup_key`. Report `new / duplicate / changed` counts.
3. After every import: run transfer pairing, then rules, then receipt matching, in that order.

Parsers (all verified on real files, see `sources.md`):

- _Belfius statement_: split pages at half width when the page is a two-column layout (savings statements); header `SALDO OP` → opening; lines `NNNN dd-mm-yyyy (VAL. dd-mm-yyyy) ±amount`; indented continuation lines form the description; closing `SALDO OP … hh:mm`. Guard: opening + Σ = closing.
- _Belfius card statement_: period and debit date from the header; rows `dd/mm dd/mm merchant city CC [amt CUR] amt EUR-`; country code = last two-letter token before the amounts. Guard: Σ rows = `Totaal`.
- _Colruyt receipt_: item rows under the column header; discount rows (`%`, `33.34%` or a plain quantity); `SERVICE EN WAARBORGEN` section; `Te betalen`; one payment line per method, possibly on the next page. Guard: Σ items + Σ discounts = `Te betalen` and Σ payments = `Te betalen`.
- Masking: every `KAART NR dddd dddd dddd dddd` becomes `dddd ddXX XXXX dddd` before the description is stored.

### 4.2 Transaction kind classifier (runs before rules)

In order: counterparty IBAN in `accounts` → `transfer`; `MASTERCARD AFREKENING` → `card_settlement` (and a transfer to the card account); `OPVRAGING SPECIEN` / `GELDOPNEMING` → `cash` (expense, category cash; _decided_); `STORTING SPECIEN` → income (_decided_); fee wordings (`BIJDRAGE IN DE BEHEERSKOSTEN`, `AANVULLENDE BIJDRAGE`, `KOSTEN`) → `fee`; interest wordings (`CREDITINTERESTEN`, `GETROUWHEIDSPREMIE`) → income kind `return`; `ROERENDE VOORHEFFING` → negative return; positive amount → `income`; else `expense`. Partner-to-partner payments over the Bancontact app (`P2P MOBILE`, no IBAN) → review queue with a suggested "own transfer".

### 4.3 Transfer pairing

For each `transfer` without a group: find a transaction on the counterparty account with opposite amount, value dates within 3 days, not yet grouped → same group. Otherwise a single-member group. Both legs are excluded from in/out; single-member groups show an "other statement not uploaded yet" hint.

### 4.4 Figures

- household.in = Σ income (all accounts); household.out = Σ expense + fee + cash + card purchases (from card statements; the settlement line is a transfer); household.saved = in − out.
- moved_to_savings = Σ transfers into accounts with type savings or investment, net; left_on_current = saved − moved.
- person.in = income on their accounts; person.out = expenses on their accounts (current + card) + net transfers into the shared account; person.saved = in − out. shared.in = contributions; shared.out = its expenses. Stijn.saved + partner.saved + shared.saved = household.saved by construction (_decided_).
- Month = booking-date month. "This month" defaults to the last month whose statements are all imported.
- Vouchers never enter any of the above; the groceries view adds them for "echte voedingskost" (_decided_).

### 4.5 Receipt matching

Candidates: transactions with merchant_key containing `COLRUYT`, amount equal to the receipt's Bancontact payment, value date in [purchase date, purchase date + 4 days]; prefer a `purchase_ts` within 2 minutes of the receipt's payment time. Exactly one candidate → `matched`, the transaction's category breakdown becomes item-based. Several → review queue. None yet → `pending`, retried after every import. Bancontact part zero → `no_bank_part`. Voucher amount is allocated to food item groups first, remainder to the card (_decided_). Deposits (`WAARBORG`) are their own item group, not groceries.

### 4.6 Projection

Inputs (all adjustable on the screen; _decided_): horizon in years; house type (Oost-Vlaanderen medians, halfopen / open); price growth %; interest rate; term; LTV cap; income share; monthly insurance; purchase-cost parameters; savings return; own-money start (Σ balances of accounts flagged `counts_as_own_money` at the last complete month); net household income (default: median of the last 6 salary months); goal amount (shared).

Saving rate: window = 6 complete months (setting). expected = median of monthly household.saved; low/high = the mean of the 2 lowest / 2 highest months excluding the single extreme month, so one bonus month cannot set the band. Scenarios override any parameter and are drawn as extra lines.

Max bid: the highest price where loan ≤ LTV × price and payment + insurance ≤ share × income, own money covering price − loan + costs. Costs: 2 % duty; notary scale (KB 1950 brackets + 21 % VAT, 2023 reductions) on price and on loan × accessories; 1 % + 0.3 % on loan × 1.10; fixed deed costs; dossier costs. Payment uses the equivalent monthly rate `(1+i)^(1/12) − 1`. Kink = price where the two limits meet; the screen states the marginal € of bid per € saved on each side.

House-price reference: table `price_references` (type, region, period, value, source, fetched_at). "Refresh" tries the Statbel be.STAT API from the Worker; on failure the UI shows the stored figures with their date and a link to Statbel for manual entry (_decided_).

## 5. Identity and privacy

- Access protects every route; the Worker verifies the `Cf-Access-Jwt-Assertion` JWT against the team's public keys and maps the email to `users`. Local dev uses a fixed test user and refuses to start with prod bindings.
- Visibility of the other person's private-account lines is on only while both consents in `settings` are true (_decided_). Totals are always shared.
- Tags are filtered by user in every query.
- No transaction detail is ever logged. Card numbers are masked at parse time. Real files never enter the repo; fixtures are synthetic.
- Export: one zip with the SQL dump (D1 export API), JSON per table, and every original PDF; the exporting user's own tags only. The same code runs as a script for backups.

## 6. Phases and exit criteria

**Phase 0 — scaffold (no user input needed).** Monorepo, Worker + static assets, Drizzle migrations, CI, dev identity shim, `.gitignore` for data files. Exit: a hello-world deploy to `workers.dev` behind Access with both emails.

**Phase 1 — import and the €1,500 question.** Three PDF parsers with reconciliation and fixtures; account registry screen; upload screen (any time, any order); dedup; classifier; transfer pairing; rules + review queue; merchant aliases; categories editable; This-month view with the four tabs; Where-it-goes view; export zip + backup script. Exit: a full month of real statements imports cleanly, reconciles, and the household and per-person figures agree with a hand calculation; an export has been restored into a local SQLite file once.

**Phase 2 — savings and projection** (_decided_: order B). Savings statements (two-column parsing); interest as return; investment values typed in; Savings view; projection screen with all parameters adjustable, user-defined scenarios, low/expected/high, goal line, kink text; price references with refresh. Exit: the projection reproduces the mock-up's example numbers from the same inputs, and a leenhelder.be example within 1 %.

**Phase 3 — receipts.** Receipt parser (Collect&Go and in-store); matching; voucher allocation; article map; Groceries view. Exit: the two real receipts match their statement lines automatically.

**Phase 4 — polish.** Private tags; recurring-costs panel; Statbel refresh hardening; phone upload flow (share-to-app if wanted); anything from the mock-up remarks.

## 7. Open builder items (no user input needed)

- Confirm pdfjs text extraction gives stable line grouping for the two-column savings statement in the browser (the server prototype used cropping; the browser version will group by x-position).
- Decide whether the Worker also accepts raw PDFs for server-side parsing with `unpdf` as a fallback if a phone browser struggles; measure CPU first.
- Notary scale: calibrate against the notaris.be calculator once the environment can reach it (network allow-list).
