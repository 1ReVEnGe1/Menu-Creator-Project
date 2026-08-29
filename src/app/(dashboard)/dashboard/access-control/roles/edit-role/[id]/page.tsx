import RoleFormComp from "@/components/Dashboard/RoleForm/RoleFormComp";
import connectDB from "lib/db";
import { Role } from "models/Role";
import { Permission } from "models/Permission";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

interface EditRolePageProps {
  params: Promise<{
    id: string;
  }>;
}

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

const getRoleData = async (id: string) => {
  try {
    await connectDB();
    const role = await Role.findById(id).lean();

    if (!role) return null;

    return {
      _id: role._id.toString(),
      name: role.name,
      description: role.description || "",
      permissions: role.permissions.map((pId: any) => pId.toString()),
      isSystemRole: (role as any).isSystemRole || false,
    };
  } catch (error) {
    console.error("Error fetching role data for edit:", error);
    return null;
  }
};

const EditRolePage = ({ params }: EditRolePageProps) => {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">در حال بارگذاری...</div>}>
      <EditRoleContent params={params} />
    </Suspense>
  );
};

const EditRoleContent = async ({ params }: EditRolePageProps) => {
  await connection();
  const { id: roleId } = await params;

  const [allPermissions, roleData] = await Promise.all([
    getPermissions(),
    getRoleData(roleId),
  ]);

  if (!roleData) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <RoleFormComp
        allPermissions={allPermissions}
        initialData={roleData}
        mode="edit"
      />
    </div>
  );
};

export default EditRolePage;
