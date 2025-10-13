/*
# [SECURITY FIX] Correct RLS Insert Policy for Categories
This script fixes an issue with the insert policy on the 'categories' table. The previous migration was missing a `WITH CHECK (true)` clause, causing inserts to fail unexpectedly. This update adds the necessary clause to the existing policy, allowing anonymous users to add new categories.

## Query Description:
This operation modifies an existing Row Level Security (RLS) policy. It makes the policy for inserting data into the `categories` table more permissive, which is necessary for the application to function without a user login system. There is no risk to existing data.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Affects Policy: "Allow anon insert on categories" on table "public.categories"

## Security Implications:
- RLS Status: Remains Enabled
- Policy Changes: Yes (modifies an existing policy to be more permissive)
- Auth Requirements: None. This change is to allow anonymous access.
*/
ALTER POLICY "Allow anon insert on categories" ON public.categories
WITH CHECK (true);
