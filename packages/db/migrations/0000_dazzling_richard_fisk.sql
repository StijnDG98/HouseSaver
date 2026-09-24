CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`owner` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`counts_as_own_money` integer DEFAULT false NOT NULL,
	`opening_balance` integer DEFAULT 0 NOT NULL,
	`opening_date` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_identifier_unique` ON `accounts` (`identifier`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);