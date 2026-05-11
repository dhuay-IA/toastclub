import { Router } from "express";
import {
  getAdminReport,
  getAdminUserSessions,
  rescheduleAdminSession,
  updateAdminSessionStatus,
} from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get(
  "/admin/report",
  asyncHandler(authenticateToken),
  asyncHandler(requireAdmin),
  asyncHandler(getAdminReport)
);

router.get(
  "/admin/users/:userId/sessions",
  asyncHandler(authenticateToken),
  asyncHandler(requireAdmin),
  asyncHandler(getAdminUserSessions)
);

router.post(
  "/admin/sessions/:sessionId/status",
  asyncHandler(authenticateToken),
  asyncHandler(requireAdmin),
  asyncHandler(updateAdminSessionStatus)
);

router.post(
  "/admin/sessions/:sessionId/reschedule",
  asyncHandler(authenticateToken),
  asyncHandler(requireAdmin),
  asyncHandler(rescheduleAdminSession)
);

export default router;
