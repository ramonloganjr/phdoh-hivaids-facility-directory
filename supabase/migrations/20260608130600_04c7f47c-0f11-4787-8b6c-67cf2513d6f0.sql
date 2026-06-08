
-- Allow anon + authenticated to read published, consented testimonials
GRANT SELECT ON public.testimonials TO anon;

CREATE POLICY "Public can read published testimonials"
  ON public.testimonials
  FOR SELECT
  TO anon, authenticated
  USING (published = true AND consent_verified_at IS NOT NULL);

-- Allow public read of metric_events (no PII; only event names + aggregate dimensions)
GRANT SELECT ON public.metric_events TO anon;

CREATE POLICY "Public can read metric events"
  ON public.metric_events
  FOR SELECT
  TO anon, authenticated
  USING (true);
