export type CallAvailabilityDay = {
  date: string;
  windowStartAt: string;
  windowEndAt: string;
  slots: string[];
};

export type CallsAvailabilityResponse = {
  timeZone: string;
  window: { startHour: number; endHour: number };
  stepMinutes: number;
  bufferMinutes: number;
  pricing: { amount: number; currency: string };
  requirePayment: boolean;
  durationMinutes: number;
  days: CallAvailabilityDay[];
};

export type CallBooking = {
  id: string;
  startAt: string;
  durationMinutes: number;
  name: string;
  email: string;
  topic: string;
  title: string;
  status: "scheduled" | "completed" | "cancelled" | string;
  paymentProvider?: "razorpay" | string;
  paymentStatus?: "paid" | "unpaid" | string;
  amount?: number;
  currency?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCallBookingResponse = {
  booking: CallBooking;
};

export type CreateCallCheckoutResponse = {
  checkout: { id: string; expiresAt: string };
  razorpay: { keyId: string; orderId: string; amount: number; currency: string };
  timeZone: string;
};

export type VerifyCallCheckoutResponse = {
  booking: CallBooking;
};

export type AdminCallBookingsResponse = {
  bookings: CallBooking[];
  timeZone: string;
};
