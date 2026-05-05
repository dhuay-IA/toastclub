import { Router } from "express";
import {
  cancelMyVrSession,
  finishVrSession,
  getMyVrSession,
  getVrSessionPackageByCode,
  getVrAccess,
  listMyVrSessions,
  saveMyVrSessionFeedback,
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
  upload.fields([{ name: "audio", maxCount: 1 }, { name: "video", maxCount: 1 }]),
  asyncHandler(uploadVrSessionVideoByCode)
);
router.post(
  "/vr/session-code/:sessionCode/audio",
  upload.fields([{ name: "audio", maxCount: 1 }, { name: "video", maxCount: 1 }]),
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
router.post(
  "/vr/session/:sessionId/feedback",
  asyncHandler(authenticateToken),
  asyncHandler(saveMyVrSessionFeedback)
);
router.post(
  "/vr/session/:sessionId/cancel",
  asyncHandler(authenticateToken),
  asyncHandler(cancelMyVrSession)
);

export default router;
