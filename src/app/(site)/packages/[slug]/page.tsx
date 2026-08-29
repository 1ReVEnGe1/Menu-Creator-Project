import PackageDetailsClientComp from "@/components/Site/PackageDetailsClient/PackageDetailsClientComp";



import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPackageNavigation, getPublicPackageBySlug } from "utils/publicPackages";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PackagePage({
  params,
}: PageProps) {
  return (
    <Suspense fallback={<PackagePageLoading />}>
      <PackagePageContent params={params} />
    </Suspense>
  );
}

async function PackagePageContent({
  params,
}: PageProps) {
  // Runtime data باید داخل Suspense خوانده شود
  const { slug } = await params;

  const [packages, activePackage] =
    await Promise.all([
      getPackageNavigation(),
      getPublicPackageBySlug(slug),
    ]);

  if (!activePackage) {
    notFound();
  }

  return (
    <PackageDetailsClientComp
      packages={packages}
      activePackage={activePackage}
    />
  );
}

function PackagePageLoading() {
  return (
    <main className="min-h-screen bg-[#030204]">
      {/* Navigation Skeleton */}
      <section className="py-3 sticky top-0 border-b border-white/10 bg-[#030204]">
        <div className="flex gap-2.5 px-5">
          <div className="w-28 h-9 rounded-2xl bg-white/10 animate-pulse" />
          <div className="w-32 h-9 rounded-2xl bg-white/10 animate-pulse" />
          <div className="w-24 h-9 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="p-5">
        <div className="flex justify-between items-center mb-5">
          <div className="w-40 h-5 rounded bg-white/10 animate-pulse" />
          <div className="w-20 h-3 rounded bg-white/10 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="h-44 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
          <div className="h-44 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
          <div className="h-44 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
        </div>
      </section>
    </main>
  );
}