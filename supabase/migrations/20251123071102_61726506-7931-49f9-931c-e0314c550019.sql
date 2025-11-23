-- Rendre le bucket audio-files public
UPDATE storage.buckets
SET public = true
WHERE id = 'audio-files';

-- Policy pour permettre à tous de lire les fichiers audio
CREATE POLICY "Public can view audio files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-files');

-- Policy pour permettre aux opérateurs et admins d'uploader
CREATE POLICY "Operators and admins can upload audio"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'audio-files' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operator'::app_role))
);

-- Policy pour permettre aux opérateurs et admins de supprimer
CREATE POLICY "Operators and admins can delete audio"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'audio-files' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operator'::app_role))
);