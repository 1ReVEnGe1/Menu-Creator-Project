// proxy.ts (یا middleware.ts)
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // ۱. عدم دسترسی برای کاربر غیر لاگین
  if (!token && isDashboardPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ۲. هدایت کاربر لاگین شده از صفحات لاگین
  if (token && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ۳. ارزیابی پویای دسترسی‌ها
  if (token && isDashboardPage) {
    const userRole = (token.role as string) || "USER";
    const userPermissions = (token.permissions as string[]) || [];

    // مدیر کل به همه‌چیز دسترسی دارد
    if (userRole === "SUPER_ADMIN") {
      return NextResponse.next();
    }

    // اگر مسیر دقیقا خود "/dashboard" بود
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.next();
    }

    // استخراج ماژول از URL:
    // مثلاً از "/dashboard/access-control/roles" بخش "access-control" را می‌گیرد
    const segments = pathname.split("/").filter(Boolean); // ["dashboard", "access-control", "roles"]
    const rawModule = segments[1]; // "access-control"

    if (rawModule) {
      // تبدیل "-" به "_" جهت همخوانی با نام ماژول در دیتابیس (مثلا access-control -> access_control)
      const moduleName = rawModule.replace(/-/g, "_");

      // بررسی اینکه آیا کاربر پرمیشنی مربوط به این ماژول دارد یا نه
      // مثلاً چک می‌کند آیا "users:read" یا "users:write" یا "users" در لیست دارد یا نه
      const hasPermission = userPermissions.some((perm) => {
        const [permModule] = perm.split(":"); // "users:read" -> "users"
        return permModule === moduleName || perm === moduleName;
      });

      if (!hasPermission) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard"; // هدایت به صفحه اصلی داشبورد در صورت عدم داشتن دسترسی
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*"],
};