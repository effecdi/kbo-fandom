import type { Request, Response, NextFunction } from "express";
import { supabase } from "./supabaseClient";
import { storage } from "./storage";

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
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.userId = data.user.id;
    req.supabaseUser = data.user;

    await storage.ensureUser({
      id: data.user.id,
      email: data.user.email || null,
      firstName: data.user.user_metadata?.full_name?.split(" ")[0] || data.user.user_metadata?.name?.split(" ")[0] || null,
      lastName: data.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null,
      profileImageUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
    });

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Authentication failed" });
  }
}
