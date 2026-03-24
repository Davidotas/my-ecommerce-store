"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ── Marquee ─────────────────────────────────────────────────────────────────

export async function saveMarqueeItems(items: { id?: string; text: string; is_active: boolean; order_index: number }[]) {
  // Delete all and re-insert (simple approach for small lists)
  await supabase.from("marquee_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (items.length > 0) {
    await supabase.from("marquee_items").insert(items.map((item, i) => ({
      text: item.text,
      is_active: item.is_active,
      order_index: i,
    })));
  }
  revalidatePath("/");
}

// ── Page Sections ─────────────────────────────────────────────────────────────

export async function updateSectionVisibility(sectionKey: string, isVisible: boolean) {
  await supabase.from("page_sections").update({ is_visible: isVisible }).eq("section_key", sectionKey);
  revalidatePath("/");
}

export async function updateSectionOrder(sections: { section_key: string; order_index: number }[]) {
  for (const s of sections) {
    await supabase.from("page_sections").update({ order_index: s.order_index }).eq("section_key", s.section_key);
  }
  revalidatePath("/");
}

// ── Navigation Links ─────────────────────────────────────────────────────────

export async function saveNavLinks(links: { id?: string; label: string; href: string; is_active: boolean; order_index: number }[]) {
  await supabase.from("nav_links").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (links.length > 0) {
    await supabase.from("nav_links").insert(links.map((link, i) => ({
      label: link.label,
      href: link.href,
      is_active: link.is_active,
      order_index: i,
    })));
  }
  revalidatePath("/");
}

// ── Footer Config ─────────────────────────────────────────────────────────────

export async function saveFooterConfig(data: {
  copyright_text: string;
  social_instagram: string;
  social_tiktok: string;
  social_pinterest: string;
  info_links: { label: string; href: string }[];
  support_links: { label: string; href: string }[];
}) {
  await supabase.from("footer_config").upsert({
    id: "00000000-0000-0000-0000-000000000002",
    ...data,
    info_links: data.info_links,
    support_links: data.support_links,
    updated_at: new Date().toISOString(),
  });
  revalidatePath("/");
}

// ── Banners ──────────────────────────────────────────────────────────────────

export async function saveBanner(banner: {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  order_index: number;
}) {
  if (banner.id) {
    await supabase.from("banners").update({ ...banner }).eq("id", banner.id);
  } else {
    await supabase.from("banners").insert({ ...banner });
  }
  revalidatePath("/");
}

export async function deleteBanner(id: string) {
  await supabase.from("banners").delete().eq("id", id);
  revalidatePath("/");
}

// ── Hero (reuses store_settings) ─────────────────────────────────────────────

export async function saveHeroSettings(data: { hero_title: string; hero_subtitle: string; hero_image_url: string }) {
  await supabase.from("store_settings").update(data).eq("id", "00000000-0000-0000-0000-000000000001");
  revalidatePath("/");
}
