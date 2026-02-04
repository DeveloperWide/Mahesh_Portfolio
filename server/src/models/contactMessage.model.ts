import { model, Schema } from "mongoose";

export interface IContactMessage {
  name: string;
  email: string;
  message: string;
  createdAt?: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

contactMessageSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ContactMessage = model<IContactMessage>(
  "contactMessage",
  contactMessageSchema,
);

