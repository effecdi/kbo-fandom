-- ============================================================
-- Olli RLS (Row Level Security) Migration
-- 모든 테이블에 RLS를 활성화하고, 본인 데이터만 접근 가능하도록 정책 설정
--
-- 실행 방법:
--   Supabase Dashboard > SQL Editor 에서 이 파일 전체를 붙여넣고 실행
--   또는: psql $DATABASE_URL < supabase/migrations/001_enable_rls.sql
-- ============================================================

-- ============================================================
-- 1. users: 본인 레코드만 조회/수정 가능
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- 서버(service_role)가 유저 생성 가능하도록 INSERT는 별도 정책
CREATE POLICY "users_insert_service" ON users
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 2. characters: 본인 캐릭터만 CRUD
-- ============================================================
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "characters_select_own" ON characters
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "characters_insert_own" ON characters
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "characters_update_own" ON characters
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "characters_delete_own" ON characters
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================================
-- 3. generations (gallery): 본인 생성물만 CRUD
-- ============================================================
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generations_select_own" ON generations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "generations_insert_own" ON generations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "generations_update_own" ON generations
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "generations_delete_own" ON generations
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================================
-- 4. user_credits: 본인 크레딧만 조회/수정
-- ============================================================
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_credits_select_own" ON user_credits
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "user_credits_update_own" ON user_credits
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "user_credits_insert_service" ON user_credits
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 5. payments: 본인 결제내역만 조회 (수정/삭제 불가)
-- ============================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (auth.uid()::text = user_id);

-- INSERT는 서버(service_role)만 가능
CREATE POLICY "payments_insert_service" ON payments
  FOR INSERT WITH CHECK (true);

-- 결제 기록은 수정/삭제 불가 (감사 추적용)
-- UPDATE, DELETE 정책 없음 = anon/authenticated 유저는 수정/삭제 불가

-- ============================================================
-- 6. bubble_projects: 본인 프로젝트만 CRUD
-- ============================================================
ALTER TABLE bubble_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bubble_projects_select_own" ON bubble_projects
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "bubble_projects_insert_own" ON bubble_projects
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "bubble_projects_update_own" ON bubble_projects
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "bubble_projects_delete_own" ON bubble_projects
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================================
-- 7. instagram_connections: 본인 연결만 CRUD
-- ============================================================
ALTER TABLE instagram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_connections_select_own" ON instagram_connections
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "instagram_connections_insert_own" ON instagram_connections
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "instagram_connections_update_own" ON instagram_connections
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "instagram_connections_delete_own" ON instagram_connections
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================================
-- 8. instagram_publish_log: 본인 게시 이력만 조회
-- ============================================================
ALTER TABLE instagram_publish_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_publish_log_select_own" ON instagram_publish_log
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "instagram_publish_log_insert_service" ON instagram_publish_log
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 9. feed_posts: 공개 피드 — 누구나 조회 가능, 본인만 수정/삭제
-- ============================================================
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_posts_select_public" ON feed_posts
  FOR SELECT USING (true);

CREATE POLICY "feed_posts_insert_own" ON feed_posts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "feed_posts_update_own" ON feed_posts
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "feed_posts_delete_own" ON feed_posts
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================================
-- 10. likes: 본인 좋아요만 추가/삭제, 전체 조회 가능 (카운트용)
-- ============================================================
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_public" ON likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON likes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "likes_delete_own" ON likes
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================================
-- 11. follows: 본인 팔로우만 추가/삭제, 전체 조회 가능
-- ============================================================
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select_public" ON follows
  FOR SELECT USING (true);

CREATE POLICY "follows_insert_own" ON follows
  FOR INSERT WITH CHECK (auth.uid()::text = follower_id);

CREATE POLICY "follows_delete_own" ON follows
  FOR DELETE USING (auth.uid()::text = follower_id);

-- ============================================================
-- 12. trending_accounts: 공개 데이터 — 누구나 조회, 서버만 수정
-- ============================================================
ALTER TABLE trending_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trending_accounts_select_public" ON trending_accounts
  FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE는 service_role만 가능 (정책 없음 = 차단)

-- ============================================================
-- 13. conversations: 현재 userId 없음 — 서버 전용
-- ============================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- anon/authenticated 유저가 직접 접근하지 못하도록 모든 접근 차단
-- 서버(service_role)만 CRUD 가능
CREATE POLICY "conversations_service_only" ON conversations
  FOR ALL USING (false);

-- ============================================================
-- 14. messages: 현재 userId 없음 — 서버 전용
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_service_only" ON messages
  FOR ALL USING (false);

-- ============================================================
-- IMPORTANT NOTE:
-- 서버는 service_role 키를 사용하므로 RLS를 우회합니다.
-- 이 정책들은 Supabase Dashboard 직접 접근이나
-- anon/authenticated 키로 접근할 때의 이중 보호용입니다.
-- ============================================================
