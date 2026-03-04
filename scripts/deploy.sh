#!/bin/bash
# ============================================
# 배포 스크립트
#
# 사용법 (Lightsail 서버에서):
#   bash scripts/deploy.sh
#
# 로컬에서 원격 배포:
#   ssh user@your-lightsail-ip "cd /opt/olli && git pull && bash scripts/deploy.sh"
# ============================================

set -euo pipefail

PROJECT_DIR=${PROJECT_DIR:-"/opt/olli"}
cd "$PROJECT_DIR"

echo "=========================================="
echo " 배포 시작: $(date)"
echo "=========================================="

# ─── 1. 환경변수 확인 ───
if [ ! -f .env.production ]; then
    echo "❌ .env.production 파일이 없습니다!"
    echo "   .env.production 파일을 먼저 생성하세요."
    exit 1
fi

# ─── 2. 최신 코드 가져오기 ───
echo "[1/4] 최신 코드 가져오기..."
git pull origin main

# ─── 3. Docker 이미지 빌드 ───
echo "[2/4] Docker 이미지 빌드..."
docker compose build --no-cache app

# ─── 4. 컨테이너 재시작 (다운타임 최소화) ───
echo "[3/4] 컨테이너 업데이트..."
docker compose up -d --force-recreate app
docker compose up -d nginx certbot

# ─── 5. 헬스체크 ───
echo "[4/4] 헬스체크..."
sleep 5
if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ 앱 정상 동작 중"
else
    echo "⚠️  헬스체크 실패. 로그 확인:"
    docker compose logs --tail=30 app
    exit 1
fi

# ─── 오래된 이미지 정리 ───
docker image prune -f

echo ""
echo "=========================================="
echo " 배포 완료: $(date)"
echo "=========================================="
