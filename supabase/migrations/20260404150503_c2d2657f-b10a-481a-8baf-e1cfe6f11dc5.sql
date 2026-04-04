DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;

CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND verified IS NOT DISTINCT FROM (SELECT l.verified FROM public.listings l WHERE l.id = listings.id)
  );