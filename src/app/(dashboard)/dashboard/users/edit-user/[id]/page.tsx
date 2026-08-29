import UserFormComp from "@/components/Dashboard/UserForm/UserFormComp";
import connectDB from "lib/db";
import { Role } from "models/Role";
import User from "models/User";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getRoles = async () => {
  await connectDB();
  const roles = await Role.find().lean();

  return roles.map((r: any) => ({
    _id: r._id.toString(),
    name: r.name,
    description: r.description || "",
  }));
};

const getUserData = async (id: string) => {
  try {
    await connectDB();
    const user = await User.findById(id).lean();

    if (!user) return null;

    return {
      _id: user._id.toString(),
      fullname: user.fullname || "",
      phone: user.phone || "",
      email: user.email || "",
      role: user.role ? user.role.toString() : "",
      isActive: user.isActive ?? true,
    };
  } catch (error) {
    console.error("Error fetching user data for edit:", error);
    return null;
  }
};

const EditUserPage = ({ params }: EditUserPageProps) => {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">در حال بارگذاری...</div>}>
      <EditUserContent params={params} />
    </Suspense>
  );
};

const EditUserContent = async ({ params }: EditUserPageProps) => {
  await connection();
  const { id: userId } = await params;

  const [allRoles, userData] = await Promise.all([
    getRoles(),
    getUserData(userId),
  ]);

  if (!userData) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <UserFormComp
        allRoles={allRoles}
        initialData={userData}
        mode="edit"
      />
    </div>
  );
};

export default EditUserPage;
