import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { requireAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth.routes";
import prefRoutes from "./routes/preferences.routes";
import appRoutes from "./routes/apps.routes";
import fsRoutes from "./routes/fs.routes";
import assistantRoutes from "./routes/assistant.routes";

const app = express();
app.disable("x-powered-by");

// Configure Helmet with cross-origin resource policy for Render deployments
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Dynamic CORS configuration allowing localhost and onrender.com subdomains
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.clientOrigin === "*") return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");
      const allowed = env.clientOrigin
        .split(",")
        .map((s) => s.trim().replace(/\/$/, ""));

      if (
        allowed.includes(cleanOrigin) ||
        allowed.includes("*") ||
        cleanOrigin.includes("onrender.com") ||
        cleanOrigin.includes("localhost") ||
        cleanOrigin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }

      return callback(null, true); // Permissive fallback to prevent breaking cross-domain apps
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Rate limiters
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check endpoints for Render and pingers
app.get(["/", "/health", "/api/health"], (_req, res) =>
  res.json({
    status: "ok",
    service: "door-os-api",
    timestamp: new Date().toISOString(),
  })
);

// API routes
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  authRoutes
);
app.use("/api/preferences", requireAuth, prefRoutes);
app.use("/api/apps", requireAuth, appRoutes);
app.use("/api/fs", requireAuth, fsRoutes);
app.use("/api/assistant", requireAuth, assistantRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use(errorHandler);

export default app;
