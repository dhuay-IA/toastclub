import { Router } from "express";
import { getProfile } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/profile", asyncHandler(authenticateToken), asyncHandler(getProfile));

export default router;
