import { Router } from "express";
import { getAgentSessionByCode, listAgentStudents } from "../controllers/agentController.js";
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
  "/agent/session-code/:sessionCode",
  asyncHandler(authenticateToken),
  asyncHandler(requireAgentOrAdmin),
  asyncHandler(getAgentSessionByCode)
);

export default router;
