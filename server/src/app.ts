import express from "express";
import cors from "cors";

// Routes
import adminRoutes from "./routes/admin.route";
import authRoutes from "./routes/auth.route";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173/"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

export default app;
