import jwt from "jsonwebtoken";
import { findUserById } from "../models/userModel.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Se requiere un token de autorizacion.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No se encontro un usuario asociado a este token.",
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
      message: "El token es invalido o ha expirado.",
    });
  }
};

export const requireAdmin = async (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Se requiere acceso de administrador.",
    });
  }

  return next();
};
