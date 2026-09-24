import { defineConfig } from 'drizzle-kit';

// Migrations are plain SQL files committed to the repo. They are applied to D1 with
// `wrangler d1 migrations apply` and to a local SQLite file at startup on Node.
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/schema.ts',
  out: './migrations',
});
