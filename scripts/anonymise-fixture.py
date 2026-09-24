#!/usr/bin/env python3
"""Anonymise an extracted statement/receipt text for use as a parser fixture.

Usage: anonymise-fixture.py <in.txt> <out.txt> [--name 'Real Name' ...]

Replaces IBANs (stable mapping), card numbers, names given with --name, and street
addresses. Amounts, dates, statement numbers and merchant strings are left untouched.
Always read the output before committing it.
"""
import re, sys, argparse

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst')
ap.add_argument('--name', action='append', default=[], help='real personal name to replace (repeatable)')
ap.add_argument('--street', action='append', default=[], help='real street line to replace (repeatable)')
a = ap.parse_args()
text = open(a.src, encoding='utf-8').read()

ibans = {}
def fake_iban(m):
    real = re.sub(r'\s', '', m.group(0))
    if real not in ibans:
        n = len(ibans) + 1
        ibans[real] = f'BE00 9999 0000 {n:04d}'
    return ibans[real]
text = re.sub(r'\bBE\d{2}(?: ?\d{4}){3}\b', fake_iban, text)

text = re.sub(r'\b(\d{4}) (\d{2})(?:\d{2}|XX) (?:\d{4}|XXXX) (\d{4})\b', r'\1 \2XX XXXX 0001', text)  # card numbers
for i, name in enumerate(a.name):
    label = f'PERSOON {chr(65 + i)}'
    for variant in {name, name.upper(), ' '.join(reversed(name.split())), ' '.join(reversed(name.split())).upper()}:
        text = re.sub(re.escape(variant), label, text)
for street in a.street:
    text = re.sub(re.escape(street), 'STRAAT 1', text)

open(a.dst, 'w', encoding='utf-8').write(text)
print(f'wrote {a.dst}; {len(ibans)} IBANs mapped; check it by eye before committing')
