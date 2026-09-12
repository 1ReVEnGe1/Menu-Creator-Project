"use client";

import { useRef, useState } from "react";

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
  onSuccess: () => void | Promise<void>;
  onClose: () => void;
}

export default function PackageFormComp({
  initialData,
  onSuccess,
  onClose,
}: PackageFormCompProps) {
  const [submitting, setSubmitting] = useState(false);
  const [packageId, setPackageId] = useState<string | undefined>(
    initialData?._id
  );
  const [savingMenuIndex, setSavingMenuIndex] = useState<number | null>(null);
  const [removingMenuIndex, setRemovingMenuIndex] = useState<number | null>(null);
  const [dirtyMenuIndexes, setDirtyMenuIndexes] = useState<Set<number>>(
    () =>
      new Set(
        initialData?.menus && initialData.menus.length > 0 ? [] : [0]
      )
  );

  const isBusy =
    submitting || savingMenuIndex !== null || removingMenuIndex !== null;

  // =========================================================
  // PACKAGE STATES
  // =========================================================

  const [packageTitle, setPackageTitle] = useState(
    initialData?.title || ""
  );

  const [packageSlug, setPackageSlug] = useState(
    initialData?.slug || ""
  );

  const [slugError, setSlugError] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const [packageCategory, setPackageCategory] = useState<
    "general-menu" | "sub-services-menu"
  >(initialData?.category || "general-menu");

  // =========================================================
  // ACCORDION
  // =========================================================

  const [openMenuIndexes, setOpenMenuIndexes] = useState<number[]>([
    0,
  ]);

  // =========================================================
  // MENUS
  // =========================================================

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
              : [
                  {
                    guestCapacity: "از ۶۰ نفر تا ۱۲۰ نفر",
                    price: "",
                  },
                ],

          items:
            m.items && m.items.length > 0
              ? m.items.map((i) => ({
                  title: i.title || "",
                  description: i.description || "",
                }))
              : [
                  {
                    title: "",
                    description: "",
                  },
                ],

          description: m.description || "",
        }))
      : [
          {
            title: "منوی شماره ۱ (اقتصادی)",

            pricingTiers: [
              {
                guestCapacity: "از ۶۰ نفر تا ۱۲۰ نفر",
                price: "",
              },
            ],

            items: [
              {
                title: "",
                description: "",
              },
            ],

            description: "",
          },
        ]
  );

  // =========================================================
  // INPUT REFS
  // =========================================================

  const itemInputRefs = useRef<{
    [key: string]:
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
  }>({});

  // =========================================================
  // SLUG
  // =========================================================

  const handleSlugChange = (val: string) => {
    const formatted = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    setPackageSlug(formatted);
    setSlugError(null);
  };

  const checkSlugUniqueness =
    async (): Promise<boolean> => {
      const cleanSlug = packageSlug.trim();

      if (!cleanSlug) {
        setSlugError(
          "وارد کردن اسلاگ انگلیسی الزامی است."
        );
        return false;
      }

      setCheckingSlug(true);

      try {
        const res = await fetch(
          `/api/private/packages/check-slug?slug=${encodeURIComponent(
            cleanSlug
          )}&currentId=${encodeURIComponent(
            packageId || ""
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setSlugError(
            data?.message ||
              data?.error ||
              "امکان بررسی اسلاگ وجود ندارد."
          );

          return false;
        }

        if (!data?.isUnique) {
          setSlugError(
            "این اسلاگ قبلاً استفاده شده است. لطفاً اسلاگ دیگری وارد کنید."
          );

          return false;
        }

        setSlugError(null);

        return true;
      } catch (err) {
        console.error(
          "Error checking package slug:",
          err
        );

        setSlugError(
          "ارتباط با سرور برای بررسی اسلاگ برقرار نشد."
        );

        return false;
      } finally {
        setCheckingSlug(false);
      }
    };

  const verifySlugUniqueness = async () => {
    await checkSlugUniqueness();
  };

  // =========================================================
  // ACCORDION HELPERS
  // =========================================================

  const toggleAccordion = (index: number) => {
    setOpenMenuIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const expandAll = () => {
    setOpenMenuIndexes(menus.map((_, i) => i));
  };

  const collapseAll = () => {
    setOpenMenuIndexes([]);
  };

  // =========================================================
  // MENU HELPERS
  // =========================================================

  const markMenuDirty = (index: number) => {
    setDirtyMenuIndexes((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const clearMenuDirty = (index: number) => {
    setDirtyMenuIndexes((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const removeMenuFromLocalState = (index: number) => {
    setMenus((prev) => prev.filter((_, i) => i !== index));

    setOpenMenuIndexes((prev) =>
      prev
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i))
    );

    setDirtyMenuIndexes((prev) => {
      const next = new Set<number>();

      prev.forEach((dirtyIndex) => {
        if (dirtyIndex < index) {
          next.add(dirtyIndex);
        } else if (dirtyIndex > index) {
          next.add(dirtyIndex - 1);
        }
      });

      return next;
    });
  };

  const addMenuField = () => {
    const newIdx = menus.length;

    setMenus((prev) => [
      ...prev,
      {
        title: `منوی شماره ${newIdx + 1}`,
        pricingTiers: [
          {
            guestCapacity: "از ۶۰ نفر تا ۱۲۰ نفر",
            price: "",
          },
        ],
        items: [
          {
            title: "",
            description: "",
          },
        ],
        description: "",
      },
    ]);

    markMenuDirty(newIdx);
    setOpenMenuIndexes((prev) => [...prev, newIdx]);
  };

  const removeMenuField = async (index: number) => {
    if (menus.length <= 1) {
      alert("پکیج باید حداقل یک منو داشته باشد.");
      return;
    }

    const menu = menus[index];
    const confirmDeleteMenu = confirm(
      menu._id
        ? "این منو فقط از این پکیج جدا می‌شود و خود منو حذف نخواهد شد. ادامه می‌دهید؟"
        : "این منوی ذخیره‌نشده از فرم حذف شود؟"
    );

    if (!confirmDeleteMenu) {
      return;
    }

    if (!menu._id) {
      removeMenuFromLocalState(index);
      return;
    }

    if (!packageId) {
      alert("شناسه پکیج موجود نیست.");
      return;
    }

    setRemovingMenuIndex(index);

    try {
      const res = await fetch(
        `/api/private/packages/${packageId}/menus/${menu._id}`,
        { method: "DELETE" }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || data?.error || "حذف منو از پکیج ناموفق بود."
        );
      }

      removeMenuFromLocalState(index);
      await onSuccess();
    } catch (error: any) {
      console.error("Remove menu from package failed:", error);
      alert(error?.message || "خطا در حذف منو از پکیج");
    } finally {
      setRemovingMenuIndex(null);
    }
  };

  const updateMenuField = (
    index: number,
    field: keyof IMenuForm,
    value: any
  ) => {
    setMenus((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });

    markMenuDirty(index);
  };

  // =========================================================
  // PRICE TIERS
  // =========================================================

  const addPriceTier = (menuIdx: number) => {
    setMenus((prev) => {
      const updated = [...prev];

      updated[menuIdx] = {
        ...updated[menuIdx],

        pricingTiers: [
          ...updated[menuIdx].pricingTiers,

          {
            guestCapacity: "",
            price: "",
          },
        ],
      };

      return updated;
    });

    markMenuDirty(menuIdx);
  };

  const updatePriceTier = (
    menuIdx: number,
    tierIdx: number,
    field: keyof IPriceTier,
    value: string
  ) => {
    setMenus((prev) => {
      const updated = [...prev];

      const tiers = [
        ...updated[menuIdx].pricingTiers,
      ];

      tiers[tierIdx] = {
        ...tiers[tierIdx],
        [field]: value,
      };

      updated[menuIdx] = {
        ...updated[menuIdx],
        pricingTiers: tiers,
      };

      return updated;
    });

    markMenuDirty(menuIdx);
  };

  const removePriceTier = (
    menuIdx: number,
    tierIdx: number
  ) => {
    setMenus((prev) => {
      const updated = [...prev];

      updated[menuIdx] = {
        ...updated[menuIdx],

        pricingTiers:
          updated[
            menuIdx
          ].pricingTiers.filter(
            (_, i) => i !== tierIdx
          ),
      };

      return updated;
    });

    markMenuDirty(menuIdx);
  };

  // =========================================================
  // MENU ITEMS
  // =========================================================

  const addMenuItem = (
    menuIdx: number,
    shouldFocus = true
  ) => {
    setMenus((prev) => {
      const updated = [...prev];

      updated[menuIdx] = {
        ...updated[menuIdx],

        items: [
          ...updated[menuIdx].items,

          {
            title: "",
            description: "",
          },
        ],
      };

      return updated;
    });

    markMenuDirty(menuIdx);

    if (shouldFocus) {
      const newMenuItemIdx =
        menus[menuIdx].items.length;

      setTimeout(() => {
        itemInputRefs.current[
          `${menuIdx}-${newMenuItemIdx}-title`
        ]?.focus();
      }, 50);
    }
  };

  const updateMenuItem = (
    menuIdx: number,
    itemIdx: number,
    field: keyof IMenuItem,
    value: string
  ) => {
    setMenus((prev) => {
      const updated = [...prev];

      const items = [
        ...updated[menuIdx].items,
      ];

      items[itemIdx] = {
        ...items[itemIdx],
        [field]: value,
      };

      updated[menuIdx] = {
        ...updated[menuIdx],
        items,
      };

      return updated;
    });

    markMenuDirty(menuIdx);
  };

  const removeMenuItem = (
    menuIdx: number,
    itemIdx: number
  ) => {
    setMenus((prev) => {
      const updated = [...prev];

      updated[menuIdx] = {
        ...updated[menuIdx],

        items: updated[menuIdx].items.filter(
          (_, i) => i !== itemIdx
        ),
      };

      return updated;
    });

    markMenuDirty(menuIdx);
  };

  // =========================================================
  // KEYBOARD NAVIGATION
  // =========================================================

  const handleKeyDownItem = (
    e: React.KeyboardEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
    menuIdx: number,
    itemIdx: number,
    fieldType: "title" | "description"
  ) => {
    if (e.key !== "Enter") {
      return;
    }

    if (fieldType === "title") {
      e.preventDefault();

      const title =
        menus[menuIdx].items[itemIdx]
          .title;

      if (!title.trim()) {
        return;
      }

      itemInputRefs.current[
        `${menuIdx}-${itemIdx}-description`
      ]?.focus();

      return;
    }

    if (!e.shiftKey) {
      return;
    }

    e.preventDefault();

    const nextItemIdx = itemIdx + 1;

    if (
      nextItemIdx <
      menus[menuIdx].items.length
    ) {
      setTimeout(() => {
        itemInputRefs.current[
          `${menuIdx}-${nextItemIdx}-title`
        ]?.focus();
      }, 0);

      return;
    }

    setMenus((prev) => {
      const updated = [...prev];

      updated[menuIdx] = {
        ...updated[menuIdx],

        items: [
          ...updated[menuIdx].items,

          {
            title: "",
            description: "",
          },
        ],
      };

      return updated;
    });

    markMenuDirty(menuIdx);

    setTimeout(() => {
      itemInputRefs.current[
        `${menuIdx}-${nextItemIdx}-title`
      ]?.focus();
    }, 50);
  };

  // =========================================================
  // FORM VALIDATION / PAYLOADS
  // =========================================================

  const validatePackageFields = () => {
    if (!packageTitle.trim()) {
      throw new Error("عنوان پکیج را وارد کنید.");
    }

    if (!packageSlug.trim()) {
      throw new Error("اسلاگ پکیج را وارد کنید.");
    }
  };

  const validateMenuBeforeSave = (index: number) => {
    const menu = menus[index];

    if (!menu) {
      throw new Error("منوی مورد نظر در فرم پیدا نشد.");
    }

    if (!menu.title.trim()) {
      throw new Error(`عنوان منوی شماره ${index + 1} را وارد کنید.`);
    }

    const validTiers = menu.pricingTiers.filter(
      (tier) => tier.guestCapacity.trim() || tier.price.trim()
    );

    if (validTiers.length === 0) {
      throw new Error(
        `برای «${menu.title}» حداقل یک سطح قیمت وارد کنید.`
      );
    }

    const hasIncompleteTier = validTiers.some(
      (tier) => !tier.guestCapacity.trim() || !tier.price.trim()
    );

    if (hasIncompleteTier) {
      throw new Error(
        `در «${menu.title}» ظرفیت و قیمت هر سطح باید هر دو تکمیل شوند.`
      );
    }
  };

  const buildMenuPayload = (menu: IMenuForm) => ({
    title: menu.title.trim(),
    pricingTiers: menu.pricingTiers
      .filter(
        (tier) =>
          tier.guestCapacity.trim() !== "" || tier.price.trim() !== ""
      )
      .map((tier) => ({
        guestCapacity: tier.guestCapacity.trim(),
        price: tier.price.trim(),
      })),
    items: menu.items
      .filter((item) => item.title.trim() !== "")
      .map((item) => ({
        title: item.title.trim(),
        description: item.description?.trim() || "",
      })),
    description: menu.description.trim(),
  });

  // =========================================================
  // SINGLE-MENU SAVE
  // =========================================================

  const handleSaveMenu = async (index: number) => {
    if (isBusy) {
      return;
    }

    try {
      validateMenuBeforeSave(index);

      if (!packageId) {
        validatePackageFields();

        const isSlugValid = await checkSlugUniqueness();
        if (!isSlugValid) {
          return;
        }
      }
    } catch (error: any) {
      alert(error?.message || "اطلاعات منو کامل نیست.");
      return;
    }

    const menu = menus[index];
    const menuPayload = buildMenuPayload(menu);

    setSavingMenuIndex(index);

    try {
      /*
        Create mode: اولین Menu همراه خود Package ساخته می‌شود.
        بنابراین نه Package خالی داریم، نه Menu orphan.
      */
      if (!packageId) {
        const res = await fetch("/api/private/packages/add-package", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: packageTitle.trim(),
            slug: packageSlug.trim(),
            category: packageCategory,
            menu: menuPayload,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          throw new Error(
            data?.message || data?.error || "ساخت پکیج و منو ناموفق بود."
          );
        }

        const createdPackageId = data?.data?._id;
        const createdMenuId = data?.data?.menus?.[0]?._id;

        if (!createdPackageId || !createdMenuId) {
          throw new Error("شناسه پکیج یا منوی ساخته‌شده از سرور دریافت نشد.");
        }

        setPackageId(String(createdPackageId));
        setMenus((prev) =>
          prev.map((currentMenu, menuIndex) =>
            menuIndex === index
              ? { ...currentMenu, _id: String(createdMenuId) }
              : currentMenu
          )
        );
        clearMenuDirty(index);
        await onSuccess();
        alert("پکیج و اولین منو با موفقیت ذخیره شدند.");
        return;
      }

      const isExistingMenu = Boolean(menu._id);
      const url = isExistingMenu
        ? `/api/private/packages/${packageId}/menus/${menu._id}`
        : `/api/private/packages/${packageId}/menus`;

      const res = await fetch(url, {
        method: isExistingMenu ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuPayload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || data?.error || `ذخیره «${menu.title}» ناموفق بود.`
        );
      }

      const savedMenuId = data?.data?._id || menu._id;

      if (!savedMenuId) {
        throw new Error(`شناسه «${menu.title}» از سرور دریافت نشد.`);
      }

      setMenus((prev) =>
        prev.map((currentMenu, menuIndex) =>
          menuIndex === index
            ? { ...currentMenu, _id: String(savedMenuId) }
            : currentMenu
        )
      );

      clearMenuDirty(index);
      await onSuccess();
      alert(`«${menu.title}» با موفقیت ذخیره شد.`);
    } catch (error: any) {
      console.error("Single menu save failed:", error);
      alert(error?.message || "خطایی در ذخیره منو رخ داد.");
    } finally {
      setSavingMenuIndex(null);
    }
  };

  // =========================================================
  // PACKAGE METADATA SAVE
  // =========================================================

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBusy) {
      return;
    }

    if (!packageId) {
      alert(
        "برای ایجاد پکیج، ابتدا یکی از منوها را با دکمه «ذخیره این منو» ثبت کنید."
      );
      return;
    }

    try {
      validatePackageFields();
    } catch (error: any) {
      alert(error?.message || "اطلاعات پکیج کامل نیست.");
      return;
    }

    const isSlugValid = await checkSlugUniqueness();
    if (!isSlugValid) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/private/packages/edit-package/${packageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: packageTitle.trim(),
            slug: packageSlug.trim(),
            category: packageCategory,
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || data?.error || "خطا در ذخیره مشخصات پکیج"
        );
      }

      await onSuccess();

      if (dirtyMenuIndexes.size > 0) {
        alert(
          "مشخصات پکیج ذخیره شد؛ اما بعضی منوها تغییرات ذخیره‌نشده دارند. هر منو را جداگانه ذخیره کنید."
        );
        return;
      }

      onClose();
    } catch (error: any) {
      console.error("Package metadata save failed:", error);
      alert(error?.message || "خطایی در ذخیره مشخصات پکیج رخ داد.");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <form
      onSubmit={handleSubmitPackage}
      className="space-y-6 sm:space-y-8 text-right"
      dir="rtl"
    >
      {/*
        در زمان Save کل ورودی‌های فرم را Disable می‌کنیم
        تا وسط عملیات، state تغییر نکند.
      */}
      <fieldset
        disabled={isBusy}
        className="space-y-6 sm:space-y-8 border-0 p-0 m-0 min-w-0 disabled:opacity-80"
      >
        {/* =====================================================
            PACKAGE INFORMATION
        ====================================================== */}

        <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 space-y-4">
          <h3 className="text-slate-700 text-sm font-bold">
            ۱. مشخصات پکیج اصلی
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Package title */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                عنوان پکیج (فارسی)
              </label>

              <input
                type="text"
                required
                placeholder="مثلا: پکیج‌های تولد بزرگسال"
                value={packageTitle}
                onChange={(e) =>
                  setPackageTitle(
                    e.target.value
                  )
                }
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#85004E]"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                نام یکتا در آدرس / Slug
                (انگلیسی)
              </label>

              <input
                type="text"
                required
                dir="ltr"
                placeholder="e.g. birthday-vip-package"
                value={packageSlug}
                onChange={(e) =>
                  handleSlugChange(
                    e.target.value
                  )
                }
                onBlur={
                  verifySlugUniqueness
                }
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

            {/* Category */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                نوع پکیج
              </label>

              <select
                value={packageCategory}
                onChange={(e) =>
                  setPackageCategory(
                    e.target.value as
                      | "general-menu"
                      | "sub-services-menu"
                  )
                }
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#85004E]"
              >
                <option value="general-menu">
                  پکیج کلی (تولد، عروسی و
                  ...)
                </option>

                <option value="sub-services-menu">
                  منوی تک‌خدماتی (بارتندر،
                  مزه و ...)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* =====================================================
            MENUS
        ====================================================== */}

        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] sm:text-xs text-amber-800 leading-6">
            هر منو مستقل ذخیره می‌شود. ویرایش یا ثبت یک منو، هیچ منوی دیگری را ارسال یا بازنویسی نمی‌کند. حذف، فقط ارتباط منو با همین پکیج را قطع می‌کند. اگر یک منو بین چند پکیج مشترک باشد، ویرایش محتوای آن در همه پکیج‌های استفاده‌کننده دیده می‌شود.
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-slate-700 text-sm font-bold">
                ۲. منوهای زیرمجموعه این
                پکیج
              </h3>

              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={expandAll}
                  className="text-slate-500 hover:text-slate-800 underline"
                >
                  باز کردن همه
                </button>

                <span className="text-slate-300">
                  |
                </span>

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
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs text-white shadow-sm font-bold shrink-0"
              style={{
                backgroundColor:
                  "#85004E",
              }}
            >
              + افزودن منوی جدید
            </button>
          </div>

          {/* =====================================================
              MENU ACCORDIONS
          ====================================================== */}

          {menus.map(
            (menu, mIdx) => {
              const isOpen =
                openMenuIndexes.includes(
                  mIdx
                );

              return (
                <div
                  key={
                    menu._id ||
                    `new-menu-${mIdx}`
                  }
                  className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm transition-all"
                >
                  {/* Header */}

                  <div
                    onClick={() =>
                      toggleAccordion(
                        mIdx
                      )
                    }
                    className="flex justify-between items-center p-3.5 sm:p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer select-none transition-colors border-b border-slate-100 gap-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 truncate">
                      <span
                        className={`text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                          isOpen
                            ? "bg-[#85004E] text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {mIdx + 1}
                      </span>

                      <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {menu.title ||
                          `منوی شماره ${
                            mIdx + 1
                          }`}
                      </span>

                      <span className="text-[11px] sm:text-xs text-slate-400 shrink-0">
                        (
                        {
                          menu.items.filter(
                            (i) =>
                              i.title.trim()
                          ).length
                        }{" "}
                        آیتم)
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                          dirtyMenuIndexes.has(mIdx)
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {dirtyMenuIndexes.has(mIdx)
                          ? "ذخیره‌نشده"
                          : "ذخیره‌شده"}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 sm:gap-4 shrink-0"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      {menus.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeMenuField(
                              mIdx
                            )
                          }
                          className="text-red-500 text-xs hover:underline"
                        >
                          {removingMenuIndex === mIdx
                            ? "در حال حذف..."
                            : "حذف از پکیج"}
                        </button>
                      )}

                      <span
                        onClick={() =>
                          toggleAccordion(
                            mIdx
                          )
                        }
                        className="text-slate-400 hover:text-slate-600 text-xs sm:text-sm font-bold px-1"
                      >
                        {isOpen
                          ? "▲"
                          : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* =====================================================
                      MENU BODY
                  ====================================================== */}

                  {isOpen && (
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white">
                      {/* Menu title */}

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          عنوان منو
                        </label>

                        <input
                          type="text"
                          required
                          placeholder="مثلا: منوی شماره ۱ (اقتصادی)"
                          value={
                            menu.title
                          }
                          onChange={(e) =>
                            updateMenuField(
                              mIdx,
                              "title",
                              e.target.value
                            )
                          }
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-sm"
                        />
                      </div>

                      {/* =====================================================
                          PRICING TIERS
                      ====================================================== */}

                      <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/60 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs text-slate-700 font-bold">
                            سطوح قیمت و
                            ظرفیت مهمان
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              addPriceTier(
                                mIdx
                              )
                            }
                            className="text-xs text-[#85004E] font-bold hover:underline"
                          >
                            + افزودن پله
                            قیمت
                          </button>
                        </div>

                        {menu.pricingTiers.map(
                          (
                            tier,
                            tIdx
                          ) => (
                            <div
                              key={
                                tIdx
                              }
                              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white p-2.5 rounded-lg border border-slate-200 relative"
                            >
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="ظرفیت (مثلا: از ۶۰ نفر تا ۱۲۰ نفر)"
                                  value={
                                    tier.guestCapacity
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updatePriceTier(
                                      mIdx,
                                      tIdx,
                                      "guestCapacity",
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#85004E]"
                                />
                              </div>

                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  required
                                  placeholder="قیمت (مثلا: ۷۵,۰۰۰,۰۰۰ تومان)"
                                  value={
                                    tier.price
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updatePriceTier(
                                      mIdx,
                                      tIdx,
                                      "price",
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#85004E]"
                                />

                                {menu
                                  .pricingTiers
                                  .length >
                                  1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removePriceTier(
                                        mIdx,
                                        tIdx
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-100 sm:border-0 hover:bg-red-50 sm:hover:bg-transparent"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Menu description */}

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          توضیحات منو
                        </label>

                        <textarea
                          placeholder="توضیحات اضافی مربوط به این منو"
                          value={
                            menu.description
                          }
                          onChange={(e) =>
                            updateMenuField(
                              mIdx,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-sm"
                        />
                      </div>

                      {/* =====================================================
                          ITEMS
                      ====================================================== */}

                      <div className="pt-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-2">
                          <label className="block text-xs text-slate-600 font-bold">
                            آیتم‌های منو
                            (عنوان و توضیح)
                          </label>

                          <span className="text-[10px] sm:text-[11px] text-slate-400">
                            <kbd className="px-1 py-0.5 text-[9px] sm:text-[10px] bg-slate-100 border rounded">
                              Enter
                            </kbd>{" "}
                            خط جدید
                            {"  |  "}
                            <kbd className="px-1 py-0.5 text-[9px] sm:text-[10px] bg-slate-100 border rounded">
                              Shift +
                              Enter
                            </kbd>{" "}
                            آیتم بعدی
                          </span>
                        </div>

                        <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pl-1 pr-1">
                          {menu.items.map(
                            (
                              item,
                              iIdx
                            ) => (
                              <div
                                key={
                                  iIdx
                                }
                                className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-2 relative"
                              >
                                {/* Item header */}

                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500 font-bold">
                                    آیتم{" "}
                                    {iIdx +
                                      1}
                                  </span>

                                  {menu
                                    .items
                                    .length >
                                    1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeMenuItem(
                                          mIdx,
                                          iIdx
                                        )
                                      }
                                      className="px-2 py-1 text-red-500 hover:text-red-700 text-xs border border-slate-200 rounded-lg hover:bg-red-50 bg-white transition-colors"
                                    >
                                      ✕ حذف
                                      آیتم
                                    </button>
                                  )}
                                </div>

                                {/* Title */}

                                <div>
                                  <input
                                    ref={(
                                      el
                                    ) => {
                                      itemInputRefs.current[
                                        `${mIdx}-${iIdx}-title`
                                      ] =
                                        el;
                                    }}
                                    type="text"
                                    placeholder="عنوان (مثلاً: کریسپی چیکن)"
                                    value={
                                      item.title
                                    }
                                    onKeyDown={(
                                      e
                                    ) =>
                                      handleKeyDownItem(
                                        e,
                                        mIdx,
                                        iIdx,
                                        "title"
                                      )
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateMenuItem(
                                        mIdx,
                                        iIdx,
                                        "title",
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:border-[#85004E] focus:outline-none"
                                  />
                                </div>

                                {/* Description */}

                                <div>
                                  <textarea
                                    ref={(
                                      el
                                    ) => {
                                      itemInputRefs.current[
                                        `${mIdx}-${iIdx}-description`
                                      ] =
                                        el;
                                    }}
                                    rows={
                                      2
                                    }
                                    placeholder="توضیحات اختیاری (مثلاً: همراه با سس مخصوص)"
                                    value={
                                      item.description ||
                                      ""
                                    }
                                    onKeyDown={(
                                      e
                                    ) =>
                                      handleKeyDownItem(
                                        e,
                                        mIdx,
                                        iIdx,
                                        "description"
                                      )
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateMenuItem(
                                        mIdx,
                                        iIdx,
                                        "description",
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:border-[#85004E] focus:outline-none resize-y"
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addMenuItem(
                              mIdx
                            )
                          }
                          className="mt-3 text-xs text-[#85004E] font-bold hover:underline flex items-center gap-1"
                        >
                          + افزودن آیتم
                          جدید
                        </button>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-400 leading-5">
                          {menu._id
                            ? "این دکمه فقط همین منو را بروزرسانی می‌کند."
                            : packageId
                            ? "این دکمه فقط همین منوی جدید را به پکیج اضافه می‌کند."
                            : "اولین ذخیره، پکیج و همین یک منو را با هم ایجاد می‌کند."}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleSaveMenu(mIdx)}
                          disabled={
                            isBusy ||
                            !dirtyMenuIndexes.has(mIdx) ||
                            (!packageId && mIdx !== 0)
                          }
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs text-white font-bold shadow-sm disabled:opacity-45 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "#85004E" }}
                        >
                          {savingMenuIndex === mIdx
                            ? "در حال ذخیره این منو..."
                            : !dirtyMenuIndexes.has(mIdx)
                            ? "این منو ذخیره شده"
                            : !packageId && mIdx !== 0
                            ? "ابتدا منوی اول را ذخیره کنید"
                            : menu._id
                            ? "ذخیره تغییرات این منو"
                            : packageId
                            ? "ثبت این منو"
                            : "ایجاد پکیج و ثبت این منو"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </fieldset>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
        <button
          type="button"
          disabled={isBusy}
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          انصراف
        </button>

        <button
          type="submit"
          disabled={
            isBusy ||
            checkingSlug ||
            Boolean(slugError) ||
            !packageId
          }
          className="w-full sm:w-auto px-8 py-2.5 sm:py-3 rounded-xl text-xs text-white shadow-lg disabled:opacity-50 font-bold"
          style={{
            backgroundColor: "#85004E",
          }}
        >
          {submitting
            ? "در حال ذخیره مشخصات..."
            : checkingSlug
            ? "در حال بررسی..."
            : !packageId
            ? "ابتدا یک منو را ذخیره کنید"
            : "ذخیره مشخصات پکیج"}
        </button>
      </div>
    </form>
  );
}