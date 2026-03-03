CREATE TABLE "recurring_bill_occurrence" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recurring_bill_id" uuid NOT NULL,
	"due_date" date NOT NULL,
	"expense_id" uuid,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_bill_occurrence" ADD CONSTRAINT "recurring_bill_occurrence_recurring_bill_id_recurring_bill_id_fk" FOREIGN KEY ("recurring_bill_id") REFERENCES "public"."recurring_bill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill_occurrence" ADD CONSTRAINT "recurring_bill_occurrence_expense_id_expense_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expense"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rbo_recurring_bill_id_idx" ON "recurring_bill_occurrence" USING btree ("recurring_bill_id");--> statement-breakpoint
CREATE INDEX "rbo_due_date_idx" ON "recurring_bill_occurrence" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "rbo_expense_id_idx" ON "recurring_bill_occurrence" USING btree ("expense_id");--> statement-breakpoint
CREATE INDEX "rbo_unpaid_idx" ON "recurring_bill_occurrence" USING btree ("recurring_bill_id","due_date") WHERE "recurring_bill_occurrence"."expense_id" IS NULL;