import { Router } from "express";
import {
  finishVrSession,
  getMyVrSession,
  getVrSessionPackageByCode,
  getVrAccess,
  listMyVrSessions,
  startVrSession,
  uploadVrSessionVideoByCode,
} from "../controllers/vrController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});

router.get("/vr/access", asyncHandler(authenticateToken), asyncHandler(getVrAccess));
router.get("/vr/session-code/:sessionCode/package", asyncHandler(getVrSessionPackageByCode));
router.post(
  "/vr/session-code/:sessionCode/video",
  upload.single("video"),
  asyncHandler(uploadVrSessionVideoByCode)
);
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
