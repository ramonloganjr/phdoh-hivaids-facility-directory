DROP FUNCTION IF EXISTS public.admin_delete_testimonial(uuid);
DROP FUNCTION IF EXISTS public.admin_update_testimonial(uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_create_testimonial(text, text, text, timestamptz, boolean, integer);
DROP FUNCTION IF EXISTS public.admin_list_testimonials();
DROP FUNCTION IF EXISTS public.admin_metric_events(timestamptz);
DROP FUNCTION IF EXISTS public.admin_has_access();

GRANT SELECT ON public.metric_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

DROP POLICY IF EXISTS "Deny all client access to metric_events" ON public.metric_events;
DROP POLICY IF EXISTS "Deny all client access to testimonials" ON public.testimonials;

CREATE POLICY "Admins can read metric events"
  ON public.metric_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::public.app_role
    )
  );

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::public.app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::public.app_role
    )
  );