-- Corrige la política de seguridad para la tabla de categorías, permitiendo inserciones anónimas temporalmente.

/*
          # [UPDATE] Update RLS Policy for categories
          This operation updates the Row Level Security (RLS) policy for the 'categories' table to allow anonymous users to insert new rows. This is a temporary measure to enable functionality before a full user authentication system is implemented.

          ## Query Description: [This operation modifies the security policy on the 'categories' table. It replaces the existing policy, which required an authenticated user, with a new policy that allows any user (including anonymous ones) to add new categories. This is necessary for the 'Add Category' feature to work in the current state of the application.]
          
          ## Metadata:
          - Schema-Category: ["Security"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Table: public.categories
          - Affected Operation: INSERT
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Temporarily allows anonymous inserts]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Low. This change has a negligible impact on performance.]
          */

-- Elimina la política restrictiva existente si existe.
DROP POLICY IF EXISTS "Allow individual insert access" ON public.categories;

-- Crea una nueva política permisiva para permitir inserciones anónimas.
CREATE POLICY "Allow anonymous insert access" ON public.categories
FOR INSERT
WITH CHECK (true);
