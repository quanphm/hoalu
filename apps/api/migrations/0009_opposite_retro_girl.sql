CREATE TYPE "public"."event_status_enum" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" date,
	"end_date" date,
	"budget" numeric(20, 6),
	"budget_currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" "event_status_enum" DEFAULT 'open' NOT NULL,
	"workspace_id" uuid NOT NULL,
	"creator_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "recurring_bill" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_workspace_id_idx" ON "event" USING btree ("workspace_id");--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill" ADD CONSTRAINT "recurring_bill_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_event_id_idx" ON "expense" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "recurring_bill_event_id_idx" ON "recurring_bill" USING btree ("event_id");