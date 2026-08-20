
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'gpay';

CREATE TABLE IF NOT EXISTS public.sell_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ref_code text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  seller_name text NOT NULL,
  mobile text NOT NULL,
  crop_name text NOT NULL,
  variety text,
  quantity text NOT NULL,
  expected_price numeric NOT NULL DEFAULT 0,
  location text NOT NULL,
  harvest_date date,
  grade text,
  organic boolean NOT NULL DEFAULT false,
  photo_path text,
  notes text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sell_requests TO authenticated;
GRANT ALL ON public.sell_requests TO service_role;
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own sell requests read" ON public.sell_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sell requests insert" ON public.sell_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sell requests update" ON public.sell_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sell requests delete" ON public.sell_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "crop photos owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'crop-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "crop photos owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'crop-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "crop photos owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'crop-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
