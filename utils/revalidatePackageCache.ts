import { revalidateTag } from "next/cache";

export function revalidatePackageCache(
  ...slugs: Array<string | null | undefined>
) {
  try {
    revalidateTag("public-packages", "max");

    const uniqueSlugs = new Set(
      slugs
        .filter((slug): slug is string => Boolean(slug?.trim()))
        .map((slug) => slug.trim())
    );

    for (const slug of uniqueSlugs) {
      revalidateTag(`public-package-${slug}`, "max");
    }
  } catch (error) {
    // The database mutation has already succeeded. Cache invalidation
    // must not turn a successful mutation into a 500 response that a
    // client could retry and duplicate.
    console.error("Package cache revalidation failed:", error);
  }
}
