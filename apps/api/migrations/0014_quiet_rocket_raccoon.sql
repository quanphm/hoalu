ALTER TABLE "file" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "mime_type" text;--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "size" integer;--> statement-breakpoint
CREATE INDEX "file_created_at_id_idx" ON "file" USING btree ("created_at","id");--> statement-breakpoint
UPDATE "file"
SET "title" = NULLIF(btrim(regexp_replace("description", '^.*GMT[+-][0-9]{4} \([^)]*\) - ', '')), '')
WHERE "title" IS NULL AND "description" IS NOT NULL;
