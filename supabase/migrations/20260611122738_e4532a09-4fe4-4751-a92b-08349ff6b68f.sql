GRANT SELECT ON public.metric_events TO authenticated;
GRANT INSERT ON public.metric_events TO anon, authenticated;
GRANT ALL ON public.metric_events TO service_role;