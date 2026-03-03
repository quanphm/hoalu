CREATE TABLE IF NOT EXISTS recurring_bill_occurrence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recurring_bill_id uuid NOT NULL REFERENCES recurring_bill(id) ON DELETE CASCADE,
    due_date date NOT NULL,
    expense_id uuid REFERENCES expense(id) ON DELETE SET NULL,
    paid_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,

    -- Ensure one occurrence per bill per due date
    UNIQUE(recurring_bill_id, due_date)
);

-- Index for efficient overdue queries
CREATE INDEX IF NOT EXISTS rbo_due_date_idx ON recurring_bill_occurrence(due_date);
CREATE INDEX IF NOT EXISTS rbo_recurring_bill_id_idx ON recurring_bill_occurrence(recurring_bill_id);
CREATE INDEX IF NOT EXISTS rbo_expense_id_idx ON recurring_bill_occurrence(expense_id) WHERE expense_id IS NOT NULL;

-- Index for finding unpaid occurrences
CREATE INDEX IF NOT EXISTS rbo_unpaid_idx ON recurring_bill_occurrence(recurring_bill_id, due_date) WHERE expense_id IS NULL;
