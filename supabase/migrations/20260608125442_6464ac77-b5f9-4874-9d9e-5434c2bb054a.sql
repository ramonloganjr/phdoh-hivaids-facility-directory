CREATE OR REPLACE FUNCTION public.admin_has_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.has_role(auth.uid(), 'admin'::public.app_role), false)
$$;

REVOKE ALL ON FUNCTION public.admin_has_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_has_access() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_metric_events(_since timestamptz)
RETURNS TABLE (
  event text,
  dimension_key text,
  dimension_value text,
  occurred_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin access required.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT m.event, m.dimension_key, m.dimension_value, m.occurred_at
  FROM public.metric_events AS m
  WHERE m.occurred_at >= _since
  ORDER BY m.occurred_at DESC
  LIMIT 500000;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_metric_events(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_metric_events(timestamptz) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_list_testimonials()
RETURNS SETOF public.testimonials
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin access required.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.testimonials
  ORDER BY sort_order ASC, created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_testimonials() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_testimonials() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_create_testimonial(
  _quote text,
  _attribution text,
  _region text DEFAULT NULL,
  _consent_verified_at timestamptz DEFAULT NULL,
  _published boolean DEFAULT false,
  _sort_order integer DEFAULT 0
)
RETURNS public.testimonials
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.testimonials;
  clean_quote text := btrim(_quote);
  clean_attribution text := btrim(_attribution);
  clean_region text := NULLIF(btrim(COALESCE(_region, '')), '');
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin access required.' USING ERRCODE = '42501';
  END IF;

  IF char_length(clean_quote) < 8 OR char_length(clean_quote) > 600 THEN
    RAISE EXCEPTION 'Story quote must be between 8 and 600 characters.' USING ERRCODE = '22023';
  END IF;

  IF char_length(clean_attribution) < 2 OR char_length(clean_attribution) > 120 THEN
    RAISE EXCEPTION 'Story attribution must be between 2 and 120 characters.' USING ERRCODE = '22023';
  END IF;

  IF clean_region IS NOT NULL AND char_length(clean_region) > 80 THEN
    RAISE EXCEPTION 'Story region must be 80 characters or fewer.' USING ERRCODE = '22023';
  END IF;

  IF _sort_order < 0 OR _sort_order > 9999 THEN
    RAISE EXCEPTION 'Story sort order must be between 0 and 9999.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.testimonials (
    quote,
    attribution,
    region,
    consent_verified_at,
    published,
    sort_order
  )
  VALUES (
    clean_quote,
    clean_attribution,
    clean_region,
    _consent_verified_at,
    COALESCE(_published, false),
    COALESCE(_sort_order, 0)
  )
  RETURNING * INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_testimonial(text, text, text, timestamptz, boolean, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_testimonial(text, text, text, timestamptz, boolean, integer) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_update_testimonial(_id uuid, _patch jsonb)
RETURNS public.testimonials
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.testimonials;
  next_quote text;
  next_attribution text;
  next_region text;
  next_sort_order integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin access required.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO result FROM public.testimonials WHERE id = _id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Story not found.' USING ERRCODE = '02000';
  END IF;

  next_quote := CASE WHEN _patch ? 'quote' THEN btrim(_patch->>'quote') ELSE result.quote END;
  next_attribution := CASE WHEN _patch ? 'attribution' THEN btrim(_patch->>'attribution') ELSE result.attribution END;
  next_region := CASE WHEN _patch ? 'region' THEN NULLIF(btrim(COALESCE(_patch->>'region', '')), '') ELSE result.region END;
  next_sort_order := CASE WHEN _patch ? 'sort_order' THEN (_patch->>'sort_order')::integer ELSE result.sort_order END;

  IF char_length(next_quote) < 8 OR char_length(next_quote) > 600 THEN
    RAISE EXCEPTION 'Story quote must be between 8 and 600 characters.' USING ERRCODE = '22023';
  END IF;

  IF char_length(next_attribution) < 2 OR char_length(next_attribution) > 120 THEN
    RAISE EXCEPTION 'Story attribution must be between 2 and 120 characters.' USING ERRCODE = '22023';
  END IF;

  IF next_region IS NOT NULL AND char_length(next_region) > 80 THEN
    RAISE EXCEPTION 'Story region must be 80 characters or fewer.' USING ERRCODE = '22023';
  END IF;

  IF next_sort_order < 0 OR next_sort_order > 9999 THEN
    RAISE EXCEPTION 'Story sort order must be between 0 and 9999.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.testimonials
  SET
    quote = next_quote,
    attribution = next_attribution,
    region = next_region,
    consent_verified_at = CASE
      WHEN _patch ? 'consent_verified_at' THEN NULLIF(_patch->>'consent_verified_at', '')::timestamptz
      ELSE consent_verified_at
    END,
    published = CASE
      WHEN _patch ? 'published' THEN (_patch->>'published')::boolean
      ELSE published
    END,
    sort_order = next_sort_order
  WHERE id = _id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_testimonial(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_testimonial(uuid, jsonb) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_delete_testimonial(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin access required.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.testimonials WHERE id = _id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_testimonial(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_testimonial(uuid) TO authenticated, service_role;