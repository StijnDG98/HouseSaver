---
name: deploy-cloudflare
description: Runbook for the first and later deployments to Cloudflare (Workers, D1 in the EU, R2 in the EU, Access). Use only when Stijn asks to deploy; it lists what he must do in his account and what to run here.
---

# Deploying HouseSaver to Cloudflare

Deployment is deferred until Stijn asks (decision #16 and the setup note in `docs/decisions.md`). Do not create resources before that.

## Once, in Stijn's Cloudflare account (his part)

1. Enable R2 (Storage & Databases → R2 → complete the checkout; card required, nothing charged at our volume).
2. Enable Zero Trust on the Free plan; under Settings → Authentication add **One-time PIN** as a login method.
3. Create an API token from the "Edit Cloudflare Workers" template and add D1 Edit and R2 Edit permissions. Put it in the GitHub repo as Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Never paste it in chat.
4. Decide: `workers.dev` address (default) or a custom domain on Cloudflare.
5. In the Claude Code environment, add the same two values as environment variables if deploys from a session are wanted.

## First deploy (our part)

```
pnpm exec wrangler d1 create housesaver --jurisdiction=eu        # note the database_id
pnpm exec wrangler r2 bucket create housesaver-files --jurisdiction=eu
```

Add to `apps/worker/wrangler.jsonc`: the `d1_databases` binding (with `migrations_dir` pointing at `packages/db/migrations`) and the `r2_buckets` binding with `"jurisdiction": "eu"`. Then:

```
pnpm --filter @housesaver/web build
pnpm exec wrangler d1 migrations apply housesaver --remote
pnpm --filter @housesaver/worker deploy
```

Then in the dashboard: Workers & Pages → housesaver → Settings → Domains & Routes → **Enable Cloudflare Access**; policy Allow with Include: Emails = the two addresses. Verify both can log in with a one-time PIN before any real data is uploaded.

## Every later deploy

`pnpm check` green → merge to `main` → the GitHub Actions deploy workflow runs migrations and deploys. Never deploy from a branch. Never run `wrangler d1 execute` against the remote database by hand; write a migration.

## Backup and export

`pnpm exec wrangler d1 export housesaver --remote --output=backup/db.sql` plus `rclone` of the R2 bucket (EU endpoint). Run after every monthly import until the in-app export exists. Keep backups outside the repo.
