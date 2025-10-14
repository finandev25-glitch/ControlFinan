/*
# [Fix] Refresh Schema Cache for scheduled_expenses
This is a maintenance operation to fix a schema cache issue in Supabase.

## Query Description:
This query adds a comment to the `confirmed_months` column in the `scheduled_expenses` table. This is a non-destructive action designed to force Supabase to refresh its internal schema cache, which can sometimes become stale and cause "column not found" errors even when the column exists.

## Metadata:
- Schema-Category: "Maintenance"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `public.scheduled_expenses`
- Column: `confirmed_months`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/

COMMENT ON COLUMN public.scheduled_expenses.confirmed_months IS 'Stores an array of "yyyy-MM" strings for months where the expense has been confirmed.';
