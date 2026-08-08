import connectDB from "lib/db";
import { Role } from "models/Role";
import User from "models/User";

export const getUsersData = async (limit: number) => {
  await connectDB();
  
  // اجرای هم‌زمان کوئری‌ها برای بالا رفتن سرعت لود صفحه
  const [usersDocs, totalCount, activeCount] = await Promise.all([
    User.find()
      .limit(limit)
      .populate({
        path: 'role',
        model: Role,
        select: 'name _id'
      })
      .lean(),
    User.countDocuments(), // تعداد کل کاربران در دیتابیس
    User.countDocuments({ isActive: true }) // تعداد کل کاربران فعال در دیتابیس
  ]);

  const serializedUsers = usersDocs.map((user: any) => {
    let roleName = "USER";
    if (user.role && typeof user.role === "object") {
      roleName = user.role.name || "USER";
    }

    return {
      _id: user._id.toString(),
      fullname: user.fullname || "کاربر بدون نام",
      phone: user.phone,
      email: user.email || "بدون ایمیل",
      role: roleName, 
      isActive: Boolean(user.isActive),
      createdAt: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("fa-IR")
        : "ثبت نشده",
    };
  });

  return {
    users: serializedUsers,
    stats: {
      total: totalCount,
      active: activeCount,
      inactive: totalCount - activeCount // مابقی غیرفعال هستند
    }
  };
};