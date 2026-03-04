#!/bin/bash
# ============================================
# Let's Encrypt SSL 초기 발급 스크립트
#
# 사용법: bash scripts/init-ssl.sh your-domain.com your@email.com
# ============================================

set -euo pipefail

DOMAIN=${1:?"사용법: bash scripts/init-ssl.sh <도메인> <이메일>"}
EMAIL=${2:?"사용법: bash scripts/init-ssl.sh <도메인> <이메일>"}

echo "도메인: $DOMAIN"
echo "이메일: $EMAIL"
echo ""

# ─── 1. nginx.conf에서 도메인 치환 ───
echo "[1/3] Nginx 설정에 도메인 적용..."
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" nginx/default.conf

# ─── 2. 임시 자체서명 인증서 생성 (nginx 시작용) ───
echo "[2/3] 임시 인증서 생성..."
docker compose up -d app

mkdir -p ./certbot/conf/live/$DOMAIN
docker compose run --rm --entrypoint "" certbot sh -c "
    mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        -subj '/CN=localhost'
"

# ─── 3. Nginx 시작 후 실제 인증서 발급 ───
echo "[3/3] 실제 SSL 인증서 발급..."
docker compose up -d nginx

# 임시 인증서 삭제 후 실제 인증서 발급
docker compose run --rm --entrypoint "" certbot sh -c "
    rm -rf /etc/letsencrypt/live/$DOMAIN && \
    rm -rf /etc/letsencrypt/archive/$DOMAIN && \
    rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf
"

docker compose run --rm certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal

# Nginx 재시작으로 실제 인증서 적용
docker compose restart nginx

echo ""
echo "=========================================="
echo " SSL 인증서 발급 완료!"
echo "=========================================="
echo "https://$DOMAIN 으로 접속 가능합니다."
