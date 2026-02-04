import { model, Schema, type Types } from "mongoose";

export type CallCheckoutStatus = "created" | "paid" | "expired" | "cancelled";

export interface ICallCheckout {
  startAt: Date;
  durationMinutes: number;
  name: string;
  email: string;
  topic: string;
  title: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  bookingId?: Types.ObjectId;
  status: CallCheckoutStatus;
  holdExpiresAt: Date;
  // TTL cleanup time for this checkout record (not the hold expiry).
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const callCheckoutSchema = new Schema<ICallCheckout>(
  {
    startAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    topic: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, trim: true },
    razorpayOrderId: { type: String, required: true, trim: true, index: true },
    razorpayPaymentId: { type: String, required: false, trim: true },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "callBooking",
      required: false,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["created", "paid", "expired", "cancelled"],
      default: "created",
      index: true,
    },
    // Payment/hold expiry (used to validate booking confirmation).
    holdExpiresAt: { type: Date, required: true, index: true },
    // TTL index: checkout doc is removed once expiresAt is reached (retention cleanup).
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
  },
  { timestamps: true },
);

callCheckoutSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CallCheckout = model<ICallCheckout>(
  "callCheckout",
  callCheckoutSchema,
);
