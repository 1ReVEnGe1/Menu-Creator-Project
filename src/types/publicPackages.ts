export interface IMenuItem {
  title: string;
  description?: string;
}

export interface IPriceTier {
  guestCapacity: string;
  price: string;
}

export interface IMenuData {
  _id: string;
  title: string;
  items: IMenuItem[];
  pricingTiers: IPriceTier[];
  subtitle?: string;
  badge?: string;
  description?: string;
}

export interface IPackageData {
  _id: string;
  title: string;
  category: "sub-services-menu" | "general-menu";
  slug: string;
  menus: IMenuData[];
}