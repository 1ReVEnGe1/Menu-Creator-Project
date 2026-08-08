
import RoleFormComp from "@/components/Dashboard/RoleForm/RoleFormComp";
import connectDB from "lib/db";
import { Permission } from "models/Permission";

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

const NewRolePage = async () => {
  const allPermissions = await getPermissions();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <RoleFormComp 
        allPermissions={allPermissions} 
        mode="create" 
      />
    </div>
  );
};

export default NewRolePage;