"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface MenuItem {
  url: string;
  title: string;
  hasChild: boolean;
  module?: string; // نام ماژول مربوطه (اگر خالی باشد همه دسترسی دارند مثل dashboard)
}

interface DashSidebarCompProps {
  role: string;
  permissions: string[];
}

const menuItems: MenuItem[] = [
  {
    url: "/dashboard",
    title: "داشبورد",
    hasChild: false,
    // بدون module یعنی برای همه کاربران لاگین‌شده قابل مشاهده است
  },
  {
    url: "/dashboard/users",
    title: "کاربران",
    hasChild: false,
    module: "users",
  },
  {
    url: "/dashboard/access-control",
    title: "مدیریت دسترسی ها",
    hasChild: false,
    module: "access_control",
  },
  {
    url: "/dashboard/packages",
    title: "پکیج ها",
    hasChild: false,
    module: "packages",
  },
];

const DashSidebarComp = ({ role, permissions = [] }: DashSidebarCompProps) => {
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter((item) => {
    // ۱. اگر SUPER_ADMIN باشد همه منوها را ببیند
    if (role === "SUPER_ADMIN") return true;

    // ۲. اگر آیتم منو نیازی به ماژول خاصی ندارد (مثل خانه/داشبورد اصلی)
    if (!item.module) return true;

    // ۳. بررسی وجود حداقل یک پرمیشن مربوط به این ماژول در لیست دسترسی‌های کاربر
    // مثلاً اگر module === "users" باشد، وجود "users:read"، "users:write" یا "users" را چک می‌کند
    const hasModuleAccess = permissions.some((perm) => {
      const [permModule] = perm.split(":");
      return permModule === item.module || perm === item.module;
    });

    return hasModuleAccess;
  });

  return (
    <nav className="mt-4">
      <ul className="space-y-2">
        {filteredMenuItems.map((menuItem) => {
          const isActive = pathname === menuItem.url;

          return (
            <li key={menuItem.url}>
              <Link
                href={menuItem.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{menuItem.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DashSidebarComp;