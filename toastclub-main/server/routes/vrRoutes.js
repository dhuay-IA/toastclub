import { Router } from "express";
import {
  finishVrSession,
  getMyVrSession,
  getVrSessionPackageByCode,
  getVrAccess,
  listMyVrSessions,
  startVrSession,
} from "../controllers/vrController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/vr/access", asyncHandler(authenticateToken), asyncHandler(getVrAccess));
router.get("/vr/session-code/:sessionCode/package", asyncHandler(getVrSessionPackageByCode));
router.get("/vr/sessions", asyncHandler(authenticateToken), asyncHandler(listMyVrSessions));
router.get(
  "/vr/session/:sessionId",
  asyncHandler(authenticateToken),
  asyncHandler(getMyVrSession)
);
router.post("/vr/session", asyncHandler(authenticateToken), asyncHandler(startVrSession));
router.post(
  "/vr/session/:sessionId/complete",
  asyncHandler(authenticateToken),
  asyncHandler(finishVrSession)
);

export default router;
