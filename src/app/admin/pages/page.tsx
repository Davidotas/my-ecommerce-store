import { createAdminClient, supabase } from "@/lib/supabase";
import PagesAdminClient from "./PagesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const admin = createAdminClient();

  async function safeQuery<T>(fn: () => PromiseLike<{ data: T | null }>): Promise<T | null> {
    try { return (await fn()).data; } catch { return null; }
  }

  const [pages, marqueeItems, pageSections, navLinks, footerConfig, banners, settings] = await Promise.all([
    safeQuery(() => admin.from("builder_pages").select("id, title, slug, status, updated_at").order("created_at", { ascending: true }) as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("marquee_items").select("*").order("order_index") as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("page_sections").select("*").order("order_index") as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("nav_links").select("*").order("order_index") as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("footer_config").select("*").maybeSingle() as PromiseLike<{ data: unknown | null }>),
    safeQuery(() => supabase.from("banners").select("*").order("order_index") as PromiseLike<{ data: unknown[] | null }>),
    safeQuery(() => supabase.from("store_settings").select("*").maybeSingle() as PromiseLike<{ data: unknown | null }>),
  ]);

  type S = {
    hero_title?: string; hero_subtitle?: string; hero_image_url?: string;
    hero_button_text?: string; hero_button_link?: string;
    marquee_bg_color?: string; marquee_text_color?: string;
  } | null;
  const s = settings as S;

  type PageRow = { id: string; title: string; slug: string; status: string; updated_at: string };

  return (
    <PagesAdminClient
      pages={(pages as PageRow[]) ?? []}
      marqueeItems={(marqueeItems as { id: string; text: string; is_active: boolean; order_index: number }[]) ?? []}
      pageSections={(pageSections as { id: string; section_key: string; title: string; is_visible: boolean; order_index: number }[]) ?? []}
      navLinks={(navLinks as { id?: string; label: string; href: string; is_active: boolean; order_index: number }[]) ?? []}
      footerConfig={footerConfig as {
        copyright_text: string; social_instagram: string; social_tiktok: string;
        social_pinterest: string; info_links: { label: string; href: string }[];
        support_links: { label: string; href: string }[];
      } | null}
      banners={(banners as { id: string; title: string; subtitle: string; image_url: string; link_url: string; is_active: boolean; order_index: number }[]) ?? []}
      heroTitle={s?.hero_title ?? ""}
      heroSubtitle={s?.hero_subtitle ?? ""}
      heroImageUrl={s?.hero_image_url ?? ""}
      heroButtonText={s?.hero_button_text ?? "Shop Now"}
      heroButtonLink={s?.hero_button_link ?? "/#products"}
      marqueeBgColor={s?.marquee_bg_color ?? "#111111"}
      marqueeTextColor={s?.marquee_text_color ?? "#ffffff"}
    />
  );
}
