"use client";

import { useDashboard } from "@/hools/useDashboard";
import Link, { useLinkStatus } from "next/link";
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
  isOnMobile: boolean;
}

const menuItems: MenuItem[] = [
  {
    url: "/dashboard",
    title: "داشبورد",
    hasChild: false,
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

const DashSidebarComp = ({
  role,
  permissions = [],
  isOnMobile,
}: DashSidebarCompProps) => {
  const { setSidebarOpen } = useDashboard();
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter((item) => {
    if (role === "SUPER_ADMIN") return true;
    if (!item.module) return true;

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
                onClick={() => {
                  if (isOnMobile) {
                    setSidebarOpen(false);
                  }
                }}
                className={`flex items-center gap-3 ${
                  isOnMobile ? "px-2 py-2 text-sm" : "px-4 py-3"
                } rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? "font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "#85004E12",
                        color: "#85004E",
                      }
                    : undefined
                }
              >
                <span>{menuItem.title}</span>

                <NavPendingIndicator />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DashSidebarComp;

function NavPendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`mr-auto w-4 h-4 border-2 border-current border-t-transparent rounded-full transition-opacity ${
        pending ? "opacity-100 animate-spin" : "opacity-0"
      }`}
      aria-hidden="true"
    />
  );
}
