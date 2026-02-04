import { Router } from "express";
import {
  adminCreateProject,
  adminDeleteProject,
  adminListProjects,
  adminUpdateProject,
} from "../controllers/adminProjects.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import adminCallsRoutes from "./adminCalls.route";
const router = Router();

router.get("/", (_req, res) => {
  res.send(`You're on Admin Page`);
});

router.use(requireAuth, requireAdmin);

router.use("/calls", adminCallsRoutes);

router.get("/projects", adminListProjects);
router.post("/projects", adminCreateProject);
router.put("/projects/:id", adminUpdateProject);
router.delete("/projects/:id", adminDeleteProject);

export default router;
