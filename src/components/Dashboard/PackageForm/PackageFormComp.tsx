"use client";

import { useState, useRef } from "react";

export interface IMenuItem {
  title: string;
  description?: string;
}

export interface IPriceTier {
  guestCapacity: string;
  price: string;
}

export interface IMenuForm {
  _id?: string;
  title: string;
  pricingTiers: IPriceTier[];
  items: IMenuItem[];
  description: string;
}

export interface IPackageInitialData {
  _id?: string;
  title: string;
  slug?: string;
  category: "general-menu" | "sub-services-menu";
  menus: IMenuForm[];
}

interface PackageFormCompProps {
  mode: "create" | "edit";
  initialData?: IPackageInitialData;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PackageFormComp({
  mode,
  initialData,
  onSuccess,
  onClose,
}: PackageFormCompProps) {
  const [submitting, setSubmitting] = useState(false);

  // 1. Package level states
  const [packageTitle, setPackageTitle] = useState(initialData?.title || "");
  const [packageSlug, setPackageSlug] = useState(initialData?.slug || "");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [packageCategory, setPackageCategory] = useState<
    "general-menu" | "sub-services-menu"
  >(initialData?.category || "general-menu");

  // Accordion management
  const [openMenuIndexes, setOpenMenuIndexes] = useState<number[]>([0]);

  // Map initial data correctly with pricingTiers
  const [menus, setMenus] = useState<IMenuForm[]>(
    initialData?.menus && initialData.menus.length > 0
      ? initialData.menus.map((m) => ({
          _id: m._id,
          title: m.title || "",
          pricingTiers:
            m.pricingTiers && m.pricingTiers.length > 0
              ? m.pricingTiers.map((pt) => ({
                  guestCapacity: pt.guestCapacity || "",
                  price: pt.price || "",
                }))
              : [{ guestCapacity: "از ۶۰ نفر تا ۱۲۰ نفر", price: "" }],
          items:
            m.items && m.items.length > 0
              ? m.items.map((i) => ({
                  title: i.title || "",
                  description: i.description || "",
                }))
              : [{ title: "", description: "" }],
          description: m.description || "",
        }))
      : [
          {
            title: "منوی شماره ۱ (اقتصادی)",
            pricingTiers: [
              { guestCapacity: "از ۶۰ نفر تا ۱۲۰ نفر", price: "" },
            ],
            items: [{ title: "", description: "" }],
            description: "",
          },
        ]
  );

  const itemInputRefs = useRef<{
    [key: string]: HTMLInputElement | HTMLTextAreaElement | null;
  }>({});

  const handleSlugChange = (val: string) => {
    const formatted = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");
    setPackageSlug(formatted);
    setSlugError(null);
  };

  const verifySlugUniqueness = async () => {
    if (!packageSlug.trim()) {
      setSlugError("وارد کردن اسلاگ انگلیسی الزامی است.");
      return;
    }

    setCheckingSlug(true);
    try {
      const res = await fetch(
        `/api/private/packages/check-slug?slug=${encodeURIComponent(
          packageSlug
        )}&currentId=${initialData?._id || ""}`
      );
      const data = await res.json();

      if (!data.isUnique) {
        setSlugError(
          "این اسلاگ قبلاً استفاده شده است. لطفاً اسلاگ دیگری وارد کنید."
        );
      } else {
        setSlugError(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingSlug(false);
    }
  };

  const toggleAccordion = (index: number) => {
    setOpenMenuIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const expandAll = () => setOpenMenuIndexes(menus.map((_, i) => i));
  const collapseAll = () => setOpenMenuIndexes([]);

  const addMenuField = () => {
    const newIdx = menus.length;
    setMenus([
      ...menus,
      {
        title: `منوی شماره ${newIdx + 1}`,
        pricingTiers: [{ guestCapacity: "از ۶۰ نفر تا ۱۲۰ نفر", price: "" }],
        items: [{ title: "", description: "" }],
        description: "",
      },
    ]);
    setOpenMenuIndexes((prev) => [...prev, newIdx]);
  };

  const removeMenuField = (index: number) => {
    setMenus(menus.filter((_, i) => i !== index));
    setOpenMenuIndexes((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    );
  };

  const updateMenuField = (
    index: number,
    field: keyof IMenuForm,
    value: any
  ) => {
    const updated = [...menus];
    updated[index] = { ...updated[index], [field]: value };
    setMenus(updated);
  };

  // --- Tier Helpers ---
  const addPriceTier = (menuIdx: number) => {
    const updated = [...menus];
    updated[menuIdx].pricingTiers.push({ guestCapacity: "", price: "" });
    setMenus(updated);
  };

  const updatePriceTier = (
    menuIdx: number,
    tierIdx: number,
    field: keyof IPriceTier,
    value: string
  ) => {
    const updated = [...menus];
    updated[menuIdx].pricingTiers[tierIdx][field] = value;
    setMenus(updated);
  };

  const removePriceTier = (menuIdx: number, tierIdx: number) => {
    const updated = [...menus];
    updated[menuIdx].pricingTiers = updated[menuIdx].pricingTiers.filter(
      (_, i) => i !== tierIdx
    );
    setMenus(updated);
  };

  // --- Item Helpers ---
  const addMenuItem = (menuIdx: number) => {
    const updated = [...menus];
    updated[menuIdx].items.push({ title: "", description: "" });
    setMenus(updated);

    const newMenuItemIdx = updated[menuIdx].items.length - 1;
    setTimeout(() => {
      itemInputRefs.current[`${menuIdx}-${newMenuItemIdx}-title`]?.focus();
    }, 50);
  };

  const updateMenuItem = (
    menuIdx: number,
    itemIdx: number,
    field: keyof IMenuItem,
    value: string
  ) => {
    const updated = [...menus];
    updated[menuIdx].items[itemIdx][field] = value;
    setMenus(updated);
  };

  const removeMenuItem = (menuIdx: number, itemIdx: number) => {
    const updated = [...menus];
    updated[menuIdx].items = updated[menuIdx].items.filter(
      (_, i) => i !== itemIdx
    );
    setMenus(updated);
  };

  const handleKeyDownItem = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    menuIdx: number,
    itemIdx: number,
    fieldType: "title" | "description"
  ) => {
    if (e.key === "Enter") {
      if (fieldType === "description" && e.shiftKey) {
        return;
      }

      e.preventDefault();

      if (fieldType === "title") {
        if (!menus[menuIdx].items[itemIdx].title.trim()) return;
        itemInputRefs.current[`${menuIdx}-${itemIdx}-description`]?.focus();
      } else {
        if (itemIdx < menus[menuIdx].items.length - 1) {
          itemInputRefs.current[`${menuIdx}-${itemIdx + 1}-title`]?.focus();
        } else {
          addMenuItem(menuIdx);
        }
      }
    }
  };

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) {
      alert("لطفاً ابتدا خطای اسلاگ را برطرف کنید.");
      return;
    }

    setSubmitting(true);

    try {
      const processedMenuIds: string[] = [];

      for (const menu of menus) {
        const isEditMenu = Boolean(menu._id);
        const menuUrl = isEditMenu
          ? `/api/private/menus/edit-menu/${menu._id}`
          : "/api/private/menus/add-menu";
        const menuMethod = isEditMenu ? "PUT" : "POST";

        const cleanItems = menu.items.filter((i) => i.title.trim() !== "");
        const cleanTiers = menu.pricingTiers.filter(
          (t) => t.guestCapacity.trim() !== "" || t.price.trim() !== ""
        );

        const resMenu = await fetch(menuUrl, {
          method: menuMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: menu.title,
            pricingTiers: cleanTiers,
            items: cleanItems,
            description: menu.description,
          }),
        });

        const menuData = await resMenu.json();
        if (menuData.success) {
          processedMenuIds.push(menuData.data._id || menu._id);
        }
      }

      const pkgUrl =
        mode === "create"
          ? "/api/private/packages/add-package"
          : `/api/private/packages/edit-package/${initialData?._id}`;
      const pkgMethod = mode === "create" ? "POST" : "PUT";

      const resPkg = await fetch(pkgUrl, {
        method: pkgMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: packageTitle,
          slug: packageSlug,
          category: packageCategory,
          menus: processedMenuIds,
        }),
      });

      if (resPkg.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await resPkg.json();
        alert(errorData.message || "خطا در ثبت پکیج");
      }
    } catch (err) {
      console.error(err);
      alert("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitPackage} className="space-y-8">
      {/* بخش ۱: اطلاعات کلی پکیج */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
        <h3 className="text-slate-700 text-sm font-bold">
          ۱. مشخصات پکیج اصلی
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              عنوان پکیج (فارسی)
            </label>
            <input
              type="text"
              required
              placeholder="مثلا: پکیج‌های تولد بزرگسال"
              value={packageTitle}
              onChange={(e) => setPackageTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#85004E]"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              نام یکتا در آدرس / Slug (انگلیسی)
            </label>
            <input
              type="text"
              required
              dir="ltr"
              placeholder="e.g. birthday-vip-package"
              value={packageSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onBlur={verifySlugUniqueness}
              className={`w-full border rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 ${
                slugError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:ring-[#85004E]"
              }`}
            />
            {checkingSlug && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                در حال بررسی...
              </span>
            )}
            {slugError && (
              <span className="text-[11px] text-red-500 mt-1 block font-medium">
                {slugError}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              نوع پکیج
            </label>
            <select
              value={packageCategory}
              onChange={(e) => setPackageCategory(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#85004E]"
            >
              <option value="general-menu">پکیج کلی (تولد، عروسی و ...)</option>
              <option value="sub-services-menu">
                منوی تک‌خدماتی (بارتندر، مزه و ...)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* بخش ۲: منوهای زیرمجموعه */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-slate-700 text-sm font-bold">
              ۲. منوهای زیرمجموعه این پکیج
            </h3>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={expandAll}
                className="text-slate-500 hover:text-slate-800 underline"
              >
                باز کردن همه
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-slate-500 hover:text-slate-800 underline"
              >
                بستن همه
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={addMenuField}
            className="px-4 py-2 rounded-xl text-xs text-white shadow-sm"
            style={{ backgroundColor: "#85004E" }}
          >
            + افزودن منوی جدید
          </button>
        </div>

        {menus.map((menu, mIdx) => {
          const isOpen = openMenuIndexes.includes(mIdx);

          return (
            <div
              key={mIdx}
              className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm transition-all"
            >
              {/* Header */}
              <div
                onClick={() => toggleAccordion(mIdx)}
                className="flex justify-between items-center p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer select-none transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                      isOpen
                        ? "bg-[#85004E] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {mIdx + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {menu.title || `منوی شماره ${mIdx + 1}`}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({menu.items.filter((i) => i.title.trim()).length} آیتم)
                  </span>
                </div>

                <div
                  className="flex items-center gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {menus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenuField(mIdx)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      حذف منو
                    </button>
                  )}
                  <span
                    onClick={() => toggleAccordion(mIdx)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2"
                  >
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Body */}
              {isOpen && (
                <div className="p-6 space-y-5 bg-white">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      عنوان منو
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثلا: منوی شماره ۱ (اقتصادی)"
                      value={menu.title}
                      onChange={(e) =>
                        updateMenuField(mIdx, "title", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm"
                    />
                  </div>

                  {/* Dynamic Pricing Tiers */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs text-slate-700 font-bold">
                        سطوح قیمت و ظرفیت مهمان (Pricing Tiers)
                      </label>
                      <button
                        type="button"
                        onClick={() => addPriceTier(mIdx)}
                        className="text-xs text-[#85004E] font-bold hover:underline"
                      >
                        + افزودن پله قیمت
                      </button>
                    </div>

                    {menu.pricingTiers.map((tier, tIdx) => (
                      <div
                        key={tIdx}
                        className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="ظرفیت (مثلا: از ۶۰ نفر تا ۱۲۰ نفر)"
                            value={tier.guestCapacity}
                            onChange={(e) =>
                              updatePriceTier(
                                mIdx,
                                tIdx,
                                "guestCapacity",
                                e.target.value
                              )
                            }
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#85004E]"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="قیمت (مثلا: ۷۵,۰۰۰,۰۰۰ تومان)"
                            value={tier.price}
                            onChange={(e) =>
                              updatePriceTier(
                                mIdx,
                                tIdx,
                                "price",
                                e.target.value
                              )
                            }
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#85004E]"
                          />
                        </div>
                        {menu.pricingTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePriceTier(mIdx, tIdx)}
                            className="text-red-500 hover:text-red-700 text-xs px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      توضیحات منو
                    </label>
                    <textarea
                      placeholder="توضیحات اضافی مربوط به این منو"
                      value={menu.description}
                      onChange={(e) =>
                        updateMenuField(mIdx, "description", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm"
                    />
                  </div>

                  {/* Items list */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs text-slate-600 font-bold">
                        آیتم‌های منو (عنوان و توضیح)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        کلید{" "}
                        <kbd className="px-1 py-0.5 text-[10px] bg-slate-100 border rounded">
                          Enter
                        </kbd>{" "}
                        برای جابجایی سریع
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pl-1 pr-1">
                      {menu.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 relative"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-bold font-mono">
                              آیتم {iIdx + 1}
                            </span>
                            {menu.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMenuItem(mIdx, iIdx)}
                                className="px-2 py-1 text-red-500 hover:text-red-700 text-xs border border-slate-200 rounded-lg hover:bg-red-50 bg-white transition-colors"
                              >
                                ✕ حذف آیتم
                              </button>
                            )}
                          </div>

                          <div>
                            <input
                              ref={(el) => {
                                itemInputRefs.current[
                                  `${mIdx}-${iIdx}-title`
                                ] = el;
                              }}
                              type="text"
                              placeholder="عنوان (مثلاً: کریسپی چیکن)"
                              value={item.title}
                              onKeyDown={(e) =>
                                handleKeyDownItem(e, mIdx, iIdx, "title")
                              }
                              onChange={(e) =>
                                updateMenuItem(
                                  mIdx,
                                  iIdx,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:border-[#85004E] focus:outline-none"
                            />
                          </div>

                          <div>
                            <textarea
                              ref={(el) => {
                                itemInputRefs.current[
                                  `${mIdx}-${iIdx}-description`
                                ] = el;
                              }}
                              rows={2}
                              placeholder="توضیحات اختیاری (مثلاً: همراه با سس مخصوص)"
                              value={item.description || ""}
                              onKeyDown={(e) =>
                                handleKeyDownItem(e, mIdx, iIdx, "description")
                              }
                              onChange={(e) =>
                                updateMenuItem(
                                  mIdx,
                                  iIdx,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:border-[#85004E] focus:outline-none resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addMenuItem(mIdx)}
                      className="mt-3 text-xs text-[#85004E] font-bold hover:underline flex items-center gap-1"
                    >
                      + افزودن آیتم جدید
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={submitting || Boolean(slugError)}
          className="px-8 py-3 rounded-xl text-xs text-white shadow-lg disabled:opacity-50"
          style={{ backgroundColor: "#85004E" }}
        >
          {submitting
            ? "در حال ذخیره..."
            : mode === "create"
            ? "ثبت و انتشار کامل پکیج"
            : "ذخیره تغییرات پکیج"}
        </button>
      </div>
    </form>
  );
}