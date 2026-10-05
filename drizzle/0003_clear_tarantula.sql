CREATE TABLE `accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`technologies` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `code_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_id` text NOT NULL,
	`code` text NOT NULL,
	`result` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_code_user_time` ON `code_runs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `github_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`repository` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `source_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`fetched_at` text NOT NULL
);
