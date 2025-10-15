-- Step 1: Drop existing policies and functions to ensure a clean slate.
-- Dropping policies on tables that might have dependencies.
DROP POLICY IF EXISTS "Users can manage their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can view their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can only view their own family" ON public.families;
DROP POLICY IF EXISTS "Users can only update their own family name" ON public.families;
DROP POLICY IF EXISTS "Users can manage transactions of their family" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage cajas of their family" ON public.cajas;
DROP POLICY IF EXISTS "Users can manage budgets of their family" ON public.budgets;
DROP POLICY IF EXISTS "Users can manage scheduled expenses of their family" ON public.scheduled_expenses;
DROP POLICY IF EXISTS "Users can manage categories of their family" ON public.categories;
DROP POLICY IF EXISTS "Family owners can manage invitations for their family" ON public.invitations;
DROP POLICY IF EXISTS "Users can see invitations for their email" ON public.invitations;

-- Drop the problematic function if it exists.
DROP FUNCTION IF EXISTS public.get_user_family_id();

-- Step 2: Create a non-recursive helper function to get the user's family ID.
-- This function runs with the permissions of the user who defines it (the owner),
-- which is typically a superuser that bypasses RLS. This is the key to breaking the recursion.
CREATE OR REPLACE FUNCTION public.get_user_family_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
-- Set a specific search path to avoid security issues
SET search_path = public
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 3: Recreate all policies using the safe helper function.

-- Policies for 'families' table
CREATE POLICY "Users can only view their own family"
ON public.families FOR SELECT
USING (id = public.get_user_family_id());

CREATE POLICY "Users can only update their own family name"
ON public.families FOR UPDATE
USING (id = public.get_user_family_id());

-- Policies for 'family_members' table
-- This is the critical one. It now uses the safe helper function.
CREATE POLICY "Users can view their own family members"
ON public.family_members FOR SELECT
USING (family_id = public.get_user_family_id());

-- Allow family owners to add/remove members
CREATE POLICY "Users can manage their own family members"
ON public.family_members FOR ALL
USING (EXISTS (
  SELECT 1 FROM families
  WHERE families.id = family_members.family_id AND families.owner_id = auth.uid()
));

-- Policies for 'transactions' table
CREATE POLICY "Users can manage transactions of their family"
ON public.transactions FOR ALL
USING (family_id = public.get_user_family_id());

-- Policies for 'cajas' table
CREATE POLICY "Users can manage cajas of their family"
ON public.cajas FOR ALL
USING (family_id = public.get_user_family_id());

-- Policies for 'budgets' table
CREATE POLICY "Users can manage budgets of their family"
ON public.budgets FOR ALL
USING (family_id = public.get_user_family_id());

-- Policies for 'scheduled_expenses' table
CREATE POLICY "Users can manage scheduled expenses of their family"
ON public.scheduled_expenses FOR ALL
USING (family_id = public.get_user_family_id());

-- Policies for 'categories' table
CREATE POLICY "Users can manage categories of their family"
ON public.categories FOR ALL
USING (family_id = public.get_user_family_id());

-- Policies for 'invitations' table
CREATE POLICY "Family owners can manage invitations for their family"
ON public.invitations FOR ALL
USING (EXISTS (
  SELECT 1 FROM families
  WHERE families.id = invitations.family_id AND families.owner_id = auth.uid()
));

CREATE POLICY "Users can see invitations for their email"
ON public.invitations FOR SELECT
USING (email = auth.email());
