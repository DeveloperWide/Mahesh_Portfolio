import { Router } from "express";
import { createRefundRequest } from "../controllers/refunds.controller";

const router = Router();

router.post("/", createRefundRequest);

export default router;

