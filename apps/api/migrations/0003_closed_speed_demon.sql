CREATE TABLE "recurring_bill" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"amount" numeric(20, 6) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"repeat" "repeat_enum" NOT NULL,
	"anchor_date" date NOT NULL,
	"wallet_id" uuid NOT NULL,
	"category_id" uuid,
	"workspace_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "recurring_bill_id" uuid;--> statement-breakpoint
ALTER TABLE "recurring_bill" ADD CONSTRAINT "recurring_bill_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill" ADD CONSTRAINT "recurring_bill_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill" ADD CONSTRAINT "recurring_bill_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill" ADD CONSTRAINT "recurring_bill_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recurring_bill_workspace_id_idx" ON "recurring_bill" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "recurring_bill_wallet_id_idx" ON "recurring_bill" USING btree ("wallet_id");--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_recurring_bill_id_recurring_bill_id_fk" FOREIGN KEY ("recurring_bill_id") REFERENCES "public"."recurring_bill"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_recurring_bill_id_idx" ON "expense" USING btree ("recurring_bill_id");