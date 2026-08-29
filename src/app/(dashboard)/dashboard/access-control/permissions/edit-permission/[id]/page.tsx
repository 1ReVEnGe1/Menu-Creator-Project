import PermissionFormComp from "@/components/Dashboard/AccessControlPage/PermissionFormComp";
import connectDB from "lib/db";
import { Permission } from "models/Permission";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

interface EditPermissionPageProps {
  params: Promise<{
    id: string;
  }>;
}

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

const EditPermissionPage = ({ params }: EditPermissionPageProps) => {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">در حال بارگذاری...</div>}>
      <EditPermissionContent params={params} />
    </Suspense>
  );
};

const EditPermissionContent = async ({ params }: EditPermissionPageProps) => {
  await connection();
  const { id: permissionId } = await params;
  const permissionData = await getPermissionData(permissionId);

  if (!permissionData) {
    notFound();
  }

  return (
    <div className="mx-auto">
      <PermissionFormComp initialData={permissionData} mode="edit" />
    </div>
  );
};

export default EditPermissionPage;
