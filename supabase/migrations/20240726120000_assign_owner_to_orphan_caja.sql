/*
          # Asignar Propietario a Caja Huérfana
          Este script corrige un problema de integridad de datos asignando la caja de efectivo "general" que no tiene propietario al primer miembro registrado en la aplicación.

          ## Query Description: ["Esta operación actualiza una fila en la tabla 'cajas' para asegurar que todas las cajas tengan un propietario. Es una operación segura que no elimina datos y mejora la consistencia de la base de datos."]
          
          ## Metadata:
          - Schema-Category: "Data"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Afecta a: public.cajas
          - Columnas modificadas: member_id, name
          
          ## Security Implications:
          - RLS Status: No cambia
          - Policy Changes: No
          - Auth Requirements: Ninguno
          
          ## Performance Impact:
          - Indexes: Ninguno
          - Triggers: Ninguno
          - Estimated Impact: "Impacto insignificante. Es una actualización de una única fila."
          */

DO $$
DECLARE
    first_member_id uuid;
    first_member_name text;
    first_name text;
BEGIN
    -- Find the first member (assuming the first one created is the main one)
    SELECT id, name INTO first_member_id, first_member_name
    FROM public.members
    ORDER BY created_at
    LIMIT 1;

    -- If a member exists
    IF first_member_id IS NOT NULL THEN
        -- Extract first name
        first_name := split_part(first_member_name, ' ', 1);

        -- Update the generic 'Billetera' to belong to the first member
        UPDATE public.cajas
        SET 
            member_id = first_member_id,
            name = 'Efectivo ' || first_name
        WHERE 
            name = 'Billetera' AND member_id IS NULL;
    END IF;
END $$;
