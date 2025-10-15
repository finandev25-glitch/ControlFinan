/*
# [Fix] Security Definer View
This migration changes the `family_members_view` to use `SECURITY INVOKER` instead of `SECURITY DEFINER`.

## Query Description:
This operation patches a critical security vulnerability. A `SECURITY DEFINER` view runs with the permissions of the user who created it, which can bypass Row Level Security (RLS) policies. By changing it to `SECURITY INVOKER`, the view will run with the permissions of the user who is querying it, correctly enforcing RLS. This change does not affect any data.

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Modifies the security property of the view `public.family_members_view`.

## Security Implications:
- RLS Status: Enforces RLS correctly.
- Policy Changes: No.
- Auth Requirements: N/A

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Negligible. This is a metadata change.
*/
ALTER VIEW public.family_members_view SET (security_invoker = true);
