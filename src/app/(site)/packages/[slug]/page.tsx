import PackageDetailsClientComp from "@/components/Site/PackageDetailsClient/PackageDetailsClientComp";

import { notFound } from "next/navigation";
import { getPublicPackages } from "utils/publicPackages";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PackagePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const packages = await getPublicPackages();

  const activePackage = packages.find(
    (pkg) => pkg.slug === slug
  );

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