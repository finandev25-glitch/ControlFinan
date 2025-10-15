/*
  # Fix Recursive RLS Policy on family_members

  This script fixes an infinite recursion error in the Row Level Security (RLS) policies
  for the `family_members` table. The error occurs when a policy on a table tries to
  select from the same table, creating a loop.

  ## Query Description:
  This operation will drop and recreate security policies on the `family_members` table.
  It introduces a helper function `get_my_family_id()` to safely get the current user's
  family ID without causing recursion. This is a critical security and stability fix.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Drops existing policies on `public.family_members`.
  - Creates a new function `public.get_my_family_id()`.
  - Creates new, non-recursive policies on `public.family_members`.

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes
  - Auth Requirements: Policies rely on `auth.uid()`.
*/

-- Step 1: Create a helper function to get the current user's family_id safely.
-- This avoids the recursive loop in the policy.
CREATE OR REPLACE FUNCTION public.get_my_family_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 2: Drop the old, faulty policies.
-- We drop all policies to ensure a clean slate.
DROP POLICY IF EXISTS "Users can see their own family membership" ON public.family_members;
DROP POLICY IF EXISTS "Users can see members of their own family" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can add new members" ON public.family_members;
DROP POLICY IF EXISTS "Users can update their own role" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can remove members" ON public.family_members;

-- Step 3: Create a new, non-recursive SELECT policy.
-- This uses the helper function to prevent the infinite loop.
CREATE POLICY "Users can see members of their own family"
ON public.family_members
FOR SELECT
USING (
  family_id = public.get_my_family_id()
);

-- Step 4: Recreate a safe INSERT policy.
-- Allows authenticated users to be added to a family (e.g., via invitation logic).
CREATE POLICY "Authenticated users can be inserted"
ON public.family_members
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);
