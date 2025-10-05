import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { supabase } from "../lib/supabaseClient.js"; // Ensure this file exports a configured Supabase client

dotenv.config();

// ===============================
// 🔐 REQUIRE AUTH (session-based)
// ===============================
export const requireAuth = async (req, res, next) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.session.user.id)
      .single();

    if (error || !user) {
      req.session.destroy();
      return res
        .status(401)
        .json({ error: "User not found or session invalid" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Authentication error" });
  }
};

// ===================================
// 🟢 OPTIONAL AUTH (non-mandatory)
// ===================================
export const optionalAuth = async (req, res, next) => {
  try {
    if (req.session?.user) {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", req.session.user.id)
        .single();

      if (user && !error) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    console.error("Optional auth error:", err);
    next();
  }
};

// ===================================
// 🚫 REQUIRE GUEST (no active session)
// ===================================
export const requireGuest = (req, res, next) => {
  if (req.session?.user) {
    return res.status(403).json({ error: "Already authenticated" });
  }
  next();
};

// ===================================
// 💾 REMEMBER ME HANDLER
// ===================================
export const checkRememberMe = async (req, res, next) => {
  try {
    // Skip if already authenticated
    if (req.user || (req.session && req.session.userId)) {
      return next();
    }

    const { remember_token: rememberToken, remember_user: rememberUser } =
      req.cookies || {};

    if (rememberToken && rememberUser) {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", rememberUser)
        .eq("remember_token", rememberToken)
        .single();

      if (user && !error) {
        // Set new session
        req.session.userId = user.id;
        req.session.role = user.role;
        req.user = user;

        // Generate new token for security
        const newToken = crypto.randomBytes(32).toString("hex");
        await supabase
          .from("users")
          .update({ remember_token: newToken })
          .eq("id", user.id);

        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        res.cookie("remember_token", newToken, {
          maxAge: thirtyDays,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      } else {
        // Clear invalid cookies
        res.clearCookie("remember_token");
        res.clearCookie("remember_user");
      }
    }
    next();
  } catch (err) {
    console.error("Remember me error:", err);
    res.clearCookie("remember_token");
    res.clearCookie("remember_user");
    next();
  }
};

// ===================================
// 🔍 LOAD USER FROM JWT OR SESSION
// ===================================
export const loadUser = async (req, res, next) => {
  try {
    if (req.user) return next();

    // 1️⃣ Try JWT
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (data?.user && !error) {
          req.user = data.user;
          req.session.userId = data.user.id;
          req.session.role = data.user.role || "user";
          return next();
        }
      } catch (err) {
        console.error("JWT verification error:", err);
      }
    }

    // 2️⃣ Try session
    if (req.session?.userId) {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", req.session.userId)
        .single();

      if (user && !error) {
        req.user = user;
      } else {
        req.session.destroy();
      }
    }

    next();
  } catch (err) {
    console.error("Error loading user:", err);
    next(err);
  }
};

// ===================================
// 🧭 ROLE AUTHORIZATION
// ===================================
export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    if (!roles.includes(user.role)) {
      return res
        .status(403)
        .json({ success: false, error: "Insufficient permissions" });
    }

    req.user.role = user.role;
    next();
  };
};

// ===================================
// 🔒 AUTHENTICATE JWT
// ===================================
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res
      .status(401)
      .json({ message: "Authorization header is required" });

  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = user;
      next();
    }
  );
};

// ===================================
// 🧑‍💼 ADMIN CHECK
// ===================================
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied: Admin privileges required" });
  }
  next();
};
