-- Prevent non-admin users from inserting into user_roles
-- The existing ALL policy only allows admins; add an explicit restrictive INSERT policy
CREATE POLICY "Non-admins cannot insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
