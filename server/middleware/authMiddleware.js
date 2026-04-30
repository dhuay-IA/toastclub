import jwt from "jsonwebtoken";
import { findUserById } from "../models/userModel.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for this token.",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.is_verified === 1,
      createdAt: user.created_at,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export const requireAdmin = async (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access is required.",
    });
  }

  return next();
};

export const requireAgentOrAdmin = async (req, res, next) => {
  if (!["agent", "admin"].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Agent access is required.",
    });
  }

  return next();
};
