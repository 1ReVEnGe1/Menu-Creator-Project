import RoleFormComp from "@/components/Dashboard/RoleForm/RoleFormComp";
import connectDB from "lib/db";
import { Permission } from "models/Permission";
import { Suspense } from "react";
import { connection } from "next/server";

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

const NewRolePage = () => {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">در حال بارگذاری...</div>}>
      <NewRoleContent />
    </Suspense>
  );
};

const NewRoleContent = async () => {
  await connection();
  const allPermissions = await getPermissions();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <RoleFormComp allPermissions={allPermissions} mode="create" />
    </div>
  );
};

export default NewRolePage;
