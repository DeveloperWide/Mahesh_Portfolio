import express from "express";
import cors from "cors";
import { mongoSanitizeCompat } from "./middlewares/mongoSanitize.middleware";

// Routes
import adminRoutes from "./routes/admin.route";
import authRoutes from "./routes/auth.route";
import callsRoutes from "./routes/calls.route";
import contactRoutes from "./routes/contact.route";
import projectsRoutes from "./routes/projects.route";
import refundsRoutes from "./routes/refunds.route";

const app = express();
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || "http://localhost:5173")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
  }),
);
app.use(express.json());
app.use(mongoSanitizeCompat);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/calls", callsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/refunds", refundsRoutes);

export default app;
