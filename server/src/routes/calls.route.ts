import { Router } from "express";
import {
  createBooking,
  createCheckout,
  getAvailability,
  verifyCheckout,
} from "../controllers/calls.controller";

const router = Router();

router.get("/availability", getAvailability);
router.post("/checkout", createCheckout);
router.post("/verify", verifyCheckout);
router.post("/bookings", createBooking);

export default router;
