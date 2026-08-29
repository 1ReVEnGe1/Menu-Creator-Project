import { auth } from "@/auth";
import PackagesPageComp from "@/components/Dashboard/PackagesPage/PackagesPageComp";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

const PackagesPage = () => {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">در حال بارگذاری...</div>}>
      <PackagesContent />
    </Suspense>
  );
};

const PackagesContent = async () => {
  await connection();
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  return <PackagesPageComp userPermissions={session.user.permissions} />;
};

export default PackagesPage;
