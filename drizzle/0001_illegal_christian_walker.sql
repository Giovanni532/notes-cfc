ALTER TABLE `note_utilisateur` RENAME TO `user_module_note`;--> statement-breakpoint
CREATE TABLE `user_competence_niveau` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`competence_id` text NOT NULL,
	`niveau` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`competence_id`) REFERENCES `competence`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `objectif_evaluateur`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_module_note` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_id` text NOT NULL,
	`note` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `module`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_module_note`("id", "user_id", "module_id", "note", "created_at", "updated_at") SELECT "id", "user_id", "module_id", "note", "created_at", "updated_at" FROM `user_module_note`;--> statement-breakpoint
DROP TABLE `user_module_note`;--> statement-breakpoint
ALTER TABLE `__new_user_module_note` RENAME TO `user_module_note`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `module` ADD `code` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `module_code_unique` ON `module` (`code`);--> statement-breakpoint
ALTER TABLE `competence_module` DROP COLUMN `updated_at`;