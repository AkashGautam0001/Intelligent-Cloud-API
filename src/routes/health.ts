import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    service: "intelligent-cloud-api",
    status: "ok",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});
