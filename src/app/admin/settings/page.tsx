import { createAdminClient } from "@/lib/supabase";
import { StoreSettings } from "@/lib/products";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { data, error } = await createAdminClient()
    .from("store_settings")
    .select("*")
    .maybeSingle();

  if (error) console.error("store_settings fetch error:", error.message);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your store appearance and configuration</p>
      </div>
      <SettingsClient settings={data as StoreSettings | null} />
    </div>
  );
}
