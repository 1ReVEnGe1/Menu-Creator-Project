import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPackage extends Document {
  title: string; // مثلا: پکیج‌های تولد بزرگسال ۱۴۰۵، یا منوهای بارتندری
  category: "sub-services-menu" | "general-menu"; // نوع منو
  slug: string; // برای آدرس‌دهی راحت‌تر فرانت
  menus: mongoose.Types.ObjectId[]; // ارجاع به منوهای ساخته شده
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["sub-services-menu", "general-menu"],
      required: true,
    },
    slug: { type: String, required: true, unique: true },
    menus: [
      {
        type: Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
  },
  { timestamps: true }
);

export const Package: Model<IPackage> =
  mongoose.models.Package || mongoose.model<IPackage>("Package", packageSchema);