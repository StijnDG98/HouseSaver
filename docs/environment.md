# Claude Code environment for HouseSaver

Created 2026-09-25 from the environment selector at claude.ai/code (the cloud icon above the message box). Verified: `CLAUDE_CODE_PLUGIN_DIRS` set, eight plugins present, superpowers loaded with its SessionStart hook.

## Name

`HouseSaver`

## Network access

Currently **Full**. To be switched to **Custom** (defaults plus the list below) before the first real statement is uploaded to a running app; recorded as a plan step, not optional.

```
belfius.be
www.belfius.be
notaris.be
www.notaris.be
statbel.fgov.be
bestat.statbel.fgov.be
vlaanderen.be
www.vlaanderen.be
leenhelder.be
nbb.be
www.nbb.be
colruyt.be
www.colruyt.be
mijnxtra.be
www.mijnxtra.be
developers.cloudflare.com
api.cloudflare.com
dash.cloudflare.com
fonts.googleapis.com
fonts.gstatic.com
mcp.context7.com
```

## Environment variables

```
CLAUDE_CODE_PLUGIN_DIRS=/opt/claude-plugins
```

Later, for deploys: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (deferred, decision #30).

## Setup script

```bash
#!/bin/bash
# Toolchain
corepack enable || true
corepack prepare pnpm@10.33.0 --activate || true
pip install --quiet pdfplumber || true

# Superpowers + selected Anthropic plugins, loaded via CLAUDE_CODE_PLUGIN_DIRS
mkdir -p /opt/claude-plugins
git clone -q --depth 1 https://github.com/obra/superpowers.git /opt/claude-plugins/superpowers || true
git clone -q --depth 1 https://github.com/anthropics/claude-plugins-official.git /tmp/cpo || true
for p in security-guidance commit-commands pr-review-toolkit code-review frontend-design claude-md-management; do
  cp -r "/tmp/cpo/plugins/$p" "/opt/claude-plugins/$p" 2>/dev/null || true
done
cp -r /tmp/cpo/external_plugins/context7 /opt/claude-plugins/context7 2>/dev/null || true
ls /opt/claude-plugins
```

The script runs once and the filesystem is cached for about seven days; plugins update when the cache rebuilds or the script is edited. Resuming a session never re-runs it.

## Plugins loaded

superpowers (process: brainstorm → spec → plan → TDD → review), security-guidance, commit-commands, pr-review-toolkit, code-review, frontend-design, claude-md-management, context7. `typescript-lsp` is terminal-only and not part of the cloud environment.

`/plugin` is a terminal-only command; in a cloud session verify with `echo $CLAUDE_CODE_PLUGIN_DIRS` and `ls /opt/claude-plugins`.

## Repository

`StijnDG98/HouseSaver`. Work happens on `claude/...` branches. No `main` branch exists yet.

## What lives where

| Concern | Where |
|---|---|
| Rules for how Claude works on this project | `CLAUDE.md` (to be rebuilt through the superpowers brainstorm, decision #34) |
| What is decided and what is open | `docs/decisions.md` |
| Real data | never in the repo; scratchpad only, deleted after use |
