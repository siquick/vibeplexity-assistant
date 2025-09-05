CREATE TABLE `available_tools` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`tool_name` text NOT NULL,
	`tool_description` text,
	`tool_schema` text NOT NULL,
	`required_capabilities` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT '"2025-09-04T21:16:33.625Z"'
);
--> statement-breakpoint
CREATE TABLE `service_data_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`service_id` text NOT NULL,
	`data_type` text NOT NULL,
	`data_key` text NOT NULL,
	`data_content` text NOT NULL,
	`cache_expires_at` integer NOT NULL,
	`created_at` integer DEFAULT '"2025-09-04T21:16:33.624Z"'
);
--> statement-breakpoint
CREATE TABLE `service_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`api_config` text NOT NULL,
	`capabilities` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT '"2025-09-04T21:16:33.624Z"'
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT '"2025-09-04T21:16:33.625Z"',
	`last_accessed` integer DEFAULT '"2025-09-04T21:16:33.625Z"',
	`metadata` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_session_token_unique` ON `user_sessions` (`session_token`);