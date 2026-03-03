-- Migration: Backfill recurring_bill_occurrence from existing expenses
-- Created: 2026-03-03
-- Purpose: Link existing expenses to their recurring bill occurrences

INSERT INTO recurring_bill_occurrence (
    id,
    recurring_bill_id,
    due_date,
    expense_id,
    paid_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    e.recurring_bill_id,
    e.date::date,
    e.id,
    e.created_at,
    e.created_at,
    e.created_at
FROM expense e
WHERE e.recurring_bill_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM recurring_bill_occurrence rbo 
    WHERE rbo.expense_id = e.id
);

-- Add comment documenting the migration
COMMENT ON TABLE recurring_bill_occurrence IS 'Tracks expected occurrences of recurring bills. Backfilled from existing expenses on 2026-03-03.';
