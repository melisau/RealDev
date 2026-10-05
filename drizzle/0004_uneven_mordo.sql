CREATE TABLE `ai_usage` (
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`kind` text NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_ai_usage` ON `ai_usage` (`user_id`,`day`,`kind`);--> statement-breakpoint
CREATE TABLE `practice_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_id` text NOT NULL,
	`modality` text NOT NULL,
	`code` text NOT NULL,
	`explanation` text NOT NULL,
	`result` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_practice_user_time` ON `practice_submissions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `source_health` (
	`key` text PRIMARY KEY NOT NULL,
	`attempted_at` text NOT NULL,
	`error` text
);
