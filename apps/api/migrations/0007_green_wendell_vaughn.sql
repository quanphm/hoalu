CREATE TYPE "public"."category_type_enum" AS ENUM('expense', 'income');--> statement-breakpoint
ALTER TABLE "category" DROP CONSTRAINT "category_workspace_id_name_unique";--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "type" "category_type_enum" DEFAULT 'expense' NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_workspace_name_type_unique" UNIQUE("workspace_id","name","type");