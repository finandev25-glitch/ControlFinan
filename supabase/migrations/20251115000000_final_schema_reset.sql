-- STEP 1: Clean up everything in the correct order to avoid dependency issues.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_my_family_ids();
DROP FUNCTION IF EXISTS public.is_family_admin(uuid);
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.budgets;
DROP TABLE IF EXISTS public.scheduled_expenses;
DROP TABLE IF EXISTS public.cajas;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.family_members;
DROP TABLE IF EXISTS public.members;
DROP TABLE IF EXISTS public.families;
DROP TABLE IF EXISTS public.user_profiles;
DROP TYPE IF EXISTS public.family_role;

-- STEP 2: Create all tables from scratch.
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT
);
COMMENT ON TABLE public.user_profiles IS 'Stores public profile information for users.';

CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.families IS 'Stores information about each family group.';

CREATE TYPE public.family_role AS ENUM ('admin', 'member');
CREATE TABLE public.family_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.family_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(family_id, user_id)
);
COMMENT ON TABLE public.family_members IS 'Links users to families and defines their role within the family.';

CREATE TABLE public.members (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.members IS 'Stores non-user members or dependents within a family for tracking purposes.';

CREATE TABLE public.cajas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
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
    monthly_payment NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.cajas IS 'Stores all cash boxes, bank accounts, credit cards, and loans for a family.';

CREATE TABLE public.categories (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(family_id, name, type)
);
COMMENT ON TABLE public.categories IS 'Stores income and expense categories for a family.';

CREATE TABLE public.transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    caja_id BIGINT NOT NULL REFERENCES public.cajas(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    transfer_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.transactions IS 'Stores all financial transactions for a family.';

CREATE TABLE public.budgets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    limit_amount NUMERIC NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(family_id, category, year, month)
);
COMMENT ON TABLE public.budgets IS 'Stores monthly budgets for expense categories.';

CREATE TABLE public.scheduled_expenses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    day_of_month INT NOT NULL,
    member_id BIGINT REFERENCES public.members(id) ON DELETE SET NULL,
    caja_id BIGINT REFERENCES public.cajas(id) ON DELETE SET NULL,
    credit_card_id BIGINT REFERENCES public.cajas(id) ON DELETE SET NULL,
    is_automatic BOOLEAN DEFAULT FALSE,
    is_credit_card_payment BOOLEAN DEFAULT FALSE,
    confirmed_months TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.scheduled_expenses IS 'Stores recurring monthly expenses.';

-- STEP 3: Create functions and triggers for automation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_family_id UUID;
  new_member_id BIGINT;
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.families (name, owner_id)
  VALUES (new.raw_user_meta_data->>'full_name' || '''s Family', new.id)
  RETURNING id INTO new_family_id;

  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (new_family_id, new.id, 'admin');

  INSERT INTO public.members (family_id, name, avatar, role)
  VALUES (new_family_id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'Aportante Principal')
  RETURNING id INTO new_member_id;

  INSERT INTO public.cajas (family_id, member_id, name, type)
  VALUES (new_family_id, new_member_id, 'Efectivo', 'Efectivo');

  INSERT INTO public.categories (family_id, name, type, icon_name) VALUES
    (new_family_id, 'Alimentación', 'Gasto', 'ShoppingBasket'), (new_family_id, 'Transporte', 'Gasto', 'Car'),
    (new_family_id, 'Vivienda', 'Gasto', 'Home'), (new_family_id, 'Ocio', 'Gasto', 'Smile'),
    (new_family_id, 'Salud', 'Gasto', 'HeartPulse'), (new_family_id, 'Educación', 'Gasto', 'GraduationCap'),
    (new_family_id, 'Servicios', 'Gasto', 'Home'), (new_family_id, 'Suscripciones', 'Gasto', 'Smile'),
    (new_family_id, 'Nómina', 'Ingreso', 'Briefcase'), (new_family_id, 'Beneficios', 'Ingreso', 'Landmark'),
    (new_family_id, 'Ventas', 'Ingreso', 'TrendingUp'), (new_family_id, 'Regalo', 'Ingreso', 'Gift'),
    (new_family_id, 'Otros', 'Ingreso', 'MoreHorizontal'), (new_family_id, 'Otros', 'Gasto', 'MoreHorizontal'),
    (new_family_id, 'Transferencia', 'Gasto', 'ArrowLeftRight'), (new_family_id, 'Transferencia', 'Ingreso', 'ArrowLeftRight'),
    (new_family_id, 'Transferencia Interna', 'Gasto', 'ArrowLeftRight'), (new_family_id, 'Transferencia Interna', 'Ingreso', 'ArrowLeftRight');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- STEP 4: Enable RLS and define policies for all tables.
CREATE OR REPLACE FUNCTION public.get_my_family_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY INVOKER AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_family_admin(p_family_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY INVOKER AS $$
  SELECT EXISTS (SELECT 1 FROM public.family_members WHERE user_id = auth.uid() AND family_id = p_family_id AND role = 'admin');
$$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see profiles of their family members" ON public.user_profiles FOR SELECT USING (id IN (SELECT user_id FROM public.family_members WHERE family_id IN (SELECT get_my_family_ids())));
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can see families they are a member of" ON public.families FOR SELECT USING (id IN (SELECT get_my_family_ids()));
CREATE POLICY "Family admins can update their family name" ON public.families FOR UPDATE USING (is_family_admin(id));
CREATE POLICY "Users can see members of their own family" ON public.family_members FOR SELECT USING (family_id IN (SELECT get_my_family_ids()));
CREATE POLICY "Admins can manage members in their family" ON public.family_members FOR ALL USING (is_family_admin(family_id)) WITH CHECK (is_family_admin(family_id));
CREATE POLICY "Family members can manage their family's data" ON public.members FOR ALL USING (family_id IN (SELECT get_my_family_ids()));
CREATE POLICY "Family members can manage their family's data" ON public.cajas FOR ALL USING (family_id IN (SELECT get_my_family_ids()));
CREATE POLICY "Family members can manage their family's data" ON public.categories FOR ALL USING (family_id IN (SELECT get_my_family_ids()));
CREATE POLICY "Family members can manage their family's data" ON public.transactions FOR ALL USING (family_id IN (SELECT get_my_family_ids()));
CREATE POLICY "Family members can manage their family's data" ON public.budgets FOR ALL USING (family_id IN (SELECT get_my_family_ids()));
CREATE POLICY "Family members can manage their family's data" ON public.scheduled_expenses FOR ALL USING (family_id IN (SELECT get_my_family_ids()));
