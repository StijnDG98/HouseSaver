---
name: fixtures
description: Turn a real Belfius statement, Belfius card statement or Colruyt receipt PDF into an anonymised text fixture for parser tests, without any real data reaching the repo. Use before writing or changing a parser.
---

# Making a parser fixture from a real PDF

Real files arrive as uploads and live only in the scratchpad. They are never copied under the repo.

1. Extract the text layer with layout preserved into the scratchpad (Python `pdfplumber`, `page.extract_text(layout=True)`; for the savings statement crop each page at half width and extract the halves separately, see `docs/sources.md`).
2. Anonymise the text with `scripts/anonymise-fixture.py <in.txt> <out.txt>`. It replaces every IBAN with a fake one (keeping the same fake per real IBAN so transfer legs still pair), personal names with `PERSOON A/B/C`, card numbers with `5169 20XX XXXX 0001`-style values, addresses with `STRAAT 1`, and shifts nothing else: amounts, dates, statement numbers and merchant strings stay as they are because the parser must see them unchanged.
3. Read the output yourself before committing. Search it for the real surnames, street name and any 4-digit card fragment you saw in the original. If anything is left, extend the script, do not hand-edit the fixture.
4. Save under `fixtures/<kind>/<short-name>.txt` with a sibling `<short-name>.expected.json` holding what the parser must produce (opening, closing, count, a few spot-checked rows).
5. Write the test in `packages/core` so that it asserts reconciliation (opening + Σ = closing) as well as the spot checks.
6. Delete the scratchpad copies when done.

Never commit a PDF, even an anonymised one. `.gitignore` blocks them; do not work around it.
