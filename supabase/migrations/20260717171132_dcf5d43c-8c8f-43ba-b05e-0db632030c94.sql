
CREATE POLICY "Authenticated can read assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'assets');

CREATE POLICY "Users manage own folder in assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own folder in assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own folder in assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins manage company folder in assets"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'company' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'company' AND public.has_role(auth.uid(), 'admin'));
