import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  const isDashboardPage =
    pathname.startsWith("/dashboard");

  // =====================================================
  // 1. کاربر لاگین نکرده و می‌خواهد وارد داشبورد شود
  // =====================================================

  if (!session && isDashboardPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";

    return NextResponse.redirect(url);
  }

  // =====================================================
  // 2. کاربر لاگین کرده و دوباره وارد Login/Register شده
  // =====================================================

  if (session && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";

    return NextResponse.redirect(url);
  }

  // =====================================================
  // 3. بررسی Permission های داشبورد
  // =====================================================

  if (session && isDashboardPage) {
    const user = session.user;

    const userRole = user?.role || "USER";
    const userPermissions = user?.permissions || [];

    // ---------------------------------------------------
    // SUPER_ADMIN به همه بخش‌ها دسترسی دارد
    // ---------------------------------------------------

    if (userRole === "SUPER_ADMIN") {
      return NextResponse.next();
    }

    // ---------------------------------------------------
    // خود صفحه اصلی Dashboard برای همه کاربران مجاز است
    // ---------------------------------------------------

    if (
      pathname === "/dashboard" ||
      pathname === "/dashboard/"
    ) {
      return NextResponse.next();
    }

    // ---------------------------------------------------
    // استخراج module از URL
    //
    // /dashboard/access-control/roles
    //
    // =>
    // access-control
    // ---------------------------------------------------

    const segments = pathname
      .split("/")
      .filter(Boolean);

    const rawModule = segments[1];

    if (rawModule) {
      // access-control
      // =>
      // access_control

      const moduleName = rawModule.replace(/-/g, "_");

      // -------------------------------------------------
      // بررسی Permission
      // -------------------------------------------------

      const hasPermission = userPermissions.some((perm) => {
        const [permModule] = perm.split(":");

        return (
          permModule === moduleName ||
          perm === moduleName
        );
      });

      // -------------------------------------------------
      // عدم دسترسی
      // -------------------------------------------------

      if (!hasPermission) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";

        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
  ],
};