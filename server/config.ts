// 프로덕션 필수 환경변수 — 하나라도 빠지면 서버가 시작되지 않음
const REQUIRED_IN_PRODUCTION = [
  "SUPABASE_URL",
  "SUPABASE_KEY",
  "DATABASE_URL",
  "PORTONE_API_KEY",
  "PORTONE_API_SECRET",
  "TOKEN_ENCRYPTION_KEY",
  "SUPABASE_JWT_SECRET",
] as const;

if (process.env.NODE_ENV === "production" && process.env.AUTH_BYPASS !== "true") {
  const missing = REQUIRED_IN_PRODUCTION.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `[SECURITY] 프로덕션 필수 환경변수가 설정되지 않았습니다: ${missing.join(", ")}`,
    );
  }
}

export const config = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseKey: process.env.SUPABASE_KEY || "",
  portoneApiKey: process.env.PORTONE_API_KEY || "",
  portoneApiSecret: process.env.PORTONE_API_SECRET || "",
  // PortOne V2
  portoneV2ApiSecret: process.env.PORTONE_V2_API_SECRET || "",
  portoneV2StoreId: process.env.PORTONE_V2_STORE_ID || "",
  portoneV2ChannelKeyInicis: process.env.PORTONE_V2_CHANNEL_KEY_INICIS || "",
  portoneV2ChannelKeyToss: process.env.PORTONE_V2_CHANNEL_KEY_TOSS || "",
  metaAppId: process.env.META_APP_ID || "",
  metaAppSecret: process.env.META_APP_SECRET || "",
  metaRedirectUri: process.env.META_REDIRECT_URI || "",
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY || "",
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || "",
};
