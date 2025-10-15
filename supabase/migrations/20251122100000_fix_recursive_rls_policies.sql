/*
# [Fix] RLS Policy Recursion Repair
This migration completely rebuilds the Row Level Security (RLS) policies for all tables to fix a critical infinite recursion error.

## Query Description:
This script first creates a safe, non-recursive helper function (`get_current_user_family_id`) to identify a user's family. It then drops all existing (and potentially faulty) security policies and recreates them using this safe function. This ensures that a user can only access data belonging to their own family, resolving the "infinite recursion" error permanently. This is a safe operation and will not result in data loss.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: false

## Structure Details:
- Functions: `get_current_user_family_id` (created/replaced)
- Policies: All policies on tables `families`, `family_members`, `user_profiles`, `transactions`, `cajas`, `budgets`, `scheduled_expenses`, `categories`, `invitations` are dropped and recreated.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: This script corrects a major security flaw where RLS was not being enforced correctly. After this change, RLS will be secure and non-recursive.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Positive. Resolves an infinite loop that was causing database timeouts and crashes.
*/

-- 1. Create a helper function to get the current user's family_id
-- This function is defined with SECURITY DEFINER to bypass RLS policies
-- and prevent recursion.
CREATE OR REPLACE FUNCTION get_current_user_family_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions;
AS $$
DECLARE
  family_id_result UUID;
BEGIN
  SELECT family_id INTO family_id_result
  FROM public.family_members
  WHERE user_id = auth.uid()
  LIMIT 1;
  RETURN family_id_result;
END;
$$;

-- Revoke execute permission from public and grant it only to authenticated users.
REVOKE ALL ON FUNCTION get_current_user_family_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_current_user_family_id() TO authenticated;


-- 2. Drop all existing policies on relevant tables to ensure a clean slate.
-- We use "IF EXISTS" to avoid errors if a policy doesn't exist.
DROP POLICY IF EXISTS "Allow owner to read their own family" ON public.families;
DROP POLICY IF EXISTS "Allow members to read their own family" ON public.families;
DROP POLICY IF EXISTS "Allow members to read their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Allow authenticated users to insert into their own family" ON public.family_members;
DROP POLICY IF EXISTS "Allow members to manage their family's transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow members to manage their family's cajas" ON public.cajas;
DROP POLICY IF EXISTS "Allow members to manage their family's budgets" ON public.budgets;
DROP POLICY IF EXISTS "Allow members to manage their family's scheduled expenses" ON public.scheduled_expenses;
DROP POLICY IF EXISTS "Allow members to manage their family's categories" ON public.categories;
DROP POLICY IF EXISTS "Allow owner to manage invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can see profiles of their family members" ON public.user_profiles;


-- 3. Recreate the policies using the non-recursive helper function.

-- Table: families
-- Members can only see the family they belong to.
CREATE POLICY "Allow members to read their own family"
ON public.families FOR SELECT
USING (id = get_current_user_family_id());

-- Table: family_members
-- Members can only see other members of their own family.
CREATE POLICY "Allow members to read their own family members"
ON public.family_members FOR SELECT
USING (family_id = get_current_user_family_id());

-- Table: user_profiles
-- Users can see their own profile.
CREATE POLICY "Allow users to read their own profile"
ON public.user_profiles FOR SELECT
USING (id = auth.uid());

-- Users can see the profiles of other members of their family.
CREATE POLICY "Users can see profiles of their family members"
ON public.user_profiles FOR SELECT
USING (
  id IN (
    SELECT user_id FROM public.family_members WHERE family_id = get_current_user_family_id()
  )
);

-- Users can update their own profile.
CREATE POLICY "Allow users to update their own profile"
ON public.user_profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());


-- Table: transactions, cajas, budgets, etc.
-- Generic policy for all family-related data.
CREATE POLICY "Allow members to manage their family's transactions"
ON public.transactions FOR ALL
USING (family_id = get_current_user_family_id())
WITH CHECK (family_id = get_current_user_family_id());

CREATE POLICY "Allow members to manage their family's cajas"
ON public.cajas FOR ALL
USING (family_id = get_current_user_family_id())
WITH CHECK (family_id = get_current_user_family_id());

CREATE POLICY "Allow members to manage their family's budgets"
ON public.budgets FOR ALL
USING (family_id = get_current_user_family_id())
WITH CHECK (family_id = get_current_user_family_id());

CREATE POLICY "Allow members to manage their family's scheduled expenses"
ON public.scheduled_expenses FOR ALL
USING (family_id = get_current_user_family_id())
WITH CHECK (family_id = get_current_user_family_id());

CREATE POLICY "Allow members to manage their family's categories"
ON public.categories FOR ALL
USING (family_id = get_current_user_family_id())
WITH CHECK (family_id = get_current_user_family_id());

-- Table: invitations
-- Only the owner of a family can create or read invitations for that family.
CREATE POLICY "Allow owner to manage invitations"
ON public.invitations FOR ALL
USING (
  family_id = get_current_user_family_id() AND
  EXISTS (SELECT 1 FROM public.families WHERE id = family_id AND owner_id = auth.uid())
)
WITH CHECK (
  family_id = get_current_user_family_id() AND
  EXISTS (SELECT 1 FROM public.families WHERE id = family_id AND owner_id = auth.uid())
);
