import { Router } from "express";
import {
  adminCreateProject,
  adminDeleteProject,
  adminListProjects,
  adminUpdateProject,
} from "../controllers/adminProjects.controller";
import { adminGetAnalytics } from "../controllers/adminAnalytics.controller";
import {
  adminGetContactMessage,
  adminListContactMessages,
} from "../controllers/adminContacts.controller";
import { adminSendEmail } from "../controllers/adminEmail.controller";
import {
  adminApproveRefundRequest,
  adminListRefundRequests,
  adminRejectRefundRequest,
} from "../controllers/adminRefunds.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import adminCallsRoutes from "./adminCalls.route";
const router = Router();

router.get("/", (_req, res) => {
  res.send(`You're on Admin Page`);
});

router.use(requireAuth, requireAdmin);

router.get("/analytics", adminGetAnalytics);

router.get("/contacts", adminListContactMessages);
router.get("/contacts/:id", adminGetContactMessage);

router.post("/email/send", adminSendEmail);

router.get("/refunds", adminListRefundRequests);
router.post("/refunds/:id/approve", adminApproveRefundRequest);
router.post("/refunds/:id/reject", adminRejectRefundRequest);

router.use("/calls", adminCallsRoutes);

router.get("/projects", adminListProjects);
router.post("/projects", adminCreateProject);
router.put("/projects/:id", adminUpdateProject);
router.delete("/projects/:id", adminDeleteProject);

export default router;
