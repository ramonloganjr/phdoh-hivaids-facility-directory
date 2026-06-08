
-- Status enum
DO $$ BEGIN
  CREATE TYPE public.feedback_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. Table
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  region text,
  status public.feedback_status NOT NULL DEFAULT 'pending',
  ip_hash text,
  ua_hash text,
  reviewer_id uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feedback_message_len CHECK (char_length(message) BETWEEN 8 AND 1000),
  CONSTRAINT feedback_region_len CHECK (region IS NULL OR char_length(region) <= 80)
);

CREATE INDEX feedback_status_idx ON public.feedback (status, created_at DESC);
CREATE INDEX feedback_ip_hash_idx ON public.feedback (ip_hash, created_at DESC);

-- 2. Grants
GRANT SELECT ON public.feedback TO anon;        -- needed so RLS check runs; SELECT policy denies reads
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;

-- 3. RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Anyone may submit. ip_hash / ua_hash / status etc are set server-side; client cannot forge status because the server route hashes IP+UA itself before inserting and ignores client status.
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(message) BETWEEN 8 AND 1000
    AND (region IS NULL OR char_length(region) <= 80)
    AND status = 'pending'
    AND reviewer_id IS NULL
    AND reviewed_at IS NULL
  );

-- Only admins can read submissions
CREATE POLICY "Admins can read feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update (moderate)
CREATE POLICY "Admins can moderate feedback"
  ON public.feedback
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete feedback"
  ON public.feedback
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.feedback_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER feedback_set_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.feedback_touch_updated_at();
