CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`action` varchar(255) NOT NULL,
	`entity_type` varchar(50),
	`entity_id` varchar(36),
	`ip_address` varchar(50),
	`user_agent` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`name` varchar(100) NOT NULL,
	`type` varchar(20) NOT NULL,
	`color` varchar(50),
	`icon` varchar(50),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` varchar(36) NOT NULL,
	`chat_session_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`metadata_json` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` varchar(36) NOT NULL,
	`debt_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`payment_date` date NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `debt_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`creditor_name` varchar(255) NOT NULL,
	`original_amount` decimal(15,2) NOT NULL,
	`remaining_amount` decimal(15,2) NOT NULL,
	`due_date` date,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`notes` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_goals` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`target_amount` decimal(15,2) NOT NULL,
	`current_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`target_date` date,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `financial_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otp_verifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`email` varchar(255) NOT NULL,
	`code_hash` varchar(255) NOT NULL,
	`purpose` varchar(50) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`attempt_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `otp_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`family_id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`replaced_by_token_id` varchar(36),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `token_hash_idx` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`remind_at` timestamp NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`type` varchar(20) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`description` text,
	`transaction_date` date NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`email_verified_at` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_chat_session_id_chat_sessions_id_fk` FOREIGN KEY (`chat_session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_sessions` ADD CONSTRAINT `chat_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `debt_payments` ADD CONSTRAINT `debt_payments_debt_id_debts_id_fk` FOREIGN KEY (`debt_id`) REFERENCES `debts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `debt_payments` ADD CONSTRAINT `debt_payments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `debts` ADD CONSTRAINT `debts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financial_goals` ADD CONSTRAINT `financial_goals_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `otp_verifications` ADD CONSTRAINT `otp_verifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `cat_user_id_idx` ON `categories` (`user_id`);--> statement-breakpoint
CREATE INDEX `message_session_idx` ON `chat_messages` (`chat_session_id`);--> statement-breakpoint
CREATE INDEX `chat_session_user_idx` ON `chat_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `payment_debt_id_idx` ON `debt_payments` (`debt_id`);--> statement-breakpoint
CREATE INDEX `payment_user_id_idx` ON `debt_payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `debt_user_id_idx` ON `debts` (`user_id`);--> statement-breakpoint
CREATE INDEX `goal_user_id_idx` ON `financial_goals` (`user_id`);--> statement-breakpoint
CREATE INDEX `otp_email_idx` ON `otp_verifications` (`email`);--> statement-breakpoint
CREATE INDEX `rt_user_id_idx` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `reminder_user_id_idx` ON `reminders` (`user_id`);--> statement-breakpoint
CREATE INDEX `reminder_remind_at_idx` ON `reminders` (`remind_at`);--> statement-breakpoint
CREATE INDEX `tx_user_id_idx` ON `transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `tx_date_idx` ON `transactions` (`transaction_date`);