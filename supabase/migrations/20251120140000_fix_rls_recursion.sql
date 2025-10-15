-- Step 1: Drop existing policies to ensure a clean slate.
-- This is crucial to remove the faulty recursive policies.
DROP POLICY IF EXISTS "Users can read their own family data" ON public.families;
DROP POLICY IF EXISTS "Users can only manage their own family" ON public.families;

DROP POLICY IF EXISTS "Users can see members of their own family" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can manage members" ON public.family_members;

DROP POLICY IF EXISTS "Users can manage transactions of their family" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage cajas of their family" ON public.cajas;
DROP POLICY IF EXISTS "Users can manage budgets of their family" ON public.budgets;
DROP POLICY IF EXISTS "Users can manage scheduled expenses of their family" ON public.scheduled_expenses;
DROP POLICY IF EXISTS "Users can manage categories of their family" ON public.categories;
DROP POLICY IF EXISTS "Users can manage invitations for their family" ON public.invitations;

-- Step 2: Create a safe helper function to get the user's family ID.
-- This function uses SECURITY DEFINER to bypass RLS and break the recursion loop.
CREATE OR REPLACE FUNCTION public.get_my_family_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT family_id
    FROM public.family_members
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Step 3: Re-create all policies using the safe helper function.

-- Policies for 'families'
CREATE POLICY "Users can read their own family data"
ON public.families FOR SELECT
USING (id = get_my_family_id());

CREATE POLICY "Users can only manage their own family"
ON public.families FOR UPDATE
USING (owner_id = auth.uid());

-- Policies for 'family_members'
CREATE POLICY "Users can see members of their own family"
ON public.family_members FOR SELECT
USING (family_id = get_my_family_id());

CREATE POLICY "Family owners can manage members"
ON public.family_members FOR DELETE
USING (
  get_my_family_id() = (SELECT f.id FROM public.families f WHERE f.owner_id = auth.uid())
  AND user_id <> auth.uid() -- Owner cannot delete themselves
);

-- Policies for other tables
CREATE POLICY "Users can manage transactions of their family"
ON public.transactions FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Users can manage cajas of their family"
ON public.cajas FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Users can manage budgets of their family"
ON public.budgets FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Users can manage scheduled expenses of their family"
ON public.scheduled_expenses FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Users can manage categories of their family"
ON public.categories FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Users can manage invitations for their family"
ON public.invitations FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());
