import { model, Schema } from "mongoose";

export type CallBookingStatus = "scheduled" | "completed" | "cancelled";

export type CallPaymentProvider = "razorpay";
export type CallPaymentStatus = "paid" | "unpaid";

export interface ICallBooking {
  startAt: Date;
  durationMinutes: number;
  name: string;
  email: string;
  topic: string;
  title: string;
  status: CallBookingStatus;
  paymentProvider?: CallPaymentProvider;
  paymentStatus: CallPaymentStatus;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const callBookingSchema = new Schema<ICallBooking>(
  {
    startAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    topic: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    paymentProvider: {
      type: String,
      required: false,
      enum: ["razorpay"],
      index: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["paid", "unpaid"],
      default: "unpaid",
      index: true,
    },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "INR" },
    razorpayOrderId: { type: String, required: false, trim: true, index: true },
    razorpayPaymentId: { type: String, required: false, trim: true, index: true },
    paidAt: { type: Date, required: false },
  },
  { timestamps: true },
);

callBookingSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CallBooking = model<ICallBooking>(
  "callBooking",
  callBookingSchema,
);
