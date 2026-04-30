import { Router } from "express";
import {
  createAgentGroupSession,
  getAgentSessionByCode,
  getAgentSessions,
  listAgentUsers,
} from "../controllers/agentController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticateToken, requireAgentOrAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get(
  "/agent/users",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(listAgentUsers)
);

router.get(
  "/agent/sessions",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(getAgentSessions)
);

router.get(
  "/agent/session-code/:sessionCode",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(getAgentSessionByCode)
);

router.post(
  "/agent/group-session",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(createAgentGroupSession)
);

export default router;
