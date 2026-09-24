# Claude Code environment for HouseSaver

This is the cloud environment you pick when starting a Claude Code on the web session. Create one dedicated to this project so its settings never mix with other work. All settings are edited from the cloud environment menu in the session's title bar → Edit.

## Name

`HouseSaver`

## Network access

Choose the allow-list level and add these hosts. The first block is what the build needs; the second is what lets me fetch Belgian sources directly instead of via mirrors.

Build and tooling:

- `registry.npmjs.org` (usually allowed by default)
- `api.cloudflare.com`, `dash.cloudflare.com` — wrangler, only needed from the first deploy on
- `developers.cloudflare.com` — docs
- `fonts.googleapis.com`, `fonts.gstatic.com` — UI fonts during local checks
- `github.com`, `raw.githubusercontent.com`

Research and reference data:

- `belfius.be`, `www.belfius.be`
- `notaris.be`, `www.notaris.be`
- `statbel.fgov.be`, `bestat.statbel.fgov.be`
- `vlaanderen.be`, `www.vlaanderen.be`
- `leenhelder.be`
- `nbb.be`, `www.nbb.be`
- `colruyt.be`, `www.colruyt.be`, `mijnxtra.be`, `www.mijnxtra.be`

## Setup script

The repo's own SessionStart hook (`.claude/hooks/session-start.sh`) installs dependencies, so the environment script only needs the toolchain:

```
corepack enable
corepack prepare pnpm@10.33.0 --activate
pip install --quiet pdfplumber
```

`pdfplumber` is only used in the scratchpad to inspect real PDFs; it never becomes a project dependency.

## Environment variables

None until the first deploy. Then, as secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (the same two go into GitHub Actions secrets).

## Repository

`StijnDG98/HouseSaver`, default branch `main`. Work happens on `claude/...` branches; merging to `main` runs CI and, once configured, the deploy.

## What lives where

| Concern                                           | Where                                                      |
| ------------------------------------------------- | ---------------------------------------------------------- |
| Rules for how I work on this project              | `CLAUDE.md`                                                |
| What is decided and what is open                  | `docs/decisions.md`                                        |
| Recording a decision, making a fixture, deploying | `.claude/skills/{decisions,fixtures,deploy-cloudflare}`    |
| Session start, permissions, denied commands       | `.claude/settings.json` + `.claude/hooks/session-start.sh` |
| Checks that must pass                             | `pnpm check` locally, `.github/workflows/ci.yml` on push   |
| Real data                                         | never in the repo; scratchpad only, deleted after use      |
