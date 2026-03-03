ALTER TABLE "recurring_bill" ADD COLUMN "due_day" integer;--> statement-breakpoint
ALTER TABLE "recurring_bill" ADD COLUMN "due_month" integer;--> statement-breakpoint

-- Populate due_day and due_month from existing anchor_date
-- monthly/daily/weekly: due_day = day-of-month extracted from anchor_date
-- weekly: due_day = day-of-week (0=Sun..6=Sat) extracted from anchor_date
-- yearly: due_day = day-of-month, due_month = month extracted from anchor_date
UPDATE "recurring_bill" SET
  due_day = CASE
    WHEN repeat = 'weekly' THEN EXTRACT(DOW FROM anchor_date::date)::integer
    ELSE EXTRACT(DAY FROM anchor_date::date)::integer
  END,
  due_month = CASE
    WHEN repeat = 'yearly' THEN EXTRACT(MONTH FROM anchor_date::date)::integer
    ELSE NULL
  END;
