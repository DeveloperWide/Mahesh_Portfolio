import { model, Schema } from "mongoose";

export interface IProject {
  title: string;
  slug: string;
  tagline: string;
  descriptionMd?: string;
  tech: string[];
  imageUrl?: string;
  imagePublicId?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    tagline: { type: String, required: true, trim: true },
    descriptionMd: { type: String, default: "" },
    tech: { type: [String], default: [] },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

projectSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Project = model<IProject>("project", projectSchema);
