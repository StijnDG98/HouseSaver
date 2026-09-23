# Handoff review — 23 September 2026

Review of `handoff-brainstorm.md`. Goal: separate what Stijn actually decided from what the brainstorm assistant filled in, and check every factual claim against sources.

How this was done: six research passes with web sources (one per topic), each re-checked by a sceptic looking for independent sources; three audits of the document itself (product, data model, engineering); a completeness critic over all of it; and my own arithmetic on the max-bid model. Many Belgian primary sites (belfius.be, notaris.be, statbel.fgov.be, vlaanderen.be, leenhelder.be, nbb.be) are blocked from this sandbox, so several facts rest on GitHub-hosted copies of real data, open-source parsers and search snippets. Where that weakens a finding, it says so.

Classification used below:

- **yours**: specific or personal enough that an assistant would not invent it.
- **agent default**: generic best practice, or a choice with obvious alternatives the document never mentions, or phrased as "confirmed" / "accepted" without a reason or an owner.
- **fact**: a factual claim, checked.
- **gap**: something the build needs that the document does not say.

---

## 1. Short verdict

The handoff is a good brainstorm summary but it is not a decision record. Roughly a third of its bolded statements are the assistant's defaults presented as settled: the whole hosting stack, "everything shared except tags", the monthly upload cadence, "voucher gap accepted", the low/expected/high range, the five views, and the build order. None of those is wrong as such; they just were not decided by you, and several have better alternatives.

The factual content is mostly right. Corrections that matter:

- Cloudflare **Pages** is the wrong target. Cloudflare says "start new projects with Workers"; Pages gets no new features. Same free tier, one Worker with static assets instead.
- EU residency is **solved, not open**: D1 has had a hard `eu` jurisdiction since 5 Nov 2025 and R2 has one too. Both must be set at creation and cannot be changed later. What is *not* EU: where the Worker code runs, Workers logs, and Cloudflare Access login logs (US only, at any plan).
- The "free tier" needs a **payment card on file** for both R2 and Zero Trust (Access). Nothing is charged at your volume.
- The **Belfius CSV format is now known** from real 2025–2026 exports published on GitHub, including savings accounts. The sample from you is still wanted to confirm encoding and a few line types, but it no longer blocks the importer design.
- The savings CSV **contains the interest lines** (`CREDITINTERESTEN` yearly, `GETROUWHEIDSPREMIE` quarterly), so the typed monthly balance and the "balance change minus deposits" formula are only needed for investment accounts.
- **Credit cards are invisible** in the current-account CSV: a Belfius Mastercard shows as one monthly `MASTERCARD AFREKENING` debit. If either of you uses one, phase 1 cannot answer the €1,500 question on its own.
- The **5.7 % price growth** is a one-year outlier for one house type. The 10-year average for Flanders is about 4 % per year. The 2025 medians are right but Statbel has since revised two of them slightly, and Q1 2026 figures exist.
- The **38 % / €35** income rule is leenhelder's assumption, not a rule. Banks use one-third to 40–45 % plus a residual-income test, and €35/month of insurance is far too low for two borrowers.
- The **€7.30 / €0.98** marginal figures are correct. My recomputation gives about €7.45 and €0.98; the spread (7.0–7.5) depends only on the notary bracket.

New blocking facts the handoff does not mention:

- Belfius exports are **chunked at about 350 rows** and statement/transaction numbers are **empty for weeks** and restart every year, so the obvious dedup key does not work.
- Workers Free allows **10 ms CPU per request**; parsing a PDF inside the Worker will probably exceed it. Parse in the browser instead.
- The Xtra app **keeps receipts only 3 months** after your last app use; the e-mailed PDF is the archive.
- Whether a Colruyt PDF prints the **voucher / card split** and card digits is unverified by any public source. One real receipt settles it and should be a blocking item before phase 2.

---

## 2. Decision-by-decision

### Why this app exists

| Handoff says | Read | Note |
|---|---|---|
| €1,500/month gap nobody can account for | yours | The "on paper" figure it is compared against is never defined. If the paper budget counts meal vouchers as income, the gap is overstated by the voucher amount. Worth writing down once so the app's "saved" can be compared with it. |
| Two jobs: where it goes, and the projection | yours | Fine. |
| Private tool, two users, never published | yours | Fine, but see hosting: a Cloudflare app still has a public hostname behind a login. |

### Non-goals

| Handoff says | Read | Note |
|---|---|---|
| No goal tracking, "the projection replaces that" | probably yours | Bolded and reasoned, so I lean "yours". Still worth one question: the max-bid calculation already produces "own money needed for a €X house", which is one horizontal line on the projection chart. Is that line wanted, or is even that too much? |
| No manual entry of every expense; manual only for "the few things that have no export" | yours, gap | The "few things" are never listed. Cash is the obvious one and a classic hiding place for €1,500. Needs a list. |
| No PSD2/API; "monthly CSV upload is enough and keeps it simple" | yours (the non-goal), agent (the "monthly") | "Monthly" is repeated throughout but never justified. Belfius exports any date range and real usage is "whenever I think of it", so the importer must accept any range, overlaps and multiple files regardless. Also worth stating whether "no bank connection" is permanent or "not in v1". |
| No public or multi-household use | yours | Fine. |

### Users and privacy

| Handoff says | Read | Note |
|---|---|---|
| Two users, both full access | yours | Fine. |
| Everything shared except tags; tags are private per user | agent default | Suspiciously tidy. Full mutual visibility of each other's private-account line items is a real personal decision the document does not record discussing, and it is your partner's privacy too. Private tags look like a concession invented to soften "everything shared", and they add a per-user data model for a feature nobody is recorded as asking for. Two questions: (a) do you both see every line on each other's private accounts, or only totals? (b) did either of you ask for private tags? |
| Login restricted to two email addresses | yours | Works on Cloudflare Access with the "Emails" selector. Note: new Zero Trust accounts default to a Cloudflare-managed login restricted to account members, so One-time PIN or Google must be added as identity provider explicitly, or your partner cannot log in. |

### Accounts and data sources

| Handoff says | Read | Note |
|---|---|---|
| Everything at Belfius | yours | Missing from the table: credit cards (see verdict), and pension savings or fund accounts, which in a real Belfius export appear as a standing order to an IBAN in the owner's own name, so they must be on the own-IBAN list or they count as spending. |
| Private accounts: monthly CSV from Belfius Direct Net (website) | fact, confirmed | belfius.be still calls the web banking "Belfius Direct Net" in its FAQ; export via "Exporteren" → Excel (CSV) or PDF. No CSV export from the mobile app is documented. |
| Savings accounts: CSV plus a typed monthly balance | agent default | Same 15-column CSV. Interest is explicit lines with no counterparty. The export carries one balance (`Laatste saldo` at export time), which is a reconciliation anchor, not a monthly series. Typed balances are unnecessary for savings accounts. |
| Investment accounts: value typed in once a month | fact, unverified | No public evidence of a Belfius investment-account export; keep manual entry. Deposits into them arrive in the current-account CSV as own transfers if the IBAN is registered. |
| Colruyt receipts: PDF upload, real text PDF | yours (confirmed) | Confirmed by two open-source parsers running on real `Kasticket_DDMMYYYY_HHhMM_<nr>.pdf` files. What is *not* confirmed publicly: that the PDF prints the payment block (voucher vs card, issuer, card digits) and a receipt number. |
| Meal vouchers: typed in, **or** derived from receipts | gap | Two mechanisms joined by "or" with no precedence; the typed option contradicts "voucher spending outside Colruyt is not tracked". |
| "CSV format not yet verified" | outdated | Now known; see section 3. |

### Data rules

| Handoff says | Read | Note |
|---|---|---|
| 1. Own transfers are not income or spending; app knows own IBANs | yours, correct | Edge cases that break a pure IBAN rule: card-rail payments (no IBAN), partner-to-partner payments through the Bancontact app on the card rail (`P2P MOBILE`, no IBAN), credit-card settlement (legacy non-IBAN counterparty), cash. Each transfer appears twice (once per account CSV); classify from one leg by IBAN so the figure is right before the other file is uploaded, and warn on unpaired legs. |
| 2. Meal vouchers stay out of both sides | correct | Arithmetically sound for "saved = bank in − bank out". Label income as "bank income" so the person with more vouchers is not silently under-counted. |
| 2a. "Voucher spending outside Colruyt is not tracked. This gap is accepted." | agent default | "Accepted" has no owner and no reason. Issuer apps (Edenred, Pluxee, Monizze) show balance and history but offer no cardholder export. A monthly per-person figure is still a one-minute lookup: vouchers credited that month minus the change in app balance. That closes the gap with one number per person per month. |
| 3. A receipt splits a transaction, never adds one | yours, correct | Underspecified: match on the card-paid part (not the receipt total), on `Valutadatum` or the embedded `dd/mm/yy hh:mm` timestamp (booking lags 0–4 days around weekends and holidays), require exactly one candidate, and handle: fully voucher-paid receipts (no bank line), a basket split over two cards, refunds, the same PDF twice, receipts uploaded before the month's CSV. |
| 4. Holiday pay and year-end bonus are separate income lines | yours | Detection: at least one real employer writes `/A/ Vakantiegeld 2026` vs `/A/ Wedde november` in the message, so a description rule works; amount heuristic as fallback. If your partner is an *arbeider*, holiday pay comes from a vakantiefonds with a different counterparty. Open: do the bonuses feed the projection's saving rate or not? |
| 5. Savings return = balance change − net deposits | correct, but | Only needed for investments; savings interest is readable from the CSV. Withholding tax: first €1,050 of regulated savings interest per person is exempt (income year 2025), 15 % above; a `ROERENDE VOORHEFFING` debit must count as negative return, not spending. Also: moving money between your own savings accounts can reset the 12-month loyalty-premium clock (same-bank exception: first three transfers per year, ≥ €500, not standing orders). |

### Categorisation

| Handoff says | Read | Note |
|---|---|---|
| Rule-based on counterparty and description | standard | The Colruyt counterparty string moves around (`3689 COLRUYT RAMSEL`, `COLRUYT RAMSEL 3689`, `COLRUYT KRBRGEN 4190`), the card-line grammar changed at least four times since 2018, and Payconiq-via-card hides the merchant behind `BANCONTACT PAYCONIQ CO`. Needs a merchant alias layer and substring rules, not exact matches. |
| Review queue, rule created once | standard, gap | Unspecified: rule precedence (IBAN > name > description, most specific wins), manual override always wins, whether a new rule re-categorises history, splits (one transaction, several categories), and the category list itself. |
| Colruyt item mapping | correct | Key it on the article number printed on the receipt, not the free-text name. |
| AI categorisation optional and later | fine | Record whether the reason is privacy (no third-party API sees transactions). It affects hosting choices. |

### Views

| Handoff says | Read | Note |
|---|---|---|
| This month: in, out, **saved**; household and **per person** | gap, blocking | "Saved" has three possible definitions (in − out on all accounts; net moved into savings/investments; change in total balances) and they differ by exactly the kind of money that goes missing. "Per person" is undefined while a shared account exists. Recommendation in section 5. |
| Where it goes: per category and counterparty, vs previous months | yours | Use value date for the month, not booking date. Consider a recurring-costs panel; fixed costs are usually the fastest way to find a leak. |
| Groceries: item detail, voucher vs card split | yours | The split is per receipt, not per item; needs an allocation rule (vouchers to food items first, remainder to card). |
| Savings and returns | yours | Fine. |
| The set of five | agent structuring | Omits import, review queue and settings screens. Treat as a suggestion. |

### Projection logic

| Handoff says | Read | Note |
|---|---|---|
| Saving rate from actual saving over "the last few months" | yours (actual, not target) | The window and statistic are unspecified. Proposal: last 6 complete months (setting), expected = median. |
| Output: a range low / expected / high | agent default | Undefined. Options: P25/P75 of monthly saving, or drop the band and show the scenarios as lines. |
| House price grows by adjustable % from today's median; 2025 figures; 5.7 % | fact, partly outdated | See section 3. Default growth should be ~4 %, not 5.7 %. Which house type and which province is not decided. |
| Max-bid: both limits must hold | yours (via leenhelder) | Right structure. |
| LTV ≤ 90 % | fact, nuance | NBB supervisory expectation with tolerance for first-time buyers, not a law; measured on the bank's valuation. Keep 90 % as default, allow 80–100. |
| Payment + €35 ≤ 38 % of net income | fact, leenhelder's | Not a rule. Add a residual-income check. Insurance for two borrowers is more like €55–160/month (schuldsaldo + fire). |
| 3.5 % over 25 years | fact, contested | 2026 readings range 3.4–4.1 % for 25-year fixed; no September reading reachable. Show 3.5 / 4.0 / 4.5. Belgian banks compute the payment with the equivalent monthly rate, `(1+i)^(1/12) − 1`, not `i/12`. |
| 2 % registration duty | fact, confirmed | Sole own home, deed from 1 Jan 2025. Tightened from 1 Jan 2026: each buyer must stay domiciled at least one uninterrupted year; split or company purchases fall to 12 %. Failure: difference to 12 % plus 20 % increase. Extra: €1,867 reduction if the price is ≤ €220k (€240k in core cities and the Vlaamse Rand). Meeneembaarheid is abolished. |
| Notary fees ≈ €3,900–4,000 around €330–360k | fact, plausible but | Must be computed from the degressive scale plus 21 % VAT with the 2023 sole-own-home reductions, not stored as a constant. Unresolved between sources: whether the top bracket is 0.057 % or 0.57 % (about €500 at €350k). Calibrate once on the notaris.be calculator. |
| Mortgage duties 1 % + 0.3 % on 110 % of loan | fact, confirmed | Accessories % is bank-set; a hypothecair mandaat is cheaper if the bank allows it. |
| Fixed deed costs ≈ €1,793 | unverified | Sources range €1,000–2,600. Editable placeholder. |
| Bank file costs ≈ €350 | fact, nuance | Legal cap is €500 and many banks charge it. Belfius publishes a tariff sheet; fetch it. |
| Scenarios: raises, 4/5 → 5/5, other saving rate | yours | 5/5 net is not 1.25 × 4/5 net (progressive tax); enter the 5/5 net figure from a payslip simulation. Income must be stored per person. |
| Marginal €7.30 / €0.98 | fact, confirmed | Compute dynamically from settings; show the kink on the chart. |
| Real figures (income, rent, savings) in settings, not in the repo | yours | Income and savings can default from the imported data. Rent is never used anywhere in the document; either it is for "loan payment vs current rent" or it is a leftover. |
| Omitted | gap | Valuation fee (€250–500), existing debts (change the income limit), whether both are borrowers, whether either owns property now (2 % vs 12 %), Vlaamse woonlening eligibility (income ≤ €72,197 + dependants, max value €289,800, ~2 % rate), renovation obligation for EPC E/F, new-build VAT case. |

### Hosting

| Handoff says | Read | Note |
|---|---|---|
| Cloudflare free tier | agent default | A complete opinionated stack with no reason and no alternatives named. It is a defensible choice; it is just not yours yet. See section 5, question 1. |
| Pages | outdated | Workers with static assets. |
| D1 | fact, ok | Free: 5 M row reads/day, 100 k writes/day, 5 GB, 500 MB per DB, 7-day point-in-time restore, 100 bound parameters per statement. Orders of magnitude above your volume. |
| R2 | fact, ok | Free: 10 GB, 1 M writes, 10 M reads per month. Needs the R2 "subscription" checkout, i.e. a card. |
| Access, free up to 50 users | fact, confirmed | Card on file at onboarding, not charged. The app must validate the `Cf-Access-Jwt-Assertion` header itself to know which of you is logged in. |
| Export everything button | yours | Format unspecified. Proposal: one zip with SQL dump, JSON per table, every original PDF and CSV; same code runnable as a script for backups. Not the same as a backup routine, which the handoff lacks entirely. |
| "D1 is SQLite so the NAS move stays easy" | overstated | Only the schema and data are portable (SQL dump). D1 is reachable only through the Workers binding, R2 only through its API, identity only through Access. A move means swapping three adapters. Manageable if they are isolated from day one (Drizzle ORM, a two-method file store, one `getCurrentUser` function) and the migration is rehearsed once early. |

### Build order

| Handoff says | Read | Note |
|---|---|---|
| Phase 1: import, transfers, rules, two views | yours/agent, sound | Add: export/backup, the account registry (IBAN → owner → type) as first-run step, credit-card decision. |
| Phase 2 receipts, 3 savings, 4 projection | agent default | The app's second job (projection) is scheduled last, behind the fiddliest parser. Savings view plus max-bid is small; consider swapping 2 and 3+4. |
| "Throughout: tags, export" | agent default | "Throughout" means unscheduled. Export must exist before real data goes in. |

### Open items

| Handoff says | Read | Note |
|---|---|---|
| Blocking: sample Belfius CSV | still wanted, no longer blocking design | Needed to confirm encoding with accented names, your employers' salary/bonus messages, an investment purchase line, an ATM line, and whether your accounts show statement numbers. |
| Blocking: EU servers on free tier | resolved | `--jurisdiction=eu` on D1 and R2 at creation. Residual: Worker execution and Cloudflare-side logs are global; Access logs are US-only at any plan. Decide whether data-at-rest-in-EU is enough. |
| Non-blocking: whose voucher card | still open | Only a real receipt answers it. Also whether Colruyt lets one basket be split over two voucher cards at your branch. |
| Non-blocking: language | should be decided now | Retrofitting a language is pure cost; pick one. |
| Missing from the list | gap | Credit cards; cash policy; "saved" and per-person definitions; voucher source; hosting decision; house type and province; category seed list; phone use; a real Colruyt receipt before phase 2; who exports which account (your partner's accounts need her login); who owns the Cloudflare account. |

---

## 3. Facts checked, by topic

### Belfius CSV (from real exports dated Dec 2025 and Aug 2026, plus four open-source parsers)

- 12 preamble lines with the export filters, `Laatste saldo;59.580,73 EUR` and `Datum/uur van het laatste saldo`, then a line containing only `;`, then the header:
  `Rekening;Boekingsdatum;Rekeninguittrekselnummer;Transactienummer;Rekening tegenpartij;Naam tegenpartij bevat;Straat en nummer;Postcode en plaats;Transactie;Valutadatum;Bedrag;Devies;BIC;Landcode;Mededelingen`
- Semicolon separated, no quoting, 15 fields on every row, newest first, `dd/mm/yyyy`, decimal comma, no thousands separator in `Bedrag` (but yes in `Laatste saldo`), IBANs with spaces. Older exports used `Afschriftnummer` for column 3 and sometimes two-digit years: match headers by name, parse both.
- Encoding: all public samples are pure ASCII; parsers disagree (Latin-1, cp1252, UTF-8-with-BOM). Decode as UTF-8 stripping a BOM, fall back to cp1252, and test on a file with `é`.
- File name `<IBAN with spaces> <YYYY-MM-DD> <HH-MM-SS> <n>.csv`. Large ranges come out as consecutive chunks of about 350 rows; a boundary day can be split across two files.
- History: an August 2026 export reached back to January 2018, so the old "15 months" limit does not apply to the web export.
- Statement and transaction numbers are empty until the statement is issued (weeks), restart at 1 every year, and differ per account periodicity. Not a dedup key. Use a hash of (account, booking date, value date, amount, whitespace-collapsed `Transactie`), upsert the numbers when they arrive, and reconcile the stored rows against each file's `Laatste saldo`.
- `Mededelingen` duplicates `Transactie` on most rows; structured messages look like `+++324/3587/32507+++`; free text like `Maandelijkse huur`.
- Card payments: counterparty IBAN empty; merchant in `Naam tegenpartij bevat` with a 4-digit store number in varying positions; `Valutadatum` is the purchase date, `Boekingsdatum` lags 0–4 days; text carries `dd/mm/yy hh:mm`, the card (masked on newer Bancontact lines, **unmasked** on older lines and on Debit Mastercard lines) and the cardholder name. Mask card numbers before storing.
- Other line types seen: `OVERSCHRIJVING BELFIUS MOBILE NAAR`, `INSTANT OVERSCHRIJVING`, `DOORLOPENDE OPDRACHT`, `STORTING VAN`, `OVERSCHRIJVING PAYCONIQ NAAR` (has IBAN), `BETALING VIA ... BANCONTACT-APP AAN <name> P2P MOBILE` (no IBAN), `OPVRAGING SPECIEN` / `GELDOPNEMING` (cash), `MASTERCARD AFREKENING NUMMER` (credit card, legacy counterparty `666-…`), `DEELNEMING IN DE KOSTEN` / `BIJDRAGE IN DE BEHEERSKOSTEN` (fees), `CREDITINTERESTEN`, `UITBETALING VAN UW GETROUWHEIDSPREMIE`, `VERVALLEN LASTEN VAN UW WOONKREDIET` (mortgage instalment, no IBAN), refunds from `STICHTING MOLLIE PAYMENTS` / `BOLCOM BV` IBANs.
- A public corpus of real Belfius exports (2018–2026, two current accounts and a savings account) exists on GitHub (`TheKrowi/personal-assistant-home`) and can be importer test fixtures before your own file arrives.

### Cloudflare (docs read from the `cloudflare-docs` source repo, 23 Sep 2026)

- Pages: supported, not deprecated, but "start new projects with Workers"; Pages lacks Cron Triggers, Workers Logs, gradual deployments. Static asset requests on Workers are free and unlimited.
- Workers Free: 100,000 requests/day, **10 ms CPU per request**, 128 MB memory, 50 subrequests (docs are inconsistent: 50 vs 1,000 for internal services), 5 cron triggers, 100 MB request body. Script size: one source says 3 MB, another 64 MiB; unresolved and irrelevant if PDFs are parsed in the browser.
- D1: GA since April 2024. `npx wrangler d1 create <name> --jurisdiction=eu` (changelog 5 Nov 2025). Location hints are not a guarantee; jurisdictions are. Export: `wrangler d1 export` produces a SQL dump; REST export API returns a one-hour signed URL. No FTS5 virtual tables or export refuses to run.
- R2: bucket jurisdiction `eu` at creation; S3 endpoint `<account>.eu.r2.cloudflarestorage.com`; Worker binding must carry `jurisdiction`. Bulk download with rclone.
- Access: 50 free users; "Protect this Worker" works on `workers.dev`; app must validate the JWT (the static-assets router does not pass `ctx.access`). Access user logs and the Access JWT cannot be EU-localised at any plan.
- KV has no jurisdiction option; keep personal data out of it.

### Colruyt and meal vouchers

- Digital receipts: Xtra app → Profiel → Kastickets → "Enkel digitale kastickets"; every receipt then arrives in the app and by e-mail as `Kasticket_DDMMYYYY_HHhMM_<ticketnr>.pdf`. No bulk export or API. Xtra keeps receipts 3 months after last app use.
- PDF item lines (from real 2025 receipts): `<name> <article number><VAT letter> <qty or weight kg> <unit price> <line total>`, e.g. quantity `0,33kg`, unit prices with 3 decimals for multipacks. Footer: `TOTAAL GOEDEREN`, `TOT LEEGGOED`, `TE BETALEN`. Discounts "in prijs verrekend" are informational.
- Payment block (voucher/card split, issuer name, card digits, receipt number): not documented by any public parser. Needs one real receipt.
- Issuers: Edenred (6-month history in app), Pluxee (history in app, export by e-mail request), Monizze (12-month history, also visible in the Belfius app). No cardholder CSV export.
- Meal voucher ceiling since 1 Jan 2026: €10/day (employer €8.91, employee €1.09); valid 12 months; food only.
- If you pay with "Mobiel betalen via Xtra", the bank line is a direct debit two or more business days later, not a Bancontact line.
- Payconiq can combine vouchers and bank account in one payment at small merchants, not at supermarkets.

### House prices (Statbel, Vlaams Gewest, medians; republished by Statistiek Vlaanderen)

| Type (Statbel label) | 2024 | 2025 (Apr vintage) | 2025 (Jun vintage) | Q1 2026 | 10-yr CAGR |
|---|---|---|---|---|---|
| Huizen 2 of 3 gevels (gesloten + halfopen) | 300,000 | 317,100 | 317,050 | 321,318 | 4.4 % |
| Huizen 4 of meer gevels (open) | 413,000 | 430,000 | 430,000 | 450,000 | 3.8 % |
| Alle huizen | 330,000 | 349,000 | 349,000 | 355,000 | 4.3 % |
| Appartementen | 250,000 | 260,000 | 259,500 | 265,000 | 4.2 % |

- 5.7 % is the 2024→2025 change for 2-3 gevels only (after +0.5 % the year before). Detached +4.1 %, apartments +3.8 %.
- Statbel also publishes P25/P75 (2-3 gevels 2025: 237,500 / 405,000) and per province (2-3 gevels 2025: Antwerpen 350k, Vlaams-Brabant 365k, Oost-Vlaanderen 310k, West-Vlaanderen 270k, Limburg 280k). A provincial pick matters more than the growth rate.
- Statbel revises earlier periods in each release; a refresh must overwrite the series. Release calendar 2026: 30 Apr, 18 Jun, 22 Sep (yesterday: H1 2026 should be out), 22 Dec. statbel.fgov.be serves a bot challenge to non-browsers, so refresh by manual upload of the open-data XLSX or the be.STAT API, not by a Worker fetch.

### Mortgage and purchase costs

Covered in the table above. Two unresolved items to settle with the notaris.be calculator before coding the cost function: the top notary bracket (0.057 % vs 0.57 %) and the fixed deed costs (€1,000–2,600 range vs €1,793). Calibration benchmark: notaris.be's own example of €9,370 all-in purchase costs for a €250,000 sole family home in Flanders.

---

## 4. Gaps with no owner yet

- No data model, no tech stack (language, framework, ORM, migrations), no dev/prod separation, no tests, no CI, no backup routine, no first-run onboarding (users, account registry). These are builder decisions, not yours, but they need to exist before phase 1 and the handoff has none.
- No statement of where each salary lands, which account pays rent and fixed costs, whether a joint savings account exists. Per-person view and transfer detection cannot be designed without this map.
- No statement of who exports which account. Your partner's private and savings accounts need her login.
- Repo hygiene: `.gitignore` for `*.csv`, `*.pdf`, `*.sql`, `*.sqlite`, `.dev.vars`, backups; fixtures must be synthetic or anonymised.

---

## 5. Questions to answer

### A. Decide now; these shape the architecture

1. **Hosting.** Was Cloudflare your choice or the assistant's proposal that you did not object to?
   - (A) Cloudflare Workers + D1 (eu) + R2 (eu) + Access. Free at your volume, zero ops, public hostname behind login, data at rest in the EU, execution and login logs not. Card on file required. NAS move later = swap three adapters (planned for from day one).
   - (B) Self-hosted: one Docker container (app + SQLite file + PDFs on disk + Litestream backup) on a ~€4/month EU VPS now, moved as-is to a Synology NAS later; reachable only over Tailscale, no public URL, no Access. Full EU, full Node runtime, plain SQLite. Costs money and some ops.
   My recommendation: (A), on the condition that DB, file store and identity sit behind interfaces and we rehearse the dump-to-local-SQLite migration in phase 1. Pick (B) if "no US company processes any of this" is a hard requirement.
2. **Visibility between the two of you.** (A) both see every line on each other's private accounts; (B) private-account lines visible only to the owner, totals shared. Ask your partner too.
3. **Private tags.** Did either of you ask for them? If not, drop the feature.
4. **What "saved" means** on the This-month view. (A) income minus spending, wherever the money sits (including current accounts); (B) only what was moved into savings/investment accounts. My recommendation: (A) as the headline, with "moved to savings" and "left on current accounts" as two lines under it, because the difference between them is a diagnostic in itself.
5. **Per person.** (A) three columns, Stijn / partner / shared, where a transfer into the shared account counts as that person's outflow; (B) shared spending split 50/50 (or by contribution ratio) onto each person. Recommendation: (A); it never double counts and both sum to the household figure.
6. **Credit cards.** Does either of you have one, and does regular spending go on it? If yes, the monthly PDF statement becomes a phase-1 import.
7. **Money-flow map.** Which account does each salary land on; which account pays rent and which fixed costs; is there a joint savings account; where do investment contributions come from?
8. **Language:** Dutch or English, one language, no i18n framework.
9. **Phones.** Will you check the app or upload receipts from your phones? (Responsive layout from day one either way; changes the upload flow.)
10. **Cloudflare account.** Whose account owns it, are you fine with a card on file for R2 and Zero Trust, and does your partner need anything beyond logging in?

### B. Decide before the phase that needs it

11. **Cash.** ATM withdrawals booked as spending in a "Cash" category on the withdrawal date, never broken down? (Recommended.)
12. **Bonuses in the projection.** (A) monthly saving only, holiday pay and year-end bonus excluded; (B) trailing 12 months including whatever part of the bonuses was actually saved. And the window for "actual pace": 6 months? 12?
13. **Voucher spending source.** (A) typed monthly total per person from the issuer app (vouchers credited minus balance change), receipts add item detail; (B) only what Colruyt receipts show. Recommendation: (A). Which issuer(s) do you each have?
14. **Colruyt.** Do you pay with the Belfius card or with "Mobiel betalen via Xtra"? Is e-mail delivery of digital receipts switched on for both Xtra profiles, since when, and do you have the PDFs in your mailboxes? Can you share one receipt paid partly with vouchers (details blanked) before phase 2?
15. **Projection target.** House type (2-3 gevels / open / apartment / all houses), Flanders-wide or a province, and the horizon in years.
16. **Max-bid inputs.** Both of you borrowers and co-owners? Any existing loans? Does either of you own property or building land now, or expect to inherit? What is rent in settings for: loan-payment-vs-rent comparison, post-purchase saving rate, or nothing?
17. **Range.** Did you ask for low/expected/high? If so: P25/P75 of monthly saving, or drop the band and show the scenarios (current pace, with 5/5, with raise) as lines?
18. **Goal line.** One horizontal "own money needed for a €X house" line on the projection chart: yes or no?
19. **Build order.** Keep receipts as phase 2, or do savings + projection first and receipts last?
20. **Category list.** A short fixed list you both agree on now (rent, groceries, eating out, transport, subscriptions, health, gifts, cash, credit card, other), with additions allowed?

### C. What I will do unless you object

- Workers with static assets, not Pages. D1 and R2 created with `jurisdiction=eu` on day one.
- Export-everything and a backup script ship in phase 1, before any real data, and a restore into a local SQLite file is rehearsed once.
- Importer: any date range, overlapping and chunked files, hash-based dedup, statement numbers upserted when they arrive, reconciliation against `Laatste saldo`, card numbers masked, raw files kept.
- Belfius importer built against the public real exports now, confirmed on your sample.
- Interest and loyalty-premium lines read directly from the savings CSV; typed values only for investment accounts, with an as-of date.
- Own-transfer classification from one leg by IBAN, before categorisation; account registry (IBAN → owner → type) as the first-run screen.
- All cost parameters as settings with their source next to them; notary fee as a scale, not a constant; 4 % default price growth; monthly payment with the equivalent monthly rate; residual-income check next to the 38 % rule.
- Money as integer cents. TypeScript end to end. Domain logic (CSV parsing, transfer detection, rules, receipt matching, projection maths) in a framework-free core package with unit tests. Drizzle ORM with SQL migration files that target both D1 and plain SQLite.
- Colruyt PDFs parsed in the browser (pdf.js); the PDF uploaded alongside for archive only.
- Sandbox note: many Belgian sites are blocked from this environment's network policy. When we set up the environment, allow `belfius.be`, `notaris.be`, `statbel.fgov.be`, `bestat.statbel.fgov.be`, `vlaanderen.be`, `leenhelder.be`, `nbb.be`, `developers.cloudflare.com` if you want me to fetch them directly.

---

## 6. Main sources

- Cloudflare docs source: `github.com/cloudflare/cloudflare-docs` (`d1/configuration/data-location`, `changelog/d1/2025-11-05-d1-jurisdiction`, `r2/reference/data-location`, `workers/platform/limits`, `workers/platform/pricing`, `pages/index` banner, `cloudflare-one/access-controls/policies`, `data-localization/compatibility`); `cloudflare/workers-sdk` (`d1/create.ts`, `r2/bucket.ts`, `d1/export.ts`).
- Belfius exports: `github.com/TheKrowi/personal-assistant-home` (raw exports 2018–2026 for personal, shared and savings accounts), `github.com/JaanLavaerts/expense-tracker` (Dec 2025 export); parsers `renardeau/ofxstatement-be-belfius`, `wimverstuyf/php-belgianbankstatement-parser`, `mcuelenaere/finance`, `tigron/tiny-invoice`; belfius.be FAQ titles via search.
- Colruyt: `mijnxtra.be/digital-receipts`, Xtra privacy statement (retention), parsers `Griezn/ColruytTicketParser` (real PDF fixtures), `dvdvaneynde-byte/Colruyt-kasticket-tool`, `metsko/colli_parser`; issuer help centres (Edenred, Pluxee, Monizze); `werk.belgie.be` on vouchers; Securex/Unisoc on the 2026 ceiling.
- House prices: Statbel open-data workbook as committed in `quinteneveraert/Belgian-Real-Estate-Analysis` (June 2026 vintage) and `gehuybre/embuild-analyses` (April 2026 vintage, plus Statbel's 2026 publication calendar); press reports from CIB, BIV, AVS, Internetgazet quoting Statbel.
- Mortgage: `leenhelder.be/maximaal-bod/` and `/kosten/350000/` (snippets), `notaris.be` (snippets), NBB macroprudential FAQ and 2026 policy note (snippets), BIV on dossierkosten cap, Andersen / Forum Advocaten on the 2026 verkooprecht tightening, Vlaams Woningfonds 2026 limits, open-source calculators `Virgil-Bulens/wat-kost-dit-huis` (rates checked Aug 2026) and `FleurMax/nederbelg-hypotheek` (Sep 2026).
- Accounting patterns: Firefly III and Actual Budget documentation and source (rules engine, duplicate detection, transfers), Expensify receipt-matching rules, YNAB reimbursement guidance, Argenta page on loyalty premium and withholding tax.
