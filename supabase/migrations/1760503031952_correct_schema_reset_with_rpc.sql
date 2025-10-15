-- 1. Drop existing objects in the public schema to ensure a clean slate
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 2. Create tables
CREATE TABLE public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT
);

CREATE TABLE public.family_members (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Aportante Principal', 'Aportante', 'Dependiente')),
    PRIMARY KEY (user_id, family_id)
);

CREATE TABLE public.categories (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Ingreso', 'Gasto')),
    icon_name TEXT,
    UNIQUE (family_id, name, type)
);

CREATE TABLE public.cajas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    bank TEXT,
    account_number TEXT,
    currency TEXT DEFAULT 'PEN',
    card_number TEXT,
    credit_line NUMERIC,
    closing_day INT,
    payment_due_date INT,
    loan_purpose TEXT,
    total_installments INT,
    paid_installments INT,
    payment_day INT,
    monthly_payment NUMERIC
);

CREATE TABLE public.transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    caja_id BIGINT REFERENCES public.cajas(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Ingreso', 'Gasto')),
    category TEXT,
    transfer_id UUID
);

CREATE TABLE public.budgets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    limit_amount NUMERIC NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    UNIQUE(family_id, category, year, month)
);

CREATE TABLE public.scheduled_expenses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    day_of_month INT NOT NULL,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    caja_id BIGINT REFERENCES public.cajas(id) ON DELETE CASCADE,
    confirmed_months TEXT[],
    is_automatic BOOLEAN DEFAULT false,
    is_credit_card_payment BOOLEAN DEFAULT false,
    credit_card_id BIGINT REFERENCES public.cajas(id) ON DELETE SET NULL
);

-- 3. Enable RLS on all tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_expenses ENABLE ROW LEVEL SECURITY;

-- 4. Create RPC function for setting up a new user account
CREATE OR REPLACE FUNCTION public.setup_new_user_account(user_id uuid, user_meta_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  family_id_result uuid;
  user_full_name TEXT;
BEGIN
  -- Extract full_name and handle potential null
  user_full_name := user_meta_data->>'full_name';
  IF user_full_name IS NULL OR user_full_name = '' THEN
    user_full_name := 'Mi';
  END IF;

  -- Create a new family for the user
  INSERT INTO public.families (name)
  VALUES (user_full_name || '''s Family')
  RETURNING id INTO family_id_result;

  -- Add the new user to the family_members table
  INSERT INTO public.family_members (user_id, family_id, role)
  VALUES (user_id, family_id_result, 'Aportante Principal');

  -- Create a profile for the new user
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (user_id, user_meta_data->>'full_name', user_meta_data->>'avatar_url');

  RETURN family_id_result;
END;
$$;

-- 5. Create helper function for RLS
CREATE OR REPLACE FUNCTION public.get_current_family_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  family_id_result uuid;
BEGIN
  SELECT family_id INTO family_id_result
  FROM public.family_members
  WHERE user_id = auth.uid()
  LIMIT 1;
  RETURN family_id_result;
END;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_current_family_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_new_user_account(uuid, jsonb) TO authenticated;

-- 7. Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.families FOR SELECT USING (true);
CREATE POLICY "Users can manage their own family" ON public.families FOR ALL USING (id = public.get_current_family_id()) WITH CHECK (id = public.get_current_family_id());

CREATE POLICY "Enable read access for all users" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Enable read access for all users" ON public.family_members FOR SELECT USING (true);

CREATE POLICY "Users can manage their own family data" ON public.categories FOR ALL USING (family_id = public.get_current_family_id()) WITH CHECK (family_id = public.get_current_family_id());
CREATE POLICY "Users can manage their own family data" ON public.cajas FOR ALL USING (family_id = public.get_current_family_id()) WITH CHECK (family_id = public.get_current_family_id());
CREATE POLICY "Users can manage their own family data" ON public.transactions FOR ALL USING (family_id = public.get_current_family_id()) WITH CHECK (family_id = public.get_current_family_id());
CREATE POLICY "Users can manage their own family data" ON public.budgets FOR ALL USING (family_id = public.get_current_family_id()) WITH CHECK (family_id = public.get_current_family_id());
CREATE POLICY "Users can manage their own family data" ON public.scheduled_expenses FOR ALL USING (family_id = public.get_current_family_id()) WITH CHECK (family_id = public.get_current_family_id());

-- 8. Create the safe view
CREATE OR REPLACE VIEW public.family_members_view AS
SELECT
    fm.user_id,
    fm.family_id,
    fm.role,
    up.full_name,
    up.avatar_url
FROM
    public.family_members fm
LEFT JOIN
    public.user_profiles up ON fm.user_id = up.id;

ALTER VIEW public.family_members_view SET (security_invoker = true);
