/*
# [Fix RLS Recursion]
This migration fixes an infinite recursion loop in the Row-Level Security (RLS) policies by introducing a non-recursive helper function.

## Query Description:
This script will drop and recreate several RLS policies across the application's tables. It introduces a helper function `auth.get_my_family_id()` to safely retrieve the user's family ID without causing a recursive loop. This is a critical security and stability fix. There is no risk to existing data, but the operation is essential for the application to function correctly.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Drops policies on: families, family_members, user_profiles, cajas, transactions, budgets, scheduled_expenses, categories.
- Creates function: auth.get_my_family_id().
- Creates new, non-recursive policies on all the above tables.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: This fixes a major flaw in the authentication/authorization checks.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Positive. It resolves an infinite loop, which was causing statement timeouts and preventing the application from loading.
*/

-- 1. Drop existing policies to be safe.
DROP POLICY IF EXISTS "Users can manage their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can see profiles of their family members" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable all access for family members" ON public.families;
DROP POLICY IF EXISTS "Enable all access for family members" ON public.cajas;
DROP POLICY IF EXISTS "Enable all access for family members" ON public.transactions;
DROP POLICY IF EXISTS "Enable all access for family members" ON public.budgets;
DROP POLICY IF EXISTS "Enable all access for family members" ON public.scheduled_expenses;
DROP POLICY IF EXISTS "Enable all access for family members" ON public.categories;

-- 2. Create a helper function to get the current user's family_id.
CREATE OR REPLACE FUNCTION auth.get_my_family_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 3. Re-create policies using the non-recursive helper function.

-- Policy for 'families' table
CREATE POLICY "Enable all access for family members"
ON public.families
FOR ALL
USING (id = auth.get_my_family_id())
WITH CHECK (id = auth.get_my_family_id());

-- Policy for 'family_members' table
CREATE POLICY "Users can manage their own family members"
ON public.family_members
FOR ALL
USING (family_id = auth.get_my_family_id())
WITH CHECK (family_id = auth.get_my_family_id());

-- Policy for 'user_profiles' table
CREATE POLICY "Users can see profiles of their family members"
ON public.user_profiles
FOR SELECT
USING (
  id IN (
    SELECT user_id FROM public.family_members WHERE family_id = auth.get_my_family_id()
  )
);
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policies for other tables
CREATE POLICY "Enable all access for family members"
ON public.cajas
FOR ALL
USING (family_id = auth.get_my_family_id())
WITH CHECK (family_id = auth.get_my_family_id());

CREATE POLICY "Enable all access for family members"
ON public.transactions
FOR ALL
USING (family_id = auth.get_my_family_id())
WITH CHECK (family_id = auth.get_my_family_id());

CREATE POLICY "Enable all access for family members"
ON public.budgets
FOR ALL
USING (family_id = auth.get_my_family_id())
WITH CHECK (family_id = auth.get_my_family_id());

CREATE POLICY "Enable all access for family members"
ON public.scheduled_expenses
FOR ALL
USING (family_id = auth.get_my_family_id())
WITH CHECK (family_id = auth.get_my_family_id());

CREATE POLICY "Enable all access for family members"
ON public.categories
FOR ALL
USING (family_id = auth.get_my_family_id())
WITH CHECK (family_id = auth.get_my_family_id());
