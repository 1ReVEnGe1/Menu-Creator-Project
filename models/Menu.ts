import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem {
  title : string,
  description?: string
}

export interface IMenu extends Document {
  title: string; // مثلا: منو شماره ۱، منو اقتصادی
  items: IMenuItem[]; // لیست آیتم‌ها: ['کریسپی چیکن', ...]
  price: string; // قیمت به تومان
  guestCapacity: string; // مناسب برای ۱۵ تا ۳۰ نفر
  description : string;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    title : {type : String, required : true},
    description : {type : String, default : ''}
  },
  {
    _id : false
  }
)

const menuSchema = new Schema<IMenu>(
  {
    title: { type: String, required: true },
    items: [menuItemSchema],
    price: { type: String, required: true },
    guestCapacity: { type: String, required: true },
    description : {type : String}
  },
  { timestamps: true }
);

export const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", menuSchema);