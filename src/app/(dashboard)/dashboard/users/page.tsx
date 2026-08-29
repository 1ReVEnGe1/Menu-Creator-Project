import { auth } from "@/auth";
import UsersPageComp from "@/components/Dashboard/UsersPage/UsersPageComp";
import Link from "next/link";

import { redirect } from "next/navigation";
import { getUsersData } from "utils/getUsers";

const LIMIT = 10;

const UsersPage = async () => {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  const userPermissions = session.user.permissions || [];
  const userRole = session.user.role;

  const { users, stats } = await getUsersData(LIMIT);

  const canCreateUser =
    userRole === "SUPER_ADMIN" || userPermissions.includes("users:write");

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 text-right min-h-screen bg-slate-50 text-slate-800 rounded-2xl space-y-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            مدیریت کاربران
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            لیست کاربران عضو شده و مدیریت دسترسی‌های آن‌ها
          </p>
        </div>

        {canCreateUser && (
          <Link
            href="/dashboard/users/add-user"
            className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-white shadow-md hover:shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 text-sm font-bold shrink-0"
            style={{ backgroundColor: "#85004E" }}
          >
            <span className="text-lg sm:text-xl leading-none">+</span>
            <span>افزودن کاربر جدید</span>
          </Link>
        )}
      </div>

      {/* لیست کاربران و آمار */}
      <UsersPageComp
        userRole={userRole}
        userPermissions={userPermissions}
        initialUsers={users}
        stats={stats}
      />
    </div>
  );
};

export default UsersPage;