import RoleFormComp from "@/components/Dashboard/RoleForm/RoleFormComp";
import connectDB from "lib/db";
import { Role } from "models/Role"; // مدل رول دیتابیس شما
import { Permission } from "models/Permission";
import { notFound } from "next/navigation";

interface EditRolePageProps {
  params: {
    id: string;
  };
}

// ۱. دریافت تمام پرمیشن‌های موجود در سیستم برای ماتریکس چک‌باکس‌ها
const getPermissions = async () => {
  await connectDB();
  const permissions = await Permission.find().lean();
  
  return permissions.map((p: any) => ({
    _id: p._id.toString(),
    name: p.name,
    description: p.description || "",
    module: p.module,
  }));
};

// ۲. دریافت اطلاعات نقشی که قصد ویرایش آن را داریم
const getRoleData = async (id: string) => {
  try {
    await connectDB();
    const role = await Role.findById(id).lean();

    if (!role) return null;

    return {
      _id: role._id.toString(),
      name: role.name,
      description: role.description || "",
      // تبدیل آبجکت‌آیدی‌های پرمیشن به رشته متنی برای هماهنگی با فرانت‌اند
      permissions: role.permissions.map((pId: any) => pId.toString()),
      isSystemRole: (role as any).isSystemRole || false, // جلوگیری از تغییر نام نقش‌های حیاتی
    };
  } catch (error) {
    console.error("Error fetching role data for edit:", error);
    return null;
  }
};

const EditRolePage = async ({ params }: EditRolePageProps) => {
  const roleId = (await params).id

  // اجرای موازی درخواست‌ها برای سرعت بیشتر صفحه
  const [allPermissions, roleData] = await Promise.all([
    getPermissions(),
    getRoleData(roleId),
  ]);

  // اگر نقشی با این آیدی وجود نداشت، صفحه ۴۰۴ پیش‌فرض نکست‌جی‌اس را برگردان
  if (!roleData) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* پاس دادن دیتا به کامپوننت ریوتیبل شما در حالت edit */}
      <RoleFormComp 
        allPermissions={allPermissions} 
        initialData={roleData} 
        mode="edit" 
      />
    </div>
  );
};

export default EditRolePage;