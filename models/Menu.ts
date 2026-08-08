import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenu extends Document {
  title: string; // مثلا: منو شماره ۱، منو اقتصادی
  items: string[]; // لیست آیتم‌ها: ['کریسپی چیکن', ...]
  price: string; // قیمت به تومان
  guestCapacity: string; // مناسب برای ۱۵ تا ۳۰ نفر
  createdAt: Date;
  updatedAt: Date;
}

const menuSchema = new Schema<IMenu>(
  {
    title: { type: String, required: true },
    items: [{ type: String, required: true }],
    price: { type: String, required: true },
    guestCapacity: { type: String, required: true },
  },
  { timestamps: true }
);

export const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", menuSchema);