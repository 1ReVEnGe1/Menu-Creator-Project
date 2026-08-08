import mongoose, { Document } from "mongoose";

export interface IPermission extends Document {
  name: string; 
  description?: string; 
  module: string; 
  createdAt: Date;
}

const permissionSchema = new mongoose.Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, trim: true },
    module: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

permissionSchema.index({ name: 1 });

export const Permission: mongoose.Model<IPermission> =
  mongoose.models.Permission ||
  mongoose.model<IPermission>("Permission", permissionSchema);
