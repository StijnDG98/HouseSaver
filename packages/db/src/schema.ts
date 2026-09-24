import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Phase 0 holds only the two tables the login and the account registry need.
// The full model (documents, transactions, receipts, rules, …) arrives with Phase 1;
// see docs/plan.md §3.

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  /** IBAN for bank accounts; masked card number for card accounts. */
  identifier: text('identifier').notNull().unique(),
  owner: text('owner', { enum: ['stijn', 'partner', 'shared'] }).notNull(),
  type: text('type', { enum: ['current', 'savings', 'investment', 'card'] }).notNull(),
  name: text('name').notNull(),
  countsAsOwnMoney: integer('counts_as_own_money', { mode: 'boolean' }).notNull().default(false),
  /** Cents. */
  openingBalance: integer('opening_balance').notNull().default(0),
  openingDate: text('opening_date'),
});
