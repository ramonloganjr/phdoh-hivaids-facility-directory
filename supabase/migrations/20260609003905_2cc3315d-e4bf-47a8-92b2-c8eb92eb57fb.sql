-- Remove feedback from realtime publication. Realtime channel topics can be
-- subscribed to by any authenticated user, and feedback is admin-only data.
-- The admin Feedback queue still refreshes via React Query invalidation on
-- moderator actions.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'feedback'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.feedback';
  END IF;
END $$;