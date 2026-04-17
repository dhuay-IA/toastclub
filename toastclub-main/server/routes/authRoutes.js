import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/send-otp", asyncHandler(sendOtp));
router.post("/verify-otp", asyncHandler(verifyOtp));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));

export default router;
