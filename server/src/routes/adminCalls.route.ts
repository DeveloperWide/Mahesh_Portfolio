import { Router } from "express";
import {
  adminListCallBookings,
  adminUpdateCallBookingStatus,
} from "../controllers/adminCalls.controller";

const router = Router();

router.get("/bookings", adminListCallBookings);
router.patch("/bookings/:id", adminUpdateCallBookingStatus);

export default router;

