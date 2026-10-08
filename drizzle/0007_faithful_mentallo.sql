CREATE TABLE `study_intervals` (
	`user_id` text NOT NULL,
	`id` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer NOT NULL,
	`kind` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_study_owner_id` ON `study_intervals` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `idx_study_owner_time` ON `study_intervals` (`user_id`,`started_at`);