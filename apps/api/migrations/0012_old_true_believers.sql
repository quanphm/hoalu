ALTER TABLE "event" ADD COLUMN "public_id" text;--> statement-breakpoint
UPDATE "event" SET "public_id" = 'ev_' || nanoid(16, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_public_id_unique" UNIQUE("public_id");--> statement-breakpoint

ALTER TABLE "recurring_bill" ADD COLUMN "public_id" text;--> statement-breakpoint
UPDATE "recurring_bill" SET "public_id" = 'rb_' || nanoid(16, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');--> statement-breakpoint
ALTER TABLE "recurring_bill" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_bill" ADD CONSTRAINT "recurring_bill_public_id_unique" UNIQUE("public_id");
