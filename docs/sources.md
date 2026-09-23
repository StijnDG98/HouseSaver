# Data sources — verified formats

Verified on real files supplied on 2026-09-23 (kept out of the repository). All three are text PDFs; extraction with a standard PDF text layer, layout preserved, is enough. Every example below is anonymised.

## 1. Belfius account statement (rekeninguittreksel, PDF)

- Producer: Scriptura XSL-FO Formatter. One statement covers a period of several weeks; pages carry `BLZ. : <statement nr>/<page>` on page 1 and `<statement nr>/<page>` on later pages. Header block per page with the bank's own IBAN; the account's IBAN is on a ruler line `----- BEnn nnnn nnnn nnnn BIC: GKCCBEBB -----`.
- Opening balance: `SALDO OP dd-mm-yyyy   EUR   + 1.234,56`. Closing balance at the end: `SALDO OP dd-mm-yyyy hh:mm   EUR   + 1.234,56`. **Opening + sum of transactions = closing** (checked: 33 transactions, exact match). This is the import guard: a statement that does not reconcile is refused.
- Transaction header line: `NNNN dd-mm-yyyy (VAL. dd-mm-yyyy)   ±  1.234,56` where NNNN is the sequential transaction number within the year (unique per account per year: dedup key = IBAN + year + NNNN). Booking date first, value date in parentheses. Amount with sign, space-padded, thousands dot, decimal comma.
- Description: one to four indented lines after the header. Counterparty IBAN, when present, is embedded in the text (`STORTING VAN BEnn …`, `… NAAR BEnn …`, `STORTING VIA WERO VAN BEnn …`), never in a separate column. Extract with an IBAN regex.
- Line types seen: `BANCONTACT-AANKOOP - <merchant> - <postcode city> BE - dd/mm/yy hh:mm - [CONTACTLOOS|VIA INTERNET] - KAART 5169 20XX XXXX nnnn - <cardholder>`; `BANCONTACT - AANKOOP - …` (same, spaces differ); `DEBITMASTERCARD-BETALING dd/mm <merchant> <city> <cc> <amount> EUR KAART NR <full card number> - <cardholder>`; `AANKOOP BRANDSTOF DEBITMASTERCARD …`; `UW EUROPESE DOMICILIERING <mandate> VOOR <creditor> MEDEDELING: +++…+++`; `DOORLOPENDE BETALINGSOPDRACHT <nr> NAAR BEnn … <message>`; `INSTANT OVERSCHRIJVING BELFIUS MOBILE NAAR BEnn …`; `STORTING VAN BEnn <name> <message>`; `STORTING VIA WERO VAN BEnn …`; `AANVULLENDE BIJDRAGE VOOR UW REKENING MET VERSCHILLENDE MEDEHOUDERS` (fee, no counterparty).
- Cardholder name at the end of every card line tells whose card paid on the shared account. Debit Mastercard lines print the **full, unmasked card number**; mask before storing.
- Colruyt store code position varies within one statement: `COLRUYT WETTEREN 3536` and `3536 COLRUYT WETTEREN`.
- Booking date lags the purchase (value) date by 0–2 days in this sample; the purchase timestamp `dd/mm/yy hh:mm` in the text is the field to match receipts on.
- Trailing page: `MEDEDELING PRODUCT` with an overview of ATM withdrawals at other banks; ignore.
- Not yet seen: a savings-account statement, interest lines, salary lines, ATM withdrawal lines, the `MASTERCARD AFREKENING` settlement line. Expected from public exports; confirm on a personal-account statement.

## 2. Belfius Mastercard statement (uitgavenstaat, PDF)

- Header: `Kaarthouder <name>`, `Afsluitingsdatum dd/mm/yyyy`, `Datum van debet dd/mm/yyyy` (the day the total is debited from the current account: match to the `MASTERCARD AFREKENING` line there), `Transacties van dd/mm/yyyy tot dd/mm/yyyy`, `Transacties - Kaartnummer 5398 53XX XXXX nnnn - <name>`.
- Row: `dd/mm  dd/mm  <merchant>   <city>   <cc>   [<amount> <CUR>]   <amount> EUR-`. First date = transaction, second = booking. Foreign-currency rows carry the original amount and, on a continuation line, `1 EUR = 0,84052074GBP`. Continuation line `(Via <psp>)` names the payment processor. City can be two words (`SAN FRANCISCO US`): parse the country code as the last two-letter token before the amounts.
- Footer: `Totaal   448,39 EUR-`. **Sum of rows = Totaal** (checked: 12 rows, exact match). Import guard as above.
- Rows have no year; take it from the period header. Dedup key = card + period + row index.
- Page 2 is boilerplate (`PRAKTISCHE INFORMATIE`); ignore.

## 3. Colruyt / Collect&Go receipt (kasticket, PDF)

- Producer: JasperReports. Filename `Kasticket_DDMMYYYY_HHhMM_<ticketnr>.pdf`. Header repeated on every page: store, `Ordernummer`, `Kasticket: <nr>`, `Datum: dd/mm/yyyy hh:mm`.
- Column header `ART. NR OMSCHRIJVING   HOEV.   EENH. PRIJS   BEDRAG (EUR)`. Item row: `<article nr> <name>   <qty or weight 0.000>   <unit price>   <amount>`. **Decimal point, not comma** (`4.20`). Weight items have three decimals.
- Discount row directly under the item: `A000315258-SCP- Korting B0102177   25%   -1.39` or `A000315126-SCP- top promo 1+1 gratis   50%   -9.99`, followed by a filler line `S_0`. The discount is a real deduction (not "in prijs verrekend").
- Section `SERVICE EN WAARBORGEN`: deposits (`WAARBORG PLUS BOX COGO`) and service fees. Deposits are not groceries; they come back later as a refund.
- Footer: `Totale korting met Xtra: € 39.23`, `Te betalen:   € 242.68`, payment lines `hh:mm:ss  <method>  € <amount>` (here a single `Bancontact` line). **Items + discounts = Te betalen** (checked: 44 items, 11 discounts, exact match).
- Last page: substitution notes (`… werd vervangen door …`) and legal text; ignore.
- Not yet verified: an in-store (non Collect&Go) kasticket, and the payment block when meal vouchers are used (issuer name, split, card digits). One receipt paid partly with vouchers is still needed before phase 2.

## Matching this sample end to end

The receipt's Bancontact payment `10/08/2026 18:11:16 € 242.68` would match a statement line `BANCONTACT - AANKOOP - … - 10/08/26 18:11 - KAART … - <cardholder>` with amount `- 242,68`: same amount, timestamp to the minute, booking 0–2 days later. The Mastercard `Datum van debet 03/09/2026` with total `448,39` would match a `MASTERCARD AFREKENING` debit of `- 448,39` on the current account on or about 03-09-2026.
