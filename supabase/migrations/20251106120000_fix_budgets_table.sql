/*
  # [MIGRACIÓN CRÍTICA] Corrección de la tabla de Presupuestos (Budgets)
  Este script soluciona un error que impide guardar presupuestos.

  ## Descripción de la Consulta:
  - **ADVERTENCIA:** Esta operación **eliminará todos los presupuestos existentes** para reestructurar la tabla correctamente. Esto es necesario para que la nueva funcionalidad de presupuestos mensuales funcione.
  - Añade las columnas `month` y `year` a la tabla `budgets`.
  - Elimina la antigua restricción de unicidad (si existe).
  - Añade una nueva restricción para permitir un único presupuesto por categoría, por mes y por año.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: true
  - Reversible: false
*/

-- Step 1: Add 'month' and 'year' columns if they don't exist.
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS month INTEGER,
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Step 2: Find and drop the old unique constraint on the 'category' column.
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname
    INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.budgets'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) LIKE 'UNIQUE (category)';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.budgets DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
END $$;

-- Step 3: Clear all existing data from the budgets table to prevent conflicts.
-- ADVERTENCIA: ESTO ELIMINARÁ TODOS TUS PRESUPUESTOS ACTUALES.
TRUNCATE TABLE public.budgets RESTART IDENTITY;

-- Step 4: Add the new unique constraint.
-- First, drop if it exists from a previous failed attempt.
ALTER TABLE public.budgets
DROP CONSTRAINT IF EXISTS budgets_category_month_year_unique;

ALTER TABLE public.budgets
ADD CONSTRAINT budgets_category_month_year_unique UNIQUE (category, month, year);

-- Step 5: Ensure the new columns are not null.
ALTER TABLE public.budgets
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL;
