CREATE POLICY "own capture files read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'captures' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own capture files insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'captures' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own capture files delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'captures' AND auth.uid()::text = (storage.foldername(name))[1]);