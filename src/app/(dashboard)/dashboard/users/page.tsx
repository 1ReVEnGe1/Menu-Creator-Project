// app/dashboard/users/page.tsx

import { auth } from "@/auth";
import UsersPageComp from "@/components/Dashboard/UsersPage/UsersPageComp";

import { redirect } from "next/navigation";
import { getUsersData } from "utils/getUsers";

const LIMIT = 10;

const UsersPage = async () => {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/");
  }

  const userPermissions = session.user.permissions || [];
  const userRole = session.user.role;

  const { users, stats } = await getUsersData(LIMIT);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مدیریت کاربران</h1>
          <p className="text-sm text-slate-500 mt-1">
            لیست کاربران عضو شده و مدیریت دسترسی‌های آن‌ها
          </p>
        </div>
        <button className="self-start md:self-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm shadow-indigo-100 flex items-center gap-2">
          <span>افزودن کاربر جدید</span>
        </button>
      </div>

      {/* پاس دادن آمار واقعی به همراه لیست کاربران */}
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
