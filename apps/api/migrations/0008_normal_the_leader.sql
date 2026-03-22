CREATE TABLE "income" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"currency" varchar(3) NOT NULL,
	"amount" numeric(20, 6) NOT NULL,
	"repeat" "repeat_enum" DEFAULT 'one-time' NOT NULL,
	"creator_id" uuid,
	"workspace_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"category_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "income_title_idx" ON "income" USING gin (to_tsvector('simple', "title"));--> statement-breakpoint
CREATE INDEX "income_description_idx" ON "income" USING gin (to_tsvector('simple', "description"));--> statement-breakpoint
CREATE INDEX "income_workspace_id_idx" ON "income" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "income_wallet_id_idx" ON "income" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "income_date_idx" ON "income" USING btree ("date");