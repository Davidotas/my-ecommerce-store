export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  compareAtPrice: number | null; // cents
  image: string;
  images: string[];
  category: string;
  categoryId: string | null;
  stock: number;
};

export type DbProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  images: string[] | null;
  category: string;
  category_id: string | null;
  stock: number;
  created_at: string;
  categories?: { id: string; name: string; slug: string } | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at: string;
};

export type StoreSettings = {
  id: string;
  store_name: string;
  logo_url: string;
  hero_image_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
  hero_button_link: string;
  marquee_bg_color: string;
  marquee_text_color: string;
  base_currency: string;
};

export function fromDb(p: DbProduct): Product {
  const imgs =
    p.images && p.images.length > 0
      ? p.images
      : p.image_url
      ? [p.image_url]
      : [];
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    price: p.price,
    compareAtPrice: p.compare_at_price ?? null,
    image: imgs[0] ?? "",
    images: imgs,
    category: p.categories?.name ?? p.category ?? "",
    categoryId: p.category_id ?? null,
    stock: p.stock ?? 0,
  };
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
