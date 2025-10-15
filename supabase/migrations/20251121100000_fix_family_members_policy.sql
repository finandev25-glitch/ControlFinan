-- =================================================================
-- MIGRACIÓN CRÍTICA DE SEGURIDAD: REPARACIÓN DE POLÍTICAS RECURSIVAS
-- =================================================================
-- Este script soluciona un error crítico de "recursión infinita"
-- eliminando y reconstruyendo las políticas de seguridad (RLS)
-- para la tabla `family_members`.
-- =================================================================

-- PASO 1: Eliminar TODAS las políticas existentes en `family_members` para empezar de cero.
-- Esto es crucial para asegurar que ninguna regla antigua y defectuosa siga activa.
DROP POLICY IF EXISTS "Users can view their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can insert new members" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can update members" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can delete members" ON public.family_members;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.family_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.family_members;


-- PASO 2: Crear una función auxiliar segura para obtener el ID de la familia del usuario actual.
-- Esta función NO es recursiva y es la forma correcta de obtener esta información dentro de una política.
CREATE OR REPLACE FUNCTION public.get_user_family_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
-- IMPORTANTE: SECURITY DEFINER es necesario para que la función pueda leer la tabla `family_members`
-- antes de que la política de SELECT se aplique al usuario.
SET search_path = public
AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1;
$$;


-- PASO 3: Crear las nuevas políticas de seguridad, ahora de forma correcta y no recursiva.

-- POLÍTICA DE SELECCIÓN (SELECT):
-- Los usuarios solo pueden ver los miembros que pertenecen a su misma familia.
CREATE POLICY "Users can view their own family members"
ON public.family_members
FOR SELECT
USING (
  family_id = public.get_user_family_id()
);

-- POLÍTICA DE INSERCIÓN (INSERT):
-- Solo el dueño de la familia (definido en la tabla `families`) puede añadir nuevos miembros.
-- Esto evita la recursión al consultar una tabla diferente (`families`).
CREATE POLICY "Family owners can insert new members"
ON public.family_members
FOR INSERT
WITH CHECK (
  (SELECT owner_id FROM public.families WHERE id = family_id) = auth.uid()
);

-- POLÍTICA DE ACTUALIZACIÓN (UPDATE):
-- Solo el dueño de la familia puede actualizar los roles de los miembros.
CREATE POLICY "Family owners can update members"
ON public.family_members
FOR UPDATE
USING (
  (SELECT owner_id FROM public.families WHERE id = family_id) = auth.uid()
);

-- POLÍTICA DE ELIMINACIÓN (DELETE):
-- Solo el dueño de la familia puede eliminar miembros.
-- Se añade una protección para que el dueño no se pueda eliminar a sí mismo.
CREATE POLICY "Family owners can delete members"
ON public.family_members
FOR DELETE
USING (
  (SELECT owner_id FROM public.families WHERE id = family_id) = auth.uid() AND user_id != auth.uid()
);
