import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem {
  title: string;
  description?: string;
}

// ۱. اینترفیس قیمت‌گذاری بر اساس ظرفیت متنی
export interface IPriceTier {
  guestCapacity: string; // مثلاً: "از ۶۰ نفر تا ۱۲۰ نفر"
  price: string;         // مثلاً: "۷۵,۰۰۰,۰۰۰"
}

export interface IMenu extends Document {
  title: string;
  items: IMenuItem[];
  pricingTiers: IPriceTier[]; // آرایه‌ای از قیمت‌ها و ظرفیت‌ها
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// اسکیمای آیتم‌های منو
const menuItemSchema = new Schema<IMenuItem>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

// ۲. اسکیمای قیمت‌گذاری پله‌ای
const priceTierSchema = new Schema<IPriceTier>(
  {
    guestCapacity: { type: String, required: true },
    price: { type: String, required: true },
  },
  { _id: false }
);

// اسکیمای اصلی منو
const menuSchema = new Schema<IMenu>(
  {
    title: { type: String, required: true },
    items: [menuItemSchema],
    pricingTiers: [priceTierSchema],
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", menuSchema);