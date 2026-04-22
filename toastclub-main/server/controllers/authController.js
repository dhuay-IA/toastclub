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

const ensureAdminRole = async (user) => {
  if (!user || user.role === "admin" || !isConfiguredAdminEmail(user.email)) {
    return user;
  }

  await updateUserRole({
    userId: user.id,
    role: "admin",
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
      message: "Email, name, and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "A valid email is required.",
    });
  }

  if (trimmedName.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must be at least 2 characters long.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
  }

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "A user with that email already exists.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({
    email: normalizedEmail,
    name: trimmedName,
    passwordHash,
    role: isConfiguredAdminEmail(normalizedEmail) ? "admin" : "student",
  });

  return res.status(201).json({
    success: true,
    message: "User registered successfully.",
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
      message: "Email and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "A valid email is required.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials.",
    });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials.",
    });
  }

  if (!user.is_verified) {
    return res.status(403).json({
      success: false,
      message: "User is not verified. Please complete OTP verification.",
    });
  }

  const effectiveUser = await ensureAdminRole(user);
  const token = signToken(effectiveUser);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
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
      message: "Email is required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "A valid email is required.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found. Please create an account first.",
    });
  }

  if (user.is_verified) {
    return res.status(400).json({
      success: false,
      message: "This user is already verified. Please log in instead.",
    });
  }

  if ((user.otp_send_count ?? 0) >= OTP_MAX_SENDS) {
    return res.status(429).json({
      success: false,
      message:
        "You have reached the maximum number of OTP requests for this email. Please register again with another email.",
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
    message: "OTP generated and sent successfully.",
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
      message: "Email and OTP are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "A valid email is required.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
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
    message: "OTP verified successfully.",
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
      message: "Email is required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "A valid email is required.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No user was found with that email.",
    });
  }

  if ((user.password_reset_send_count ?? 0) >= PASSWORD_RESET_MAX_SENDS) {
    return res.status(429).json({
      success: false,
      message:
        "You have reached the maximum number of password reset requests. Please try again later or contact support.",
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
    message: "Password reset code sent successfully.",
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
      message: "Email, code, and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "A valid email is required.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  if (!user.password_reset_code || !user.password_reset_expires_at) {
    return res.status(400).json({
      success: false,
      message: "No active password reset request was found for this email.",
    });
  }

  if (user.password_reset_code !== String(code).trim()) {
    return res.status(400).json({
      success: false,
      message: "Invalid reset code.",
    });
  }

  if (new Date(user.password_reset_expires_at).getTime() < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "The reset code has expired.",
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
    message: "Password updated successfully.",
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
