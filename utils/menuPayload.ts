export interface NormalizedMenuPayload {
  title: string;
  pricingTiers: Array<{
    guestCapacity: string;
    price: string;
  }>;
  items: Array<{
    title: string;
    description: string;
  }>;
  description: string;
}

export type NormalizeMenuPayloadResult =
  | {
      success: true;
      data: NormalizedMenuPayload;
    }
  | {
      success: false;
      error: string;
    };

export function normalizeMenuPayload(
  payload: unknown
): NormalizeMenuPayloadResult {
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const title =
    typeof body.title === "string"
      ? body.title.trim()
      : "";

  if (!title) {
    return {
      success: false,
      error: "لطفاً عنوان منو را وارد کنید.",
    };
  }

  const pricingTiers = Array.isArray(body.pricingTiers)
    ? body.pricingTiers
        .filter(
          (tier: any) =>
            tier && typeof tier === "object"
        )
        .map((tier: any) => ({
          guestCapacity:
            typeof tier.guestCapacity === "string"
              ? tier.guestCapacity.trim()
              : "",
          price:
            typeof tier.price === "string"
              ? tier.price.trim()
              : "",
        }))
        .filter(
          (tier) =>
            tier.guestCapacity !== "" || tier.price !== ""
        )
    : [];

  if (pricingTiers.length === 0) {
    return {
      success: false,
      error:
        "حداقل یک سطح قیمت برای منو وارد کنید.",
    };
  }

  if (
    pricingTiers.some(
      (tier) => !tier.guestCapacity || !tier.price
    )
  ) {
    return {
      success: false,
      error:
        "ظرفیت و قیمت هر سطح باید هر دو تکمیل شوند.",
    };
  }

  const items = Array.isArray(body.items)
    ? body.items
        .filter(
          (item: any) =>
            item &&
            typeof item === "object" &&
            typeof item.title === "string" &&
            item.title.trim() !== ""
        )
        .map((item: any) => ({
          title: item.title.trim(),
          description:
            typeof item.description === "string"
              ? item.description.trim()
              : "",
        }))
    : [];

  return {
    success: true,
    data: {
      title,
      pricingTiers,
      items,
      description:
        typeof body.description === "string"
          ? body.description.trim()
          : "",
    },
  };
}
