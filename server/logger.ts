/**
 * 안전한 서버 로거 — error 객체에서 메시지만 추출하여 로그.
 * 스택 트레이스, API 키, 토큰 등 민감 정보 유출 방지.
 */

function safeErrorMessage(err: unknown): string {
  if (!err) return "unknown";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) return String((err as any).message);
  return "unknown";
}

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(context: string, detail?: string) {
    console.log(`[${timestamp()}] [INFO] ${context}${detail ? ` — ${detail}` : ""}`);
  },

  warn(context: string, err?: unknown) {
    console.warn(`[${timestamp()}] [WARN] ${context}${err ? ` — ${safeErrorMessage(err)}` : ""}`);
  },

  error(context: string, err?: unknown) {
    console.error(`[${timestamp()}] [ERROR] ${context}${err ? ` — ${safeErrorMessage(err)}` : ""}`);
  },
};
