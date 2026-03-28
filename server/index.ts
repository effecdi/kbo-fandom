import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { logger } from "./logger";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const httpServer = createServer(app);

// --- Security middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false,   // Vite dev / inline scripts 허용
    crossOriginEmbedderPolicy: false,
  }),
);

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
  : undefined; // undefined = 모든 origin 허용 (dev)

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// API 전체 rate limit: 15분에 300회
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
  }),
);

// AI 생성 엔드포인트 강화 rate limit: 1분에 10회
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI 생성 요청이 너무 많습니다. 1분 후 다시 시도해주세요." },
});
app.use("/api/generate-character", aiLimiter);
app.use("/api/generate-pose", aiLimiter);
app.use("/api/generate-background", aiLimiter);
app.use("/api/remove-background", aiLimiter);
app.use("/api/story-scripts", aiLimiter);
app.use("/api/auto-webtoon", aiLimiter);

app.use(
  express.json({
    limit: "50mb",
  }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// 헬스체크는 데이터베이스 초기화 전에 먼저 등록 (연결 문제 시에도 동작)
app.get("/api/health", async (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const logStr = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${logStr.length > 500 ? logStr.substring(0, 500) + "..." : logStr}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await registerRoutes(httpServer, app);
  } catch (error: any) {
    logger.error("라우트 등록 중 오류 발생", error);
    if (!process.env.DATABASE_URL && (process.env.NODE_ENV === "development" || process.env.AUTH_BYPASS === "true")) {
      logger.warn("데이터베이스가 없어도 헬스체크는 동작합니다.");
    } else {
      throw error;
    }
  }

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    logger.error("Internal Server Error", err);

    if (res.headersSent) {
      return next(err);
    }

    // 프로덕션에서는 500 에러의 상세 메시지를 숨김
    const message =
      process.env.NODE_ENV === "production" && status >= 500
        ? "서버 내부 오류가 발생했습니다."
        : err.message || "Internal Server Error";

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // --- WebSocket for real-time emoji reactions ---
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/reactions" });

  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.type === "reaction" && data.emoji && data.gameId) {
          // Broadcast to all connected clients
          const msg = JSON.stringify({
            type: "reaction",
            emoji: data.emoji,
            gameId: data.gameId,
            ts: Date.now(),
          });
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(msg);
            }
          });
        }
      } catch { /* ignore bad messages */ }
    });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
