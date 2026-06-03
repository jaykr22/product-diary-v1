-- =============================================
-- Supabase Migration: users 테이블에 결제/구독/크레딧 필드 추가 + payments 테이블 생성
-- =============================================

-- 1. public.users 테이블에 필드 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- 2. payments 테이블 생성
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  checkout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 본인 결제 데이터만 조회 가능
DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
