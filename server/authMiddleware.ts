import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "./supabaseClient";
import { config } from "./config";
import { storage } from "./storage";
import { logger } from "./logger";

export interface AuthRequest extends Request {
  userId?: string;
  supabaseUser?: any;
}

const DEV_USER_ID = "dev-bypass-user-0001";
const DEV_USER = {
  id: DEV_USER_ID,
  email: "dev@olli.local",
  user_metadata: {
    full_name: "Dev User",
    avatar_url: "",
  },
};

const isAuthBypassed = process.env.AUTH_BYPASS === "true";

interface SupabaseJwtPayload {
  sub: string;
  iss: string;
  exp: number;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

async function verifyLocal(token: string): Promise<{ userId: string; payload: SupabaseJwtPayload }> {
  const decoded = jwt.verify(token, config.supabaseJwtSecret, {
    algorithms: ["HS256", "HS384", "HS512"],
  }) as SupabaseJwtPayload;

  if (!decoded.sub) {
    throw new Error("JWT missing sub claim");
  }

  return { userId: decoded.sub, payload: decoded };
}

async function verifyRemote(token: string): Promise<{ userId: string; payload: SupabaseJwtPayload }> {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("Invalid token");
  }
  return {
    userId: data.user.id,
    payload: {
      sub: data.user.id,
      iss: "",
      exp: 0,
      email: data.user.email || undefined,
      user_metadata: data.user.user_metadata as SupabaseJwtPayload["user_metadata"],
    },
  };
}

export async function isAuthenticated(req: AuthRequest, res: Response, next: NextFunction) {
  // Dev bypass mode — skip all auth, use fixed dev user
  if (isAuthBypassed) {
    req.userId = DEV_USER_ID;
    req.supabaseUser = DEV_USER;
    await storage.ensureUser({
      id: DEV_USER_ID,
      email: DEV_USER.email,
      firstName: "Dev",
      lastName: "User",
      profileImageUrl: null,
    });
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "인증이 필요합니다." });
  }

  const token = authHeader.split(" ")[1];
  try {
    let result: { userId: string; payload: SupabaseJwtPayload };

    if (config.supabaseJwtSecret) {
      try {
        result = await verifyLocal(token);
      } catch (localErr) {
        logger.warn("Local JWT verify failed, falling back to remote", localErr);
        result = await verifyRemote(token);
      }
    } else {
      result = await verifyRemote(token);
    }

    const { userId, payload } = result;
    req.userId = userId;
    req.supabaseUser = payload;

    const meta = payload.user_metadata;
    await storage.ensureUser({
      id: userId,
      email: payload.email || null,
      firstName: meta?.full_name?.split(" ")[0] || meta?.name?.split(" ")[0] || null,
      lastName: meta?.full_name?.split(" ").slice(1).join(" ") || null,
      profileImageUrl: meta?.avatar_url || meta?.picture || null,
    });

    next();
  } catch (err) {
    logger.error("Auth middleware error", err);
    return res.status(401).json({ message: "인증이 만료되었습니다. 다시 로그인해주세요." });
  }
}
