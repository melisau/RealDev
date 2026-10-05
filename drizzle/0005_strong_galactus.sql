CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription` text NOT NULL,
	`created_at` text NOT NULL,
	`last_test_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_push_user` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE TABLE `reminder_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription_id` text NOT NULL,
	`day` text NOT NULL,
	`status` text NOT NULL,
	`attempts` integer NOT NULL,
	`http_status` integer,
	`updated_at` text NOT NULL,
	`claim` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminder_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`enabled` integer NOT NULL,
	`time` text NOT NULL,
	`timezone` text NOT NULL,
	`language` text NOT NULL,
	`updated_at` text NOT NULL
);
