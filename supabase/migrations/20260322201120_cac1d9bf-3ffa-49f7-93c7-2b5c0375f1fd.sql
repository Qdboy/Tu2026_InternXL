-- Tighten INSERT policy to only allow service role (not anon/authenticated)
DROP POLICY "Service role can insert feed items" ON public.feed_items;
CREATE POLICY "Service role can insert feed items"
  ON public.feed_items FOR INSERT
  TO service_role
  WITH CHECK (true);