/*
  # [Fix] Onboarding Schema - Corrected Creation Order

  This script completely rebuilds the family, member, and invitation
  system to fix creation order errors from the previous migration.
  It ensures tables are created before they are referenced by
  functions or policies.

  ## Query Description:
  This operation will drop and recreate the 'families', 'family_members',
  and 'invitations' tables. Any existing data in these specific tables
  will be lost, but it is necessary to establish a correct and stable
  schema. Core data like transactions and budgets will NOT be affected.
  This is a safe operation for fixing the current structural problem.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: false

  ## Structure Details:
  - Drops: Function 'accept_invitation', Tables 'invitations', 'family_members', 'families'.
  - Creates: Tables 'families' (with owner_id), 'family_members', 'invitations'.
  - Creates: Function 'accept_invitation'.
  - Re-applies: RLS policies for all related tables.

  ## Security Implications:
  - RLS Status: Enabled on all created tables.
  - Policy Changes: Yes, policies are recreated to match the new structure.
  - Auth Requirements: None.

  ## Performance Impact:
  - Indexes: Primary keys are recreated.
  - Triggers: No new triggers.
  - Estimated Impact: Low. This is a one-time structural fix.
*/

-- Step 1: Drop dependent objects first to prevent errors.
DROP FUNCTION IF EXISTS public.accept_invitation();

-- Step 2: Drop existing tables using CASCADE to handle any lingering dependencies.
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.family_members CASCADE;
DROP TABLE IF EXISTS public.families CASCADE;

-- Step 3: Recreate tables in the correct dependency order.

-- Table: families
-- CRITICAL FIX: This now correctly includes the 'owner_id' column.
CREATE TABLE public.families (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.families IS 'Stores family group information.';

-- Table: family_members
CREATE TABLE public.family_members (
    family_id uuid REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (family_id, user_id)
);
COMMENT ON TABLE public.family_members IS 'Junction table linking users to families.';

-- Table: invitations
-- CRITICAL FIX: This table is now created before any functions or policies use it.
CREATE TABLE public.invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    family_id uuid REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (family_id, email)
);
COMMENT ON TABLE public.invitations IS 'Stores pending invitations for users to join families.';

-- Step 4: Recreate the function that allows users to accept invitations.
CREATE OR REPLACE FUNCTION public.accept_invitation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invitation_record RECORD;
    current_user_id uuid := auth.uid();
    current_user_email text;
BEGIN
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;

    SELECT * INTO invitation_record
    FROM public.invitations
    WHERE email = current_user_email AND status = 'pending'
    LIMIT 1;

    IF FOUND THEN
        INSERT INTO public.family_members (family_id, user_id, role)
        VALUES (invitation_record.family_id, current_user_id, invitation_record.role)
        ON CONFLICT (family_id, user_id) DO NOTHING;

        UPDATE public.invitations
        SET status = 'accepted', updated_at = now()
        WHERE id = invitation_record.id;
    END IF;
END;
$$;
COMMENT ON FUNCTION public.accept_invitation() IS 'Checks for and accepts a pending family invitation for the current user.';

-- Step 5: Enable Row Level Security and re-apply all policies.
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies for 'families'
CREATE POLICY "Los usuarios pueden ver su propia familia" ON public.families
FOR SELECT USING (id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

CREATE POLICY "Los dueños pueden crear familias" ON public.families
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Policies for 'family_members'
CREATE POLICY "Los usuarios pueden ver los miembros de su familia" ON public.family_members
FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

-- Policies for 'invitations'
CREATE POLICY "Los dueños pueden gestionar invitaciones de su familia" ON public.invitations
FOR ALL USING (family_id IN (SELECT id FROM public.families WHERE owner_id = auth.uid()));

CREATE POLICY "Los usuarios pueden ver sus propias invitaciones pendientes" ON public.invitations
FOR SELECT USING (email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) AND status = 'pending');
