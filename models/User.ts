import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullname: string;
  phone: string;
  email?: string; // ایمیل را اختیاری (optional) کردیم تا اگر ورود فقط با شماره همراه بود به مشکل نخوری
  password?: string;
  role: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true, // هر شماره همراه فقط مخصوص یک کاربر است
      trim: true,
      match: [/^09\d{9}$/, "لطفا یک شماره همراه معتبر وارد کنید"], // ولیدیشن شماره موبایل ایران
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // به مونیگوز می‌گوید مقدار null یا خالی را در ایندکس یکتا نادیده بگیرد (مهم برای فیلدهای اختیاری)
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "لطفا یک ایمیل معتبر وارد کنید"],
    },
    password: {
      type: String,
      required: false, // برای مواقعی که بعداً بخواهی ورود یکبار مصرف (OTP) یا گوگل اضافه کنی
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ایندکس‌گذاری فیلدها برای سرعت بسیار بالا در زمان سرچ و لاگین
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });

// متد مقایسه پسورد برای سندهای معمولی مونیگوز
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;