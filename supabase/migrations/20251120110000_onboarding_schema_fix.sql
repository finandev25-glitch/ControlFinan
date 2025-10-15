-- Drop existing objects in reverse order of dependency to ensure a clean slate.
DROP POLICY IF EXISTS "Users can manage their own family" ON public.families;
DROP POLICY IF EXISTS "Users can view their own family" ON public.families;
DROP POLICY IF EXISTS "Users can manage their family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can view their family members" ON public.family_members;
DROP POLICY IF EXISTS "Owners can manage invitations" ON public.invitations;
DROP FUNCTION IF EXISTS public.accept_invitation();
DROP FUNCTION IF EXISTS public.get_my_family_id();
DROP FUNCTION IF EXISTS public.setup_new_user_account(); -- Drop old function if it exists

-- Use CASCADE to handle dependencies that might have been created.
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.family_members CASCADE;
DROP TABLE IF EXISTS public.families CASCADE;

-- 1. Create families table
CREATE TABLE public.families (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.families ADD PRIMARY KEY (id);
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- 2. Create family_members table
CREATE TABLE public.family_members (
    family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.family_members ADD PRIMARY KEY (family_id, user_id);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- 3. Create invitations table
CREATE TABLE public.invitations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.invitations ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX invitations_family_id_email_idx ON public.invitations (family_id, email);
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 4. Helper function to get the user's family ID
CREATE FUNCTION public.get_my_family_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT family_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 5. Policies
CREATE POLICY "Users can view their own family"
ON public.families FOR SELECT
USING (id = public.get_my_family_id());

CREATE POLICY "Owners can update their own family"
ON public.families FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their family members"
ON public.family_members FOR SELECT
USING (family_id = public.get_my_family_id());

CREATE POLICY "Owners can manage their family members"
ON public.family_members FOR ALL
USING (family_id = public.get_my_family_id() AND (SELECT owner_id FROM families WHERE id = family_id) = auth.uid());

CREATE POLICY "Owners can manage invitations"
ON public.invitations FOR ALL
USING (family_id = public.get_my_family_id() AND (SELECT owner_id FROM families WHERE id = family_id) = auth.uid());

-- 6. RPC function to accept an invitation
CREATE FUNCTION public.accept_invitation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invitation_record RECORD;
    user_email TEXT;
BEGIN
    -- Get the current user's email from the auth schema
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

    -- Find an invitation for the current user's email
    SELECT * INTO invitation_record
    FROM public.invitations
    WHERE email = user_email
    LIMIT 1;

    -- If an invitation is found
    IF FOUND THEN
        -- Add the user to the family
        INSERT INTO public.family_members (family_id, user_id, role)
        VALUES (invitation_record.family_id, auth.uid(), invitation_record.role);

        -- Delete the invitation so it can't be used again
        DELETE FROM public.invitations WHERE id = invitation_record.id;
    END IF;
END;
$$;
