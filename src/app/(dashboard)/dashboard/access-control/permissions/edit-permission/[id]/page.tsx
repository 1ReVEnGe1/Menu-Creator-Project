import PermissionFormComp from "@/components/Dashboard/AccessControlPage/PermissionFormComp";
import connectDB from "lib/db";
import { Permission } from "models/Permission";
import { notFound } from "next/navigation";

// تایپ مربوط به پارامترهای آدرس در نکست‌جی‌اس
interface EditPermissionPageProps {
  params: {
    id: string;
  };
}

// واکشی اطلاعات پرمیشن از دیتابیس بر اساس آیدی
const getPermissionData = async (id: string) => {
  try {
    await connectDB();
    const perm = await Permission.findById(id).lean();
    
    
    if (!perm) return null;

    return {
      _id: perm._id.toString(),
      name: perm.name,
      description: perm.description || "",
      module: perm.module,
    };
  } catch (error) {
    console.error("Error fetching permission for edit:", error);
    return null;
  }
};

const EditPermissionPage = async ({ params }: EditPermissionPageProps) => {
  const permissionId = (await params).id
  const permissionData = await getPermissionData(permissionId);

  // اگر پرمیشنی با این آیدی پیدا نشد، ارور ۴۰۴ نکست‌جی‌اس را نشان بده
  if (!permissionData) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* استفاده مجدد از کامپوننت فرم در حالت edit */}
      <PermissionFormComp 
        initialData={permissionData} 
        mode="edit" 
      />
    </div>
  );
};

export default EditPermissionPage;