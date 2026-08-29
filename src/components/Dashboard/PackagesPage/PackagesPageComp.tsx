"use client";

import PackageFormComp, {
  IPackageInitialData,
  IMenuItem,
  IPriceTier,
} from "@/components/Dashboard/PackageForm/PackageFormComp";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface MenuData {
  _id?: string;
  title: string;
  pricingTiers: IPriceTier[];
  items: IMenuItem[];
  description: string;
}

interface PackageData {
  _id: string;
  title: string;
  slug: string;
  category: "general-menu" | "sub-services-menu";
  menus: MenuData[];
}

interface PackagesPageCompProps {
  userPermissions: string[];
}

export default function PackagesPageComp({
  userPermissions,
}: PackagesPageCompProps) {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // وضعیت‌های مدال و کامپوننت فرم
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPackage, setSelectedPackage] = useState<
    IPackageInitialData | undefined
  >(undefined);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/private/packages");
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message || "خطا در گرفتن پکیج‌ها. دوباره امتحان کنید",
        );
      }
      const data = await res.json();
      setPackages(data.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "خطای سرور در دریافت پکیج‌ها";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormMode("create");
    setSelectedPackage(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: PackageData) => {
    setFormMode("edit");
    setSelectedPackage({
      _id: pkg._id,
      title: pkg.title,
      slug: pkg.slug,
      category: pkg.category,
      menus: pkg.menus || [],
    });
    setIsModalOpen(true);
  };

  const handleDeletePackage = async (id: string, title: string) => {
    const confirmDelete = window.confirm(
      `آیا از حذف پکیج «${title}» و تمامی منوهای زیرمجموعه آن اطمینان دارید؟ این عمل قابل بازگشت نیست.`,
    );

    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/private/packages/delete-package/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPackages((prev) => prev.filter((pkg) => pkg._id !== id));
        toast.success("پکیج با موفقیت حذف شد.");
      } else {
        toast.error(data.message || "خطا در حذف پکیج");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 text-right min-h-screen bg-slate-50 text-slate-800 rounded-2xl"
      dir="rtl"
    >
      {/* هدر صفحه - Responsive Flexbox */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            پکیج‌های تشریفات بارمن
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            مدیریت پکیج‌ها و منوهای اختصاصی خدمات
          </p>
        </div>
        {userPermissions.includes("packages:write") && (
          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-white shadow-md hover:shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 text-sm font-bold shrink-0"
            style={{ backgroundColor: "#85004E" }}
          >
            <span className="text-lg sm:text-xl leading-none">+</span>
            <span>افزودن پکیج جدید</span>
          </button>
        )}
      </div>

      {/* لیست پکیج‌ها */}
      {loading ? (
        <div className="text-center py-16 sm:py-20 text-slate-400 text-sm">
          در حال بارگذاری پکیج‌ها...
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white p-8 sm:p-16 text-center rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 text-slate-400 text-sm">
          هنوز هیچ پکیجی ثبت نشده است. روی «افزودن پکیج جدید» کلیک کنید.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
                  <span
                    className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold shrink-0"
                    style={{ backgroundColor: "#85004E12", color: "#85004E" }}
                  >
                    {pkg.category === "general-menu"
                      ? "پکیج کلی"
                      : "منوی خدماتی"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium shrink-0">
                    {pkg.menus?.length || 0} منو
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                  {pkg.title}
                </h2>
                {pkg.slug && (
                  <div className="mb-4">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/?menu=${pkg._id}`}
                      style={{ direction: "ltr" }}
                      className="inline-block text-xs text-left truncate text-blue-700 underline max-w-full"
                    >
                      مشاهده منو
                    </Link>
                  </div>
                )}

                {/* منوهای داخل پکیج */}
                <div className="space-y-3">
                  <span className="text-xs text-slate-400 block font-medium">
                    منوهای این پکیج:
                  </span>
                  {pkg.menus?.map((m, index) => (
                    <div
                      key={m._id || index}
                      className="bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-100 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-700">
                        <span className="truncate">{m.title}</span>
                      </div>

                      {/* نمایش پله‌های قیمت و ظرفیت */}
                      {m.pricingTiers?.length > 0 && (
                        <div className="space-y-1 bg-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-slate-100">
                          {m.pricingTiers.map((tier, tIdx) => (
                            <div
                              key={tIdx}
                              className="flex justify-between items-center text-[11px] sm:text-xs"
                            >
                              <span className="text-slate-500 truncate">
                                {tier.guestCapacity || "—"}
                              </span>
                              <span
                                className="font-bold shrink-0 mr-2"
                                style={{ color: "#85004E" }}
                              >
                                {tier.price || "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* نمایش آیتم‌های منو */}
                      {m.items?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.items.slice(0, 4).map((item, i) => (
                            <span
                              key={i}
                              title={item.description || undefined}
                              className="bg-white px-2 py-0.5 sm:py-1 rounded-lg border border-slate-200 text-[10px] sm:text-[11px] text-slate-600 flex items-center gap-1 max-w-full truncate"
                            >
                              <span className="truncate">{item.title}</span>
                              {item.description && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                                  title="دارای توضیحات"
                                />
                              )}
                            </span>
                          ))}
                          {m.items.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{m.items.length - 4} مورد دیگر
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* اکشن‌های پایین کارت (ویرایش و حذف) */}
              <div className="mt-5 sm:mt-6 flex gap-2">
                {userPermissions.includes("packages:update") && (
                  <button
                    onClick={() => handleOpenEditModal(pkg)}
                    className="flex-1 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    ویرایش پکیج
                  </button>
                )}

                {userPermissions.includes("packages:delete") && (
                  <button
                    onClick={() => handleDeletePackage(pkg._id, pkg.title)}
                    disabled={deletingId === pkg._id}
                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 shrink-0"
                  >
                    {deletingId === pkg._id ? "..." : "حذف"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مدال فرم - Responsive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors text-sm font-bold z-10"
            >
              ✕
            </button>

            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2 pl-8 sm:pl-0">
              {formMode === "create"
                ? "ایجاد پکیج و منوهای زیرمجموعه"
                : `ویرایش ${selectedPackage?.title}`}
            </h2>
            <p className="text-xs text-slate-400 mb-4 sm:mb-6">
              اطلاعات پکیج را وارد کرده و منوهای مربوط به آن را تنظیم کنید.
            </p>

            <PackageFormComp
              mode={formMode}
              initialData={selectedPackage}
              onSuccess={fetchPackages}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}