DROP POLICY IF EXISTS "Public can read metric events" ON public.metric_events;
REVOKE SELECT ON public.metric_events FROM anon, authenticated;