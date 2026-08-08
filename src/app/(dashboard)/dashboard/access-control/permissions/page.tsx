
import PermissionListComp from "@/components/Dashboard/AccessControlPage/PermissionListComp";
import connectDB from "lib/db";
import { Permission } from "models/Permission";
import Link from "next/link";

const getAllPermissions = async () => {
  await connectDB();
  // مرتب‌سازی بر اساس ماژول و سپس نام پرمیشن
  const permissions = await Permission.find().sort({ module: 1, name: 1 }).lean();

  return permissions.map((p: any) => ({
    _id: p._id.toString(),
    name: p.name,
    description: p.description || "",
    module: p.module,
  }));
};

const PermissionsPage = async () => {
  const permissions = await getAllPermissions();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" dir="rtl">
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مدیریت سطوح دسترسی (Permissions)</h1>
          <p className="text-sm text-slate-500 mt-1">
            لیست کلیدهای دسترسی تعریف شده در سیستم به تفکیک ماژول‌های برنامه‌نویسی.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/access-control"
            className="text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 px-4 py-2.5 rounded-xl transition-all"
          >
            مدیریت نقش‌ها (Roles)
          </Link>
          <Link
            href="/dashboard/access-control/permissions/new-permission"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100"
          >
            + افزودن پرمیشن جدید
          </Link>
        </div>
      </div>

      {/* کامپوننت نمایش لیست */}
      <PermissionListComp initialPermissions={permissions} />
    </div>
  );
};

export default PermissionsPage;