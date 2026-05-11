import { Router } from "express";
import {
  getAgentSessionByCode,
  listAgentSessions,
  listAgentStudents,
} from "../controllers/agentController.js";
import {
  rescheduleAdminSession,
  updateAdminSessionStatus,
} from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticateToken, requireAgentOrAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get(
  "/agent/students",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(listAgentStudents)
);

router.get(
  "/agent/sessions",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(listAgentSessions)
);

router.get(
  "/agent/session-code/:sessionCode",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(getAgentSessionByCode)
);

router.post(
  "/agent/sessions/:sessionId/status",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(updateAdminSessionStatus)
);

router.post(
  "/agent/sessions/:sessionId/reschedule",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(rescheduleAdminSession)
);

export default router;
