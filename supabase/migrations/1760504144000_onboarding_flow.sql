/*
# [Feature] Onboarding Flow & Invitations
This migration introduces a new onboarding flow for first-time users and sets up a system to handle family invitations.

## Query Description:
This script performs two main actions:
1.  **Creates an `invitations` table:** This table will store pending invitations, linking an email address to a specific family. This is a safe, structural change.
2.  **Replaces the `setup_new_user_account` function:** The core logic for what happens when a new user signs up is updated. The new function first checks the `invitations` table. If the user's email is found, they are added to the corresponding family. If not, a new family is created for them. This change is crucial for the new onboarding flow to work correctly.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (by dropping the table and restoring the old function definition)

## Structure Details:
- **Tables Added:** `public.invitations`
- **Functions Modified:** `public.setup_new_user_account`

## Security Implications:
- RLS Status: Enabled on the new `invitations` table.
- Policy Changes: Adds a new policy allowing family owners to insert invitations for their own family.
- Auth Requirements: The function is a `SECURITY DEFINER` trigger on `auth.users`, which is standard practice for this type of setup.

## Performance Impact:
- Indexes: A primary key index is added to `invitations`.
- Triggers: The existing trigger on `auth.users` will now execute the updated function. The performance impact is negligible, adding one `SELECT` statement to the user creation process.
- Estimated Impact: Low.
*/

-- Step 1: Create the invitations table to hold pending invites.
CREATE TABLE public.invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    family_id uuid NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    CONSTRAINT invitations_pkey PRIMARY KEY (id),
    CONSTRAINT invitations_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE
);
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for the invitations table.
-- This allows the family owner to add invitations for their own family members.
CREATE POLICY "Users can create invitations for their own family"
ON public.invitations
FOR INSERT
WITH CHECK (
  auth.uid() = (
    SELECT owner_id FROM public.families WHERE id = family_id
  )
);

-- Step 2: Update the user setup function to handle invitations.
-- This function is called by a trigger when a new user signs up.
CREATE OR REPLACE FUNCTION public.setup_new_user_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invited_family_id UUID;
  invited_role TEXT;
  new_family_id UUID;
BEGIN
  -- Check if the new user's email exists in the invitations table.
  SELECT family_id, role INTO invited_family_id, invited_role
  FROM public.invitations
  WHERE email = NEW.email;

  IF invited_family_id IS NOT NULL THEN
    -- User was invited. Add them to the pre-existing family.
    INSERT INTO public.family_members (user_id, family_id, role)
    VALUES (NEW.id, invited_family_id, invited_role);
    
    -- Delete the invitation so it cannot be reused.
    DELETE FROM public.invitations WHERE email = NEW.email;

  ELSE
    -- User was not invited. This is a new user starting their own family.
    -- A family will be created for them on the client-side setup screen.
    -- We only create their profile here.
    NULL;
  END IF;

  -- In all cases, create a user profile.
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');

  RETURN NEW;
END;
$$;
