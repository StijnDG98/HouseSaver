import { Hono } from 'hono';
import { formatEuro } from '@housesaver/core';

type Bindings = {
  APP_ENV: string;
  // DB: D1Database;      // added at first deploy
  // FILES: R2Bucket;     // added at first deploy
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/health', (c) => c.json({ ok: true, env: c.env.APP_ENV, sample: formatEuro(125000) }));

export default app;
