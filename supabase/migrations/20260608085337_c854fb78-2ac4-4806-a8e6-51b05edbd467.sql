
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

CREATE POLICY "Deny all client access to metric_events"
  ON public.metric_events FOR ALL
  TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny all client access to testimonials"
  ON public.testimonials FOR ALL
  TO anon, authenticated
  USING (false) WITH CHECK (false);
