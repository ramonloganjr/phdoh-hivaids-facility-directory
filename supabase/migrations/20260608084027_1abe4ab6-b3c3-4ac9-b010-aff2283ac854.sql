
-- Anonymous event log. No user_id, no IP, no UA. RLS deny-all; only service_role accesses it via server functions.
CREATE TABLE public.metric_events (
  id BIGSERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  dimension_key TEXT,
  dimension_value TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX metric_events_event_day_idx ON public.metric_events (event, occurred_at DESC);
CREATE INDEX metric_events_occurred_idx ON public.metric_events (occurred_at);

GRANT ALL ON public.metric_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.metric_events_id_seq TO service_role;
ALTER TABLE public.metric_events ENABLE ROW LEVEL SECURITY;
-- No policies = no anon/authenticated access. Only service_role (bypasses RLS) can read/write.

-- Curated testimonials. Public reads go through a server fn that projects only safe columns.
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  attribution TEXT NOT NULL,
  region TEXT,
  consent_verified_at TIMESTAMPTZ,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX testimonials_published_idx ON public.testimonials (published, sort_order);

GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
-- All access goes through server functions; no client policies needed.

-- A story may only be published once consent has been verified.
CREATE OR REPLACE FUNCTION public.testimonials_require_consent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND NEW.consent_verified_at IS NULL THEN
    RAISE EXCEPTION 'A story cannot be published without a recorded consent_verified_at timestamp.';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER testimonials_consent_check
BEFORE INSERT OR UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.testimonials_require_consent();
