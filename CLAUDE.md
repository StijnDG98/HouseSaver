# HouseSaver

Private money tracker for two people (Stijn and his partner) saving for a house in Flanders. Belfius statement PDFs and Colruyt receipt PDFs go in; "where does the money go" and "what could we bid, and when" come out. Dutch UI, English code and docs.

## Read these first

- `docs/decisions.md` — every confirmed decision, newest at the bottom, plus the list of what is still open. **The only source of truth for what has been decided.**
- `docs/plan.md` — the build plan: stack, repo layout, data model, algorithms, phases.
- `docs/sources.md` — the verified PDF formats and the reconciliation rule each one supports.
- `docs/mockup/index.html` — the UI direction (screens, Dutch labels, behaviour).
- `docs/handoff-review.md` — why things are the way they are; read when a decision looks odd.

## Working with Stijn

- He does not want a yes-man. If a request rests on a wrong assumption or a stale fact, say so plainly and explain, then do the work under stated assumptions.
- **Never lock in a decision he did not make.** If something is undecided, leave it in the "Still open" list of `docs/decisions.md` and ask; do not fill the gap with a default and move on. When he says "push that to the next message", do exactly that.
- Ask one batch of questions at a time; he prefers not to be overwhelmed. Number them.
- Record every decision he confirms in `docs/decisions.md` in the same session, with the date and the reasoning he gave.
- He reads on phone and PC. Keep messages short; put detail in the docs.

## Hard rules

1. **Real financial data never enters the repository.** No statement or receipt PDFs, no CSVs, no database files, no exports, no real IBANs, names or card numbers in code, tests, fixtures or docs. Fixtures are anonymised text produced with the `fixtures` skill. `.gitignore` enforces the file types; you enforce the content.
2. **Money is integer cents** (`Cents` from `@housesaver/core`). Never `parseFloat`, never floating-point arithmetic on amounts. Belgian formatting only at the UI edge (`formatEuro`).
3. **Every imported document must reconcile** against its own totals (opening + Σ = closing; Σ rows = Totaal; items + discounts = Te betalen) or the whole file is refused. No partial imports.
4. **Card numbers are masked** before storage (`dddd ddXX XXXX dddd`).
5. `packages/core` is pure TypeScript: no I/O, no Cloudflare types, no DOM. Everything that matters (parsers, classifier, dedup, matcher, rules, projection) lives there with tests.
6. Cloudflare-specific code stays behind the three seams in `docs/plan.md` §2 (`Db`, `FileStore`, `Identity`).
7. Do not create Cloudflare resources, deploy, or touch Cloudflare settings until the `deploy-cloudflare` skill is invoked on Stijn's request. D1 and R2 must be created with `jurisdiction=eu`.
8. Do not add dependencies casually. Prefer the standard library; when a library is needed, pin it and say why in the commit.

## Commands

```
pnpm install            # once per checkout (the SessionStart hook does this on the web)
pnpm check              # typecheck + lint + format:check + test — must pass before every commit
pnpm test               # vitest, all packages
pnpm test:watch
pnpm lint / pnpm format
pnpm db:generate        # regenerate SQL migrations from packages/db/src/schema.ts (commit the output)
pnpm dev:worker         # wrangler dev (API on :8787)
pnpm dev:web            # vite (UI on :5173, proxies /api to :8787)
pnpm --filter @housesaver/web build
```

## Layout

```
packages/core   pure domain logic + tests
packages/db     Drizzle schema + committed SQL migrations
apps/worker     Hono API on a Cloudflare Worker, serves apps/web/dist as static assets
apps/web        React + Vite UI (Dutch)
fixtures/       anonymised text fixtures for parser tests
docs/           decisions, plan, sources, mock-up, review
.claude/        hooks, settings, project skills
```

## Conventions

- TypeScript strict everywhere; `import type` for types; ESM only.
- Tests next to the code (`*.test.ts`), Vitest. A parser change without a fixture-based test is not done.
- Commit messages: imperative subject, body explains why. Commit after every completed step; push to the working branch.
- Definition of done for any task: `pnpm check` passes, docs updated if behaviour or decisions changed, `docs/decisions.md` touched if a decision was made.
- Dutch UI strings live in the UI layer only; code identifiers, comments and docs are English.
- Build order (proposal, reopened by decision #35): Phase 0 scaffold → Phase 1 import + money views → Phase 2 savings + projection → Phase 3 receipts → Phase 4 polish.
