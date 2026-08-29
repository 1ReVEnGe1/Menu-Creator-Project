"use client";

import Link from "next/link";
import { useState } from "react";

interface UserType {
  _id: string;
  fullname: string;
  phone: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface StatsType {
  total: number;
  active: number;
  inactive: number;
}

type UsersPageCompProps = {
  userRole: string;
  userPermissions: string[];
  initialUsers: UserType[];
  stats: StatsType;
};

const UsersPageComp = ({
  userRole,
  userPermissions,
  initialUsers,
  stats: initialStats,
}: UsersPageCompProps) => {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [stats, setStats] = useState<StatsType>(initialStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ==========================================
  // Permissions
  // ==========================================

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const canEditUsers = isSuperAdmin || userPermissions.includes("users:update");

  const canDeleteUsers =
    isSuperAdmin || userPermissions.includes("users:delete");

  const canManageUsers = canEditUsers || canDeleteUsers;

  // ==========================================
  // Delete Handler
  // ==========================================

  const handleDeleteUser = async (user: UserType) => {
    const confirmDelete = window.confirm(
      `آیا از حذف کاربر «${user.fullname}» مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`
    );

    if (!confirmDelete) return;

    setDeletingId(user._id);

    try {
      const res = await fetch(`/api/private/users/delete-user/${user._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== user._id));

        setStats((prevStats) => ({
          total: prevStats.total - 1,
          active: user.isActive ? prevStats.active - 1 : prevStats.active,
          inactive: !user.isActive ? prevStats.inactive - 1 : prevStats.inactive,
        }));
      } else {
        alert(data.message || "خطا در حذف کاربر");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Search
  // ==========================================

  const filteredUsers = users.filter(
    (user) =>
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==========================================
          Stats
      ========================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              کل کاربران سیستم
            </p>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
              {stats.total} نفر
            </h3>
          </div>

          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: "#85004E12" }}
          >
            👥
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              کل کاربران فعال
            </p>

            <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
              {stats.active} نفر
            </h3>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">
            🟢
          </div>
        </div>

        {/* Inactive Users */}
        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              کل کاربران غیرفعال
            </p>

            <h3 className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
              {stats.inactive} نفر
            </h3>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-lg shrink-0">
            🔴
          </div>
        </div>
      </div>

      {/* ==========================================
          Search
      ========================================== */}

      <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="جستجوی نام، تلفن یا ایمیل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 transition-all text-sm text-slate-700 text-right"
            style={{
              borderColor: undefined,
            }}
          />

          <span className="absolute right-3 top-3 text-slate-400 text-sm">
            🔍
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          نمایش {filteredUsers.length} کاربر از {users.length} کاربر لود شده
        </div>
      </div>

      {/* ==========================================
          Desktop Table
      ========================================== */}

      <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold">
                <th className="p-4 pr-6">کاربر</th>
                <th className="p-4">شماره همراه</th>
                <th className="p-4">ایمیل</th>
                <th className="p-4">نقش کاربری</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4">تاریخ عضویت</th>
                {canManageUsers && (
                  <th className="p-4 pl-6 text-left">عملیات</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    {/* User */}
                    <td className="p-4 pr-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0"
                          style={{ backgroundColor: "#85004E" }}
                        >
                          {user.fullname?.[0] || "?"}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {user.fullname}
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5">
                            #{user._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="p-4 text-xs text-slate-600 font-mono">
                      {user.phone}
                    </td>

                    {/* Email */}
                    <td className="p-4 text-slate-500 text-xs">
                      {user.email || "-"}
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "#85004E12",
                          color: "#85004E",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: "#85004E" }}
                        />
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.isActive ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {user.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="p-4 text-xs text-slate-500">
                      {user.createdAt}
                    </td>

                    {/* Actions */}
                    {canManageUsers && (
                      <td className="p-4 pl-6 text-left">
                        <div className="inline-flex items-center gap-2">
                          {/* Edit */}
                          {canEditUsers && (
                            <Link
                              href={`/dashboard/users/edit-user/${user._id}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              ویرایش
                            </Link>
                          )}

                          {/* Delete */}
                          {canDeleteUsers && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingId === user._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {deletingId === user._id ? "..." : "حذف"}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canManageUsers ? 7 : 6}
                    className="p-8 text-center text-slate-400 text-sm"
                  >
                    کاربری با این مشخصات یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          Mobile Cards
      ========================================== */}

      <div className="block md:hidden space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4"
            >
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0"
                    style={{ backgroundColor: "#85004E" }}
                  >
                    {user.fullname?.[0] || "?"}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {user.fullname}
                    </h4>

                    <span className="text-[11px] text-slate-400 font-mono">
                      #{user._id.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                    user.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  {user.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>

              <hr className="border-slate-100" />

              {/* User Info */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                {/* Phone */}
                <div>
                  <span className="text-slate-400 block mb-0.5">تلفن:</span>
                  <span className="font-mono text-slate-700">{user.phone}</span>
                </div>

                {/* Role */}
                <div>
                  <span className="text-slate-400 block mb-0.5">
                    نقش کاربری:
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "#85004E" }}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Email */}
                <div className="col-span-2">
                  <span className="text-slate-400 block mb-0.5">ایمیل:</span>
                  <span className="text-slate-600 break-all">
                    {user.email || "-"}
                  </span>
                </div>

                {/* Created At */}
                <div className="col-span-2">
                  <span className="text-slate-400 block mb-0.5">
                    تاریخ ثبت نام:
                  </span>
                  <span className="text-slate-600">{user.createdAt}</span>
                </div>
              </div>

              {/* Mobile Actions */}
              {canManageUsers && (
                <>
                  <hr className="border-slate-100" />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {/* Edit */}
                    {canEditUsers && (
                      <Link
                        href={`/dashboard/users/edit-user/${user._id}`}
                        className="flex-1 text-center py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        ویرایش
                      </Link>
                    )}

                    {/* Delete */}
                    {canDeleteUsers && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingId === user._id}
                        className="flex-1 text-center py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === user._id ? "در حال حذف..." : "حذف"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 text-sm">
            کاربری با این مشخصات یافت نشد.
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPageComp;