CREATE TABLE `saved_questions` (
	`user_id` text NOT NULL,
	`task_id` text NOT NULL,
	`attempt_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_saved_user_task` ON `saved_questions` (`user_id`,`task_id`);