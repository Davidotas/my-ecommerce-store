"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

async function uploadSettingsImage(file: File, path: string): Promise<string> {
  const supabase = createAdminClient();
  const ext = file.name.split(".").pop();
  const filename = `${path}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filename, bytes, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from("product-images").getPublicUrl(filename).data.publicUrl;
}

export async function updateSettings(formData: FormData) {
  const store_name = (formData.get("store_name") as string)?.trim();
  const hero_title = (formData.get("hero_title") as string)?.trim();
  const hero_subtitle = (formData.get("hero_subtitle") as string)?.trim();
  const base_currency = formData.get("base_currency") as string;
  const logoFile = formData.get("logo");
  const heroFile = formData.get("hero_image");

  const updates: Record<string, string> = {
    store_name: store_name ?? "",
    hero_title: hero_title ?? "",
    hero_subtitle: hero_subtitle ?? "",
    base_currency: base_currency ?? "USD",
    updated_at: new Date().toISOString(),
  };

  if (logoFile instanceof File && logoFile.size > 0) {
    try { updates.logo_url = await uploadSettingsImage(logoFile, "logo"); }
    catch (e: unknown) { return { error: (e as Error).message }; }
  }

  if (heroFile instanceof File && heroFile.size > 0) {
    try { updates.hero_image_url = await uploadSettingsImage(heroFile, "hero"); }
    catch (e: unknown) { return { error: (e as Error).message }; }
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("store_settings")
    .upsert({ id: SETTINGS_ID, ...updates });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}
