import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { settingsRouter } from "./routes/settings";
import { servicesRouter, servicesAdminRouter } from "./routes/services";
import { solutionsRouter, solutionsAdminRouter } from "./routes/solutions";
import { faqsRouter, faqsAdminRouter } from "./routes/faqs";
import { docsRouter, docsAdminRouter } from "./routes/docs";
import { partnersRouter, partnersAdminRouter } from "./routes/partners";
import { contactRouter, contactsAdminRouter } from "./routes/contact";
import { bookingsRouter, bookingsAdminRouter } from "./routes/bookings";
import { ticketsPublicRouter, ticketsAdminRouter } from "./routes/tickets";
import { dashboardAdminRouter } from "./routes/dashboard";
import { uploadsRouter } from "./routes/uploads";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { startBookingReminderJob } from "./jobs/bookingReminders";

async function bootstrap() {
  const uploadPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  await connectDb();

  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/uploads", express.static(uploadPath));

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      name: "Intelligent-Cloud API",
      version: "0.1.3",
      health: "/health",
      status: "/status",
    });
  });

  app.use("/health", healthRouter);
  app.use("/status", healthRouter);
  app.use("/auth", authRouter);
  app.use("/settings", settingsRouter);
  app.use("/services", servicesRouter);
  app.use("/admin/services", servicesAdminRouter);
  app.use("/solutions", solutionsRouter);
  app.use("/admin/solutions", solutionsAdminRouter);
  app.use("/faqs", faqsRouter);
  app.use("/admin/faqs", faqsAdminRouter);
  app.use("/docs", docsRouter);
  app.use("/admin/docs", docsAdminRouter);
  app.use("/partners", partnersRouter);
  app.use("/admin/partners", partnersAdminRouter);
  app.use("/contact", contactRouter);
  app.use("/admin/contacts", contactsAdminRouter);
  app.use("/bookings", bookingsRouter);
  app.use("/admin/bookings", bookingsAdminRouter);
  app.use("/support/tickets", ticketsPublicRouter);
  app.use("/admin/tickets", ticketsAdminRouter);
  app.use("/admin/dashboard", dashboardAdminRouter);
  app.use("/admin/uploads", uploadsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    console.log(`[api] Listening on http://localhost:${env.PORT}`);
    console.log(`[api] CORS origins: ${env.corsOrigins.join(", ")}`);
    startBookingReminderJob();
  });
}

bootstrap().catch((err) => {
  console.error("[api] Failed to start:", err);
  process.exit(1);
});
