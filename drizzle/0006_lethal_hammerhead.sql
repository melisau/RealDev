CREATE TABLE `interview_sessions` (
	`user_id` text NOT NULL,
	`track` text NOT NULL,
	`started_at` text NOT NULL,
	`answers` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_interview_user_track` ON `interview_sessions` (`user_id`,`track`);