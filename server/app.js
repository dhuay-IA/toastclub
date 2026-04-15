import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, ".env.local") });

import express from "express";
import cors from "cors";
import "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import presentationRoutes from "./routes/presentationRoutes.js";
import vrRoutes from "./routes/vrRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) || "*",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running.",
  });
});

app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", profileRoutes);
app.use("/api", presentationRoutes);
app.use("/api", vrRoutes);
app.use(errorHandler);

export default app;

app.get("/ping", (_req, res) => {
  res.json({ ok: true });
});
