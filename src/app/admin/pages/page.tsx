import { supabase } from "@/lib/supabase";
import PagesClient from "./PagesClient";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  async function safeQuery<T>(fn: () => PromiseLike<{ data: T | null }>): Promise<T | null> {
    try { return (await fn()).data; } catch { return null; }
  }

  const [marqueeItems, pageSections, navLinks, footerConfig, banners, settings] = await Promise.all([
    safeQuery(() => supabase.from("marquee_items").select("*").order("order_index") as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("page_sections").select("*").order("order_index") as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("nav_links").select("*").order("order_index") as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("footer_config").select("*").maybeSingle() as PromiseLike<{ data: unknown | null }>),
    safeQuery(() => supabase.from("banners").select("*").order("order_index") as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("store_settings").select("*").maybeSingle() as PromiseLike<{ data: unknown | null }>),
  ]);

  return (
    <PagesClient
      marqueeItems={(marqueeItems as { id: string; text: string; is_active: boolean; order_index: number }[]) ?? []}
      pageSections={(pageSections as { id: string; section_key: string; title: string; is_visible: boolean; order_index: number }[]) ?? []}
      navLinks={(navLinks as { id: string; label: string; href: string; is_active: boolean; order_index: number }[]) ?? []}
      footerConfig={footerConfig as {
        copyright_text: string;
        social_instagram: string;
        social_tiktok: string;
        social_pinterest: string;
        info_links: { label: string; href: string }[];
        support_links: { label: string; href: string }[];
      } | null}
      banners={(banners as { id: string; title: string; subtitle: string; image_url: string; link_url: string; is_active: boolean; order_index: number }[]) ?? []}
      heroTitle={(settings as { hero_title?: string } | null)?.hero_title ?? ""}
      heroSubtitle={(settings as { hero_subtitle?: string } | null)?.hero_subtitle ?? ""}
      heroImageUrl={(settings as { hero_image_url?: string } | null)?.hero_image_url ?? ""}
    />
  );
}
