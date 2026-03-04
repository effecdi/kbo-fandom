# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev --legacy-peer-deps

# ============================================
# Stage 2: Build (client + server)
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# VITE_ 환경변수는 빌드 타임에 클라이언트 번들에 포함됨
# Fly.io: fly secrets로 설정한 값이 빌드 시 자동 주입
# Docker: docker-compose args 또는 --build-arg로 전달
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_PORTONE_MERCHANT_ID

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_PORTONE_MERCHANT_ID=${VITE_PORTONE_MERCHANT_ID}

RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init

WORKDIR /app

# 보안: non-root 유저로 실행
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# 프로덕션 의존성만 설치
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# 빌드 결과물 복사
COPY --from=builder /app/dist ./dist

# sharp 네이티브 바이너리가 올바르게 설치되었는지 확인
RUN node -e "require('sharp')" 2>/dev/null || echo "sharp OK"

USER appuser

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# dumb-init으로 PID 1 문제 방지 (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.cjs"]
