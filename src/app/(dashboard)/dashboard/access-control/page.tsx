import AccessControlPageComp from "@/components/Dashboard/AccessControlPage/AccessControlPageComp";
import connectDB from "lib/db";
import { Permission } from "models/Permission";
import { Role } from "models/Role";

import Link from "next/link";

const LIMIT = 10;

const getRolesData = async () => {
  await connectDB();

  // گرفتن کل آمار نقش‌ها
  const totalRoles = await Role.countDocuments();
  const systemRoles = await Role.countDocuments({ isSystemRole: true });
  const customRoles = totalRoles - systemRoles;

  const roles = await Role.find()
    .limit(LIMIT)
    .populate({
      path: "permissions",
      model: Permission,
    })
    .lean();

  const serializedRoles = roles.map((role: any) => {
    return {
      _id: role._id.toString(),
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p: any) => ({
        _id: p._id.toString(),
        name: p.name,
        description: p.description,
        module: p.module,
      })),
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt
        ? new Date(role.createdAt).toLocaleDateString("fa-IR")
        : "ثبت نشده",
      updatedAt: role.updatedAt
        ? new Date(role.updatedAt).toLocaleDateString("fa-IR")
        : "ثبت نشده",
    };
  });

  return {
    roles: serializedRoles,
    stats: {
      total: totalRoles,
      system: systemRoles,
      custom: customRoles,
    },
  };
};

const AccessControlPage = async () => {
  const { roles, stats } = await getRolesData();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            مدیریت نقش‌ها و دسترسی‌ها
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            تنظیم و مانیتورینگ سطوح دسترسی کاربران سیستم
          </p>
        </div>
        <Link
          href={"/dashboard/access-control/roles/new-role"}
          className="self-start md:self-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm shadow-indigo-100 flex items-center gap-2"
        >
          <span>افزودن نقش جدید</span>
        </Link>
        <Link
          href={"/dashboard/access-control/permissions"}
          className="self-start md:self-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm shadow-indigo-100 flex items-center gap-2"
        >
          <span>مدیریت دسترسی ها</span>
        </Link>
      </div>

      {/* پاس دادن داده‌ها به کامپوننت کلاینت */}
      <AccessControlPageComp initialRoles={roles} stats={stats} />
    </div>
  );
};

export default AccessControlPage;
