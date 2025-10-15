-- =================================================================
-- MIGRACIÓN DE REPARACIÓN DEFINITIVA PARA BUCLES DE RECURSIÓN RLS
-- =================================================================
-- Este script soluciona el error "infinite recursion detected in policy".
-- Lo hace eliminando en cascada las funciones y políticas problemáticas
-- y recreándolas de una manera segura y no recursiva.

-- PASO 1: Eliminar la función auxiliar y TODAS las políticas que dependen de ella.
-- El uso de 'CASCADE' es crucial aquí para romper el ciclo de dependencias
-- que causaba los errores en las migraciones anteriores.
DROP FUNCTION IF EXISTS public.get_my_family_id() CASCADE;

-- PASO 2: Recrear la función auxiliar de forma segura.
-- La clave es 'SECURITY DEFINER', que ejecuta la función con los permisos del
-- creador (el superusuario 'postgres'), el cual ignora las políticas RLS.
-- Esto rompe el bucle: la política llama a la función, y la función consulta
-- la tabla sin volver a activar la política.
CREATE OR REPLACE FUNCTION public.get_my_family_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
-- Establece una ruta de búsqueda segura para evitar vulnerabilidades.
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

-- PASO 3: Recrear todas las políticas de seguridad que fueron eliminadas por CASCADE.
-- Ahora usarán la nueva función segura.

-- Política para la tabla 'families'
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own family data" ON public.families
  FOR SELECT USING (id = get_my_family_id());

-- Políticas para la tabla 'family_members'
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see members of their own family" ON public.family_members
  FOR SELECT USING (family_id = get_my_family_id());
CREATE POLICY "Family owners can manage members" ON public.family_members
  FOR ALL USING (
    family_id = get_my_family_id() AND
    (
      SELECT role FROM public.family_members WHERE user_id = auth.uid() AND family_id = get_my_family_id()
    ) = 'Aportante Principal'
  );

-- Políticas para las tablas principales de la aplicación
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage transactions of their family" ON public.transactions
  FOR ALL USING (family_id = get_my_family_id());

ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage cajas of their family" ON public.cajas
  FOR ALL USING (family_id = get_my_family_id());

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage budgets of their family" ON public.budgets
  FOR ALL USING (family_id = get_my_family_id());

ALTER TABLE public.scheduled_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage scheduled expenses of their family" ON public.scheduled_expenses
  FOR ALL USING (family_id = get_my_family_id());

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage categories of their family" ON public.categories
  FOR ALL USING (family_id = get_my_family_id());

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage invitations for their family" ON public.invitations
  FOR ALL USING (family_id = get_my_family_id());
