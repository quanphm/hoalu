DROP INDEX "expense_title_idx";--> statement-breakpoint
DROP INDEX "expense_description_idx";--> statement-breakpoint
DROP INDEX "file_description_idx";--> statement-breakpoint
DROP INDEX "task_title_idx";--> statement-breakpoint
CREATE INDEX "expense_title_idx" ON "expense" USING gin (to_tsvector('simple', "title"));--> statement-breakpoint
CREATE INDEX "expense_description_idx" ON "expense" USING gin (to_tsvector('simple', "description"));--> statement-breakpoint
CREATE INDEX "file_description_idx" ON "file" USING gin (to_tsvector('simple', "description"));--> statement-breakpoint
CREATE INDEX "task_title_idx" ON "task" USING gin (to_tsvector('simple', "title"));