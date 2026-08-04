CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  title text NOT NULL DEFAULT '',
  detail text NOT NULL DEFAULT '',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activity" ON public.activity_log FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX activity_log_user_created_idx ON public.activity_log (user_id, created_at DESC);

CREATE TABLE public.captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text NOT NULL,
  latitude double precision,
  longitude double precision,
  prediction text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.captures TO authenticated;
GRANT ALL ON public.captures TO service_role;
ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own captures" ON public.captures FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX captures_user_created_idx ON public.captures (user_id, created_at DESC);