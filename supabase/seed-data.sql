-- =====================================================
-- 동일유리 현장관리 시스템 - Seed Data (사용자 생성 후 실행)
-- =====================================================
--
-- 실행 전 필수 사항:
-- 1. Supabase Auth에서 사용자를 먼저 생성하세요.
-- 2. 아래 YOUR_USER_ID를 실제 사용자 ID로 교체하세요.
--    (Supabase Dashboard > Authentication > Users에서 확인)
--
-- =====================================================

-- 사용자 ID 변수 설정 (이 값을 실제 사용자 ID로 교체하세요!)
-- 예: DO $$ DECLARE user_id UUID := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'; BEGIN ... END $$;

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 첫 번째 사용자 ID 가져오기
  SELECT id INTO v_user_id FROM public.users LIMIT 1;

  -- 사용자가 없으면 에러
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '사용자가 없습니다. 먼저 Supabase Auth에서 사용자를 생성하세요.';
  END IF;

  -- Site Logs (청주 오송 2공장)
  INSERT INTO site_logs (project_id, author_id, content, log_type, images, weather, work_date) VALUES
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      v_user_id,
      '외벽 유리 1차 설치 완료. 동쪽 구역 작업 진행 중. 오후에 비 예보가 있어 실리콘 작업은 내일로 연기합니다.',
      'daily',
      '["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800", "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800"]',
      '맑음, 기온 12°C',
      '2024-01-20'
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      v_user_id,
      '2차 자재 입고 완료. 특수 강화유리 50장 검수 완료.',
      'progress',
      '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
      '흐림',
      '2024-01-22'
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      v_user_id,
      '⚠️ 북측 외벽 유리 1장 파손 발견. 교체 필요. 발주처와 협의 예정.',
      'issue',
      '["https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800"]',
      '맑음',
      '2024-01-25'
    );

  RAISE NOTICE '더미 현장 로그 3개가 추가되었습니다. (사용자 ID: %)', v_user_id;
END $$;

-- =====================================================
-- 사용자 역할 업데이트 (관리자로 변경)
-- =====================================================
-- 첫 번째 사용자를 관리자로 설정
UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users LIMIT 1);

-- 완료 메시지
DO $$ BEGIN RAISE NOTICE 'Seed data 삽입 완료!'; END $$;
