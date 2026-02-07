import { model, Schema, type Types } from "mongoose";

export type RefundKind = "call";
export type RefundRequestStatus =
  | "requested"
  | "rejected"
  | "refunded"
  | "failed";

export interface IRefundRequest {
  kind: RefundKind;
  name?: string;
  email: string;
  reason?: string;

  bookingId?: Types.ObjectId;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;

  amountMinor?: number;
  currency?: string;

  status: RefundRequestStatus;
  adminNote?: string;
  refundId?: string;
  processedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

const refundRequestSchema = new Schema<IRefundRequest>(
  {
    kind: { type: String, required: true, enum: ["call"], index: true },
    name: { type: String, required: false, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    reason: { type: String, required: false, trim: true },

    bookingId: { type: Schema.Types.ObjectId, required: false, index: true },
    razorpayOrderId: { type: String, required: false, trim: true, index: true },
    razorpayPaymentId: { type: String, required: false, trim: true, index: true, unique: true, sparse: true },

    amountMinor: { type: Number, required: false },
    currency: { type: String, required: false, trim: true },

    status: {
      type: String,
      required: true,
      enum: ["requested", "rejected", "refunded", "failed"],
      default: "requested",
      index: true,
    },
    adminNote: { type: String, required: false, trim: true },
    refundId: { type: String, required: false, trim: true, index: true },
    processedAt: { type: Date, required: false },
  },
  { timestamps: true },
);

refundRequestSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const RefundRequest = model<IRefundRequest>(
  "refundRequest",
  refundRequestSchema,
);
