-- Create storage buckets for avatars (public) and psychologist-documents (private)

-- 1. Bucket avatars (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Bucket psychologist-documents (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('psychologist-documents', 'psychologist-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policies for storage.objects

-- Allow public read access to avatars bucket
CREATE POLICY "public_read_avatars" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload to avatars bucket
CREATE POLICY "authenticated_upload_avatars" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow object owner to read their psychologist-documents
CREATE POLICY "owner_read_documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'psychologist-documents' AND owner_id = auth.uid());

-- Allow admins to read any psychologist-document
CREATE POLICY "admin_read_documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'psychologist-documents' AND auth.uid() IN (SELECT user_id FROM admin_roles));

-- Allow authenticated users to insert into psychologist-documents bucket (own objects)
CREATE POLICY "owner_insert_documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'psychologist-documents' AND owner_id = auth.uid());
