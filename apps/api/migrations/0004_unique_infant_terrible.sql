ALTER TABLE "apikey" DROP CONSTRAINT "apikey_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "last_refill_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "enabled" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "rate_limit_enabled" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "request_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "last_request" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "expires_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "created_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "config_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "reference_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "apikey" DROP COLUMN "metadata";