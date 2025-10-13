-- Corrige la restricción de validación en la tabla de categorías para asegurar que solo acepta 'Ingreso' o 'Gasto'.
-- Esto soluciona el error "violates check constraint" al añadir nuevas categorías.

-- 1. Elimina la restricción de validación existente, si es que existe.
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_type_check;

-- 2. Vuelve a crear la restricción con los valores correctos en español.
ALTER TABLE public.categories ADD CONSTRAINT categories_type_check CHECK (type IN ('Ingreso', 'Gasto'));
