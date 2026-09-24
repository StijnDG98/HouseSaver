#!/bin/bash
# SessionStart hook: make `pnpm check` runnable in Claude Code on the web.
# Runs synchronously so tests and linters are ready before the first prompt.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || npm install -g pnpm@10 >/dev/null 2>&1
fi

# Idempotent; pnpm skips work when the store already has everything (the container is cached
# after the hook completes, so later sessions start fast).
pnpm install --frozen-lockfile --prefer-offline

# Generate the web build once so `wrangler dev` has assets to serve.
if [ ! -d apps/web/dist ]; then
  pnpm --filter @housesaver/web build >/dev/null
fi

echo "housesaver: dependencies ready (node $(node --version), pnpm $(pnpm --version))"
