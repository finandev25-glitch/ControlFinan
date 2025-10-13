/*
          # Fix Category RLS Policy
          Updates the Row Level Security policy for the 'categories' table to allow anonymous access, aligning it with the other tables in the application. This is a temporary measure until user authentication is implemented.

          ## Query Description: This operation modifies a security policy. It will drop the existing restrictive policy that requires an authenticated user and replace it with a permissive one that allows all operations for now. This is necessary for the 'Add Category' feature to work before a login system is in place.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Affects table: public.categories
          
          ## Security Implications:
          - RLS Status: Remains Enabled
          - Policy Changes: Yes. Drops 'Allow authenticated users to manage their data' and adds 'Allow anonymous users to manage categories'.
          - Auth Requirements: Temporarily removes the need for an authenticated user to modify categories.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible.
          */

-- Drop the restrictive policy on the categories table
drop policy if exists "Allow authenticated users to manage their data" on public.categories;

-- Create a permissive policy for anonymous access on the categories table
create policy "Allow anonymous users to manage categories" on public.categories for all using (true) with check (true);
