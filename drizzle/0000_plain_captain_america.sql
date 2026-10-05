CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`run_id` text NOT NULL,
	`task_id` text NOT NULL,
	`version` text NOT NULL,
	`area` text NOT NULL,
	`answer_json` text NOT NULL,
	`explanation` text NOT NULL,
	`confidence` integer NOT NULL,
	`hinted` integer NOT NULL,
	`skipped` integer NOT NULL,
	`score` integer NOT NULL,
	`feedback_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_attempt_run_task` ON `attempts` (`run_id`,`task_id`);--> statement-breakpoint
CREATE INDEX `idx_attempt_user_time` ON `attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `hints` (
	`run_id` text NOT NULL,
	`task_id` text NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_hint_run_task` ON `hints` (`run_id`,`task_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`goals` text NOT NULL,
	`daily_minutes` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`task_ids` text NOT NULL,
	`complete` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_runs_user` ON `runs` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_active_baseline` ON `runs` (`user_id`) WHERE "runs"."kind" = 'baseline' AND "runs"."complete" = 0;