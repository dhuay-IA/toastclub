import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { convertPresentationToPdf } from "../controllers/presentationController.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

router.post(
  "/presentations/convert-to-pdf",
  upload.single("presentation"),
  asyncHandler(convertPresentationToPdf)
);

export default router;
