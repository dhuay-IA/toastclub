import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  clearPasswordResetState,
  createUser,
  findUserByEmail,
  findUserById,
  markUserAsVerified,
  storePasswordResetCode,
  storeUserOtp,
  updateUserRole,
  updateUserPassword,
  verifyUserOtp,
} from "../models/userModel.js";
import {
  emailConfigStatus,
  sendOtpEmail,
  sendPasswordResetEmail,
  shouldExposeEmailCodes,
} from "../services/emailService.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_SENDS = 4;
const PASSWORD_RESET_EXPIRY_MINUTES = 10;
const PASSWORD_RESET_MAX_SENDS = 3;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const getConfiguredAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
const isConfiguredAdminEmail = (email) =>
  getConfiguredAdminEmails().includes(email.trim().toLowerCase());
const getConfiguredAgentEmails = () =>
  (process.env.AGENT_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
const isConfiguredAgentEmail = (email) =>
  getConfiguredAgentEmails().includes(email.trim().toLowerCase());

const resolveConfiguredRole = (email) => {
  if (isConfiguredAdminEmail(email)) return "admin";
  if (isConfiguredAgentEmail(email)) return "agent";
  return "student";
};

const ensureConfiguredRole = async (user) => {
  if (!user) {
    return user;
  }

  const configuredRole = resolveConfiguredRole(user.email);
  if (
    user.role === configuredRole ||
    (configuredRole === "student" && user.role !== "student") ||
    (configuredRole === "agent" && user.role === "admin")
  ) {
    return user;
  }

  await updateUserRole({
    userId: user.id,
    role: configuredRole,
  });

  return findUserById(user.id);
};

const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );

export const register = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      message: "El correo, el nombre y la contraseña son obligatorios.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Se requiere un correo válido.",
    });
  }

  if (trimmedName.length < 2) {
    return res.status(400).json({
      success: false,
      message: "El nombre debe tener al menos 2 caracteres.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener al menos 8 caracteres.",
    });
  }

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Ya existe una cuenta con ese correo.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({
    email: normalizedEmail,
    name: trimmedName,
    passwordHash,
    role: resolveConfiguredRole(normalizedEmail),
  });

  return res.status(201).json({
    success: true,
    message: "Cuenta creada correctamente.",
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.is_verified === 1,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "El correo y la contraseña son obligatorios.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Se requiere un correo válido.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Credenciales inválidas.",
    });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Credenciales inválidas.",
    });
  }

  if (!user.is_verified) {
    return res.status(403).json({
      success: false,
      message: "La cuenta aún no está verificada. Completa la verificación por OTP.",
    });
  }

  const effectiveUser = await ensureConfiguredRole(user);
  const token = signToken(effectiveUser);

  return res.status(200).json({
    success: true,
    message: "Inicio de sesión correcto.",
    data: {
      token,
      user: {
        id: effectiveUser.id,
        email: effectiveUser.email,
        name: effectiveUser.name,
        role: effectiveUser.role,
        isVerified: effectiveUser.is_verified === 1,
      },
    },
  });
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "El correo es obligatorio.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Se requiere un correo válido.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No se encontró el usuario. Primero crea una cuenta.",
    });
  }

  if (user.is_verified) {
    return res.status(400).json({
      success: false,
      message: "Esta cuenta ya está verificada. Inicia sesión.",
    });
  }

  if ((user.otp_send_count ?? 0) >= OTP_MAX_SENDS) {
    return res.status(429).json({
      success: false,
      message:
        "Alcanzaste el máximo de solicitudes OTP para este correo. Registra otra cuenta con un correo distinto.",
    });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await storeUserOtp({
    userId: user.id,
    otp,
    expiresAt,
  });

  await sendOtpEmail({
    to: user.email,
    name: user.name,
    otp,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  });

  return res.status(200).json({
    success: true,
    message: "El código OTP se generó y envió correctamente.",
    data: {
      email: user.email,
      expiresAt: expiresAt.toISOString(),
      resendLimit: OTP_MAX_SENDS - 1,
      resendAttemptsUsed: user.otp_send_count ?? 0,
      resendAttemptsRemaining: Math.max(
        OTP_MAX_SENDS - ((user.otp_send_count ?? 0) + 1),
        0
      ),
      emailDeliveryConfigured: emailConfigStatus().configured,
      ...(shouldExposeEmailCodes() ? { otp } : {}),
    },
  });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "El correo y el código OTP son obligatorios.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Se requiere un correo válido.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No se encontró el usuario.",
    });
  }

  const verificationResult = await verifyUserOtp({
    userId: user.id,
    otp: otp.trim(),
  });

  if (!verificationResult.success) {
    return res.status(400).json({
      success: false,
      message: verificationResult.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: "El código OTP fue verificado correctamente.",
    data: {
      email: user.email,
      isVerified: true,
    },
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "El correo es obligatorio.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Se requiere un correo válido.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No se encontró ninguna cuenta con ese correo.",
    });
  }

  if ((user.password_reset_send_count ?? 0) >= PASSWORD_RESET_MAX_SENDS) {
    return res.status(429).json({
      success: false,
      message:
        "Alcanzaste el máximo de solicitudes para restablecer la contraseña. Inténtalo más tarde o contacta a soporte.",
    });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000
  );

  await storePasswordResetCode({
    userId: user.id,
    code,
    expiresAt,
  });

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    code,
    expiresInMinutes: PASSWORD_RESET_EXPIRY_MINUTES,
  });

  return res.status(200).json({
    success: true,
    message: "El código para restablecer la contraseña se envió correctamente.",
    data: {
      email: user.email,
      expiresAt: expiresAt.toISOString(),
      attemptsRemaining: Math.max(
        PASSWORD_RESET_MAX_SENDS - ((user.password_reset_send_count ?? 0) + 1),
        0
      ),
      ...(shouldExposeEmailCodes() ? { code } : {}),
    },
  });
};

export const resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  if (!email || !code || !password) {
    return res.status(400).json({
      success: false,
      message: "El correo, el código y la contraseña son obligatorios.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Se requiere un correo válido.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener al menos 8 caracteres.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No se encontró el usuario.",
    });
  }

  if (!user.password_reset_code || !user.password_reset_expires_at) {
    return res.status(400).json({
      success: false,
      message: "No hay una solicitud activa de restablecimiento para este correo.",
    });
  }

  if (user.password_reset_code !== String(code).trim()) {
    return res.status(400).json({
      success: false,
      message: "El código de restablecimiento no es válido.",
    });
  }

  if (new Date(user.password_reset_expires_at).getTime() < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "El código de restablecimiento ya venció.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await updateUserPassword({
    userId: user.id,
    passwordHash,
  });

  if (!user.is_verified) {
    await markUserAsVerified({ userId: user.id });
  }

  await clearPasswordResetState({ userId: user.id });

  const updatedUser = await findUserById(user.id);
  const token = signToken(updatedUser);

  return res.status(200).json({
    success: true,
    message: "La contraseña se actualizó correctamente.",
    data: {
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isVerified: updatedUser.is_verified === 1,
      },
    },
  });
};
