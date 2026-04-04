-- 1. Fix profiles: restrict SELECT to own row, create public view for cross-user lookups
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Users can only read their own full profile (including email)
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a public view excluding email for cross-user lookups (e.g. Inbox)
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
  SELECT user_id, display_name, avatar_url
  FROM public.profiles;

-- Allow all authenticated users to read the public view
-- (security_invoker means RLS on profiles is checked, so we need a policy for it)
-- We need to allow reading other profiles through the view, so add a SELECT policy for the view's underlying table
-- Actually with security_invoker, the view runs as the calling user, so we need a broader SELECT.
-- Instead, let's use a security_definer function approach:
DROP VIEW IF EXISTS public.profiles_public;

-- Create a security definer function to get public profile info
CREATE OR REPLACE FUNCTION public.get_public_profiles(user_ids uuid[])
RETURNS TABLE(user_id uuid, display_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids);
$$;

-- Revoke anon access, only authenticated can call it
REVOKE EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated;

-- 2. Clean up user_roles: remove redundant INSERT policy
DROP POLICY IF EXISTS "Non-admins cannot insert roles" ON public.user_roles;