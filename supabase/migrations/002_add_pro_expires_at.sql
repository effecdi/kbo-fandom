-- Pro 구독 만료일 컬럼 추가
-- 해지 요청 시 결제 주기 만료일까지 Pro 유지 후 자동 전환
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP;
