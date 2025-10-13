/*
# [DATA-CLEANUP] Limpieza y Corrección de la Tabla de Categorías
Este script soluciona un problema de integridad de datos en la tabla `categories`.

## Query Description:
1.  **Elimina Datos Inválidos:** Busca y elimina cualquier categoría cuyo tipo no sea 'Ingreso' o 'Gasto'. Esto es necesario para corregir datos corruptos que impiden aplicar las reglas de validación.
2.  **Recrea la Regla de Validación:** Elimina la regla de validación (`check constraint`) existente y la vuelve a crear correctamente para asegurar que solo se puedan registrar los tipos 'Ingreso' y 'Gasto' en el futuro.

Esta operación es segura si la aplicación solo maneja los tipos 'Ingreso' y 'Gasto', pero eliminará cualquier dato que no cumpla esta condición.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Afecta a: public.categories
- Operaciones: DELETE, ALTER TABLE

## Security Implications:
- RLS Status: Sin cambios
- Policy Changes: No
- Auth Requirements: N/A

## Performance Impact:
- Indexes: Sin cambios
- Triggers: Sin cambios
- Estimated Impact: Bajo, la tabla de categorías suele ser pequeña.
*/

-- Paso 1: Eliminar filas con un tipo inválido.
-- Esto es crucial para que el siguiente paso funcione.
DELETE FROM public.categories
WHERE type NOT IN ('Ingreso', 'Gasto');

-- Paso 2: Eliminar la restricción existente (si existe) para evitar conflictos.
-- El `IF EXISTS` previene errores si la restricción ya fue eliminada o nunca se creó correctamente.
ALTER TABLE public.categories
DROP CONSTRAINT IF EXISTS categories_type_check;

-- Paso 3: Añadir la restricción correcta.
-- Esto asegura que todas las futuras inserciones y actualizaciones cumplan la regla.
ALTER TABLE public.categories
ADD CONSTRAINT categories_type_check CHECK (type IN ('Ingreso', 'Gasto'));
