/*
# [FINAL RLS RECURSION FIX]
Este script repara las políticas de seguridad a nivel de fila (RLS) que causaban un bucle de recursión infinito.

## Descripción de la Consulta:
Se eliminan las políticas existentes en varias tablas y se reemplazan por versiones seguras y no recursivas. Se crea una función auxiliar `get_my_family_id()` para obtener de forma segura el ID de la familia del usuario actual, rompiendo así el bucle.

## Metadatos:
- Categoría del Esquema: "Structural"
- Nivel de Impacto: "High"
- Requiere Respaldo: false
- Reversible: false (pero reemplaza con la configuración correcta)

## Detalles de la Estructura:
- Afecta a las políticas RLS de las tablas: `family_members`, `transactions`, `cajas`, `budgets`, `scheduled_expenses`, `categories`.
- Crea la función `public.get_my_family_id()`.

## Implicaciones de Seguridad:
- Estado RLS: Habilitado
- Cambios en Políticas: Sí. Se corrigen políticas defectuosas para hacer cumplir correctamente el aislamiento de datos entre familias.
- Requisitos de Autenticación: Todas las operaciones requieren un usuario autenticado.
*/

-- STEP 1: Drop all existing, potentially recursive policies for a clean slate.
DROP POLICY IF EXISTS "Users can view members of their own family" ON public.family_members;
DROP POLICY IF EXISTS "Users can insert members into their own family" ON public.family_members;
DROP POLICY IF EXISTS "Users can only view their own family's transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can only insert into their own family's transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can only update their own family's transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can only delete their own family's transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can only view their own family's cajas" ON public.cajas;
DROP POLICY IF EXISTS "Users can only insert into their own family's cajas" ON public.cajas;
DROP POLICY IF EXISTS "Users can only view their own family's budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can only insert into their own family's budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can only update their own family's budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can only delete their own family's budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can only view their own family's scheduled expenses" ON public.scheduled_expenses;
DROP POLICY IF EXISTS "Users can only insert into their own family's scheduled expenses" ON public.scheduled_expenses;
DROP POLICY IF EXISTS "Users can only update their own family's scheduled expenses" ON public.scheduled_expenses;
DROP POLICY IF EXISTS "Users can only view their own family's categories" ON public.categories;
DROP POLICY IF EXISTS "Users can only insert into their own family's categories" ON public.categories;
DROP POLICY IF EXISTS "Users can only delete their own family's categories" ON public.categories;

-- STEP 2: Create a safe helper function to get the user's family ID without recursion.
CREATE OR REPLACE FUNCTION public.get_my_family_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- STEP 3: Recreate all policies using the safe helper function.

-- Policies for family_members
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view members of their own family"
  ON public.family_members FOR SELECT
  USING (family_id = get_my_family_id());
CREATE POLICY "Users can insert members into their own family"
  ON public.family_members FOR INSERT
  WITH CHECK (family_id = get_my_family_id());
CREATE POLICY "Family owners can delete members"
  ON public.family_members FOR DELETE
  USING (
    get_my_family_id() IN (SELECT f.id FROM families f WHERE f.owner_id = auth.uid())
    AND user_id != auth.uid() -- Prevent owner from deleting themselves
  );

-- Policies for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own family's transactions"
  ON public.transactions FOR ALL
  USING (family_id = get_my_family_id())
  WITH CHECK (family_id = get_my_family_id());

-- Policies for cajas
ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own family's cajas"
  ON public.cajas FOR ALL
  USING (family_id = get_my_family_id())
  WITH CHECK (family_id = get_my_family_id());

-- Policies for budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own family's budgets"
  ON public.budgets FOR ALL
  USING (family_id = get_my_family_id())
  WITH CHECK (family_id = get_my_family_id());

-- Policies for scheduled_expenses
ALTER TABLE public.scheduled_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own family's scheduled expenses"
  ON public.scheduled_expenses FOR ALL
  USING (family_id = get_my_family_id())
  WITH CHECK (family_id = get_my_family_id());

-- Policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own family's categories"
  ON public.categories FOR ALL
  USING (family_id = get_my_family_id())
  WITH CHECK (family_id = get_my_family_id());
