-- =============================================
-- Supabase Migration: thumbnails 테이블 + image_path 스토리지 버킷 생성
-- =============================================

-- 1. thumbnails 테이블 생성
CREATE TABLE IF NOT EXISTS public.thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_path TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS 활성화
ALTER TABLE public.thumbnails ENABLE ROW LEVEL SECURITY;

-- 3. thumbnails 테이블 RLS 정책 정의
CREATE POLICY "Users can read own thumbnails"
  ON public.thumbnails FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own thumbnails"
  ON public.thumbnails FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thumbnails"
  ON public.thumbnails FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thumbnails"
  ON public.thumbnails FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. image_path 스토리지 버킷 생성 (public = true)
INSERT INTO storage.buckets (id, name, public)
VALUES ('image_path', 'image_path', true)
ON CONFLICT (id) DO NOTHING;

-- 5. 스토리지 RLS 정책 정의 (image_path 버킷 대상)
-- 5-1. 누구나 조회 가능 (public bucket)
CREATE POLICY "Allow public read access to image_path"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'image_path');

-- 5-2. 로그인한 사용자만 업로드(INSERT) 가능
CREATE POLICY "Allow authenticated users to upload to image_path"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'image_path');

-- 5-3. 소유자만 수정(UPDATE) 가능
CREATE POLICY "Allow owner to update objects in image_path"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'image_path' AND auth.uid() = owner);

-- 5-4. 소유자만 삭제(DELETE) 가능
CREATE POLICY "Allow owner to delete objects in image_path"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'image_path' AND auth.uid() = owner);
