import { model, Schema, type Types } from "mongoose";

export type CallSlotLockKind = "booking" | "hold";

export interface ICallSlotLock {
  blockStartAt: Date;
  kind: CallSlotLockKind;
  bookingId?: Types.ObjectId;
  holdId?: Types.ObjectId;
  expiresAt?: Date;
  createdAt?: Date;
}

const callSlotLockSchema = new Schema<ICallSlotLock>(
  {
    blockStartAt: { type: Date, required: true, unique: true, index: true },
    kind: {
      type: String,
      required: true,
      enum: ["booking", "hold"],
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "callBooking",
      required: false,
      index: true,
    },
    holdId: {
      type: Schema.Types.ObjectId,
      ref: "callCheckout",
      required: false,
      index: true,
    },
    // TTL index: hold lock doc is removed once expiresAt is reached.
    expiresAt: {
      type: Date,
      required: false,
      index: true,
      expires: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const CallSlotLock = model<ICallSlotLock>(
  "callSlotLock",
  callSlotLockSchema,
);
