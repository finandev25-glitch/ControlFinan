-- Primero, eliminamos la función y todas las políticas que dependen de ella.
DROP FUNCTION IF EXISTS get_my_family_id() CASCADE;

-- Creamos una función segura que no causa recursión.
CREATE OR REPLACE FUNCTION get_my_family_id()
RETURNS UUID AS $$
DECLARE
  family_id_result UUID;
BEGIN
  SELECT family_id INTO family_id_result
  FROM public.family_members
  WHERE user_id = auth.uid()
  LIMIT 1;
  RETURN family_id_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Ahora, volvemos a activar RLS en todas las tablas
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Eliminamos las políticas antiguas (si existen) para asegurar una instalación limpia
DROP POLICY IF EXISTS "Users can read their own family data" ON public.families;
DROP POLICY IF EXISTS "Users can see members of their own family" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can manage members" ON public.family_members;
DROP POLICY IF EXISTS "Users can manage transactions of their family" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage cajas of their family" ON public.cajas;
DROP POLICY IF EXISTS "Users can manage budgets of their family" ON public.budgets;
DROP POLICY IF EXISTS "Users can manage scheduled expenses of their family" ON public.scheduled_expenses;
DROP POLICY IF EXISTS "Users can manage categories of their family" ON public.categories;
DROP POLICY IF EXISTS "Users can manage invitations for their family" ON public.invitations;
DROP POLICY IF EXISTS "Users can see profiles of their family members" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Creamos las nuevas políticas, ahora sí, de forma segura y no recursiva

-- Policies for 'families'
CREATE POLICY "Users can read their own family data"
ON public.families FOR SELECT
USING (id = get_my_family_id());

-- Policies for 'family_members'
CREATE POLICY "Users can see members of their own family"
ON public.family_members FOR SELECT
USING (family_id = get_my_family_id());

CREATE POLICY "Family owners can manage members"
ON public.family_members FOR ALL
USING (family_id = get_my_family_id() AND (SELECT owner_id FROM families WHERE id = family_id) = auth.uid())
WITH CHECK (family_id = get_my_family_id() AND (SELECT owner_id FROM families WHERE id = family_id) = auth.uid());

-- Policies for 'transactions'
CREATE POLICY "Users can manage transactions of their family"
ON public.transactions FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

-- Policies for 'cajas'
CREATE POLICY "Users can manage cajas of their family"
ON public.cajas FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

-- Policies for 'budgets'
CREATE POLICY "Users can manage budgets of their family"
ON public.budgets FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

-- Policies for 'scheduled_expenses'
CREATE POLICY "Users can manage scheduled expenses of their family"
ON public.scheduled_expenses FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

-- Policies for 'categories'
CREATE POLICY "Users can manage categories of their family"
ON public.categories FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

-- Policies for 'invitations'
CREATE POLICY "Users can manage invitations for their family"
ON public.invitations FOR ALL
USING (family_id = get_my_family_id())
WITH CHECK (family_id = get_my_family_id());

-- Policies for 'user_profiles'
CREATE POLICY "Users can see profiles of their family members"
ON public.user_profiles FOR SELECT
USING (EXISTS (
  SELECT 1 FROM family_members fm
  WHERE fm.family_id = get_my_family_id() AND fm.user_id = user_profiles.id
));

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
