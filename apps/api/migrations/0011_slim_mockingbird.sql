ALTER TABLE "income" ADD COLUMN "public_id" text;--> statement-breakpoint
UPDATE "income" SET "public_id" = 'in_' || nanoid(16, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');--> statement-breakpoint
ALTER TABLE "income" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_public_id_unique" UNIQUE("public_id");
