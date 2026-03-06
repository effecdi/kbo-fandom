export const config = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseKey: process.env.SUPABASE_KEY || "",
  portoneApiKey: process.env.PORTONE_API_KEY || "",
  portoneApiSecret: process.env.PORTONE_API_SECRET || "",
  metaAppId: process.env.META_APP_ID || "",
  metaAppSecret: process.env.META_APP_SECRET || "",
  metaRedirectUri: process.env.META_REDIRECT_URI || "",
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY || "",
};
