#!/bin/bash
# ============================================
# Oracle Cloud / Lightsail / 모든 Ubuntu VPS 초기 설정
#
# 사용법: SSH 접속 후
#   bash scripts/setup-server.sh
# ============================================

set -euo pipefail

echo "=========================================="
echo " 서버 초기 설정 시작"
echo "=========================================="

# ─── 1. 시스템 업데이트 ───
echo "[1/6] 시스템 업데이트..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ─── 2. Docker 설치 ───
echo "[2/6] Docker 설치..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
    echo "Docker 설치 완료"
else
    echo "Docker 이미 설치됨: $(docker --version)"
fi

# ─── 3. Docker Compose 확인 ───
echo "[3/6] Docker Compose 확인..."
if ! docker compose version &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
fi
echo "Docker Compose: $(docker compose version)"

# ─── 4. 방화벽 설정 (iptables - Oracle Cloud용) ───
echo "[4/6] 방화벽 설정..."
# Oracle Cloud Ubuntu는 iptables 기본 사용
# ufw가 있으면 ufw 사용, 없으면 iptables 직접 설정
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    echo "UFW 방화벽 설정 완료"
else
    # Oracle Cloud iptables 규칙 추가
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
    sudo netfilter-persistent save 2>/dev/null || sudo iptables-save | sudo tee /etc/iptables/rules.v4
    echo "iptables 방화벽 설정 완료"
fi

# ─── 5. 스왑 메모리 설정 (빌드 시 메모리 부족 방지) ───
echo "[5/6] 스왑 설정..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "2GB 스왑 생성 완료"
else
    echo "스왑 이미 존재"
fi

# ─── 6. 프로젝트 디렉토리 생성 ───
echo "[6/6] 프로젝트 디렉토리 생성..."
sudo mkdir -p /opt/olli
sudo chown $USER:$USER /opt/olli

echo ""
echo "=========================================="
echo " 초기 설정 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "  1. exit  (재로그인으로 Docker 그룹 적용)"
echo "  2. git clone <repo> /opt/olli"
echo "  3. cd /opt/olli && nano .env.production"
echo "  4. docker compose up -d --build"
echo "  5. (도메인 있으면) bash scripts/init-ssl.sh <도메인> <이메일>"
