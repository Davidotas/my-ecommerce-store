"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
import { StoreSettings } from "@/lib/products";
import { CURRENCIES, CurrencyCode } from "@/lib/currency";
import { updateSettings } from "./actions";

export default function SettingsClient({ settings }: { settings: StoreSettings | null }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    setSuccess(false);
    startTransition(async () => {
      const res = await updateSettings(fd);
      if (res?.error) setError(res.error);
      else setSuccess(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Store identity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Store Identity</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
            <input
              name="store_name"
              defaultValue={settings?.store_name ?? "MYSTORE"}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                {(logoPreview || settings?.logo_url) ? (
                  <Image src={logoPreview || settings!.logo_url} alt="Logo" fill className="object-contain p-2" />
                ) : (
                  <span className="text-xs text-gray-400">No logo</span>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="text-sm text-gray-600 border border-gray-300 rounded px-4 py-2 hover:border-gray-500 transition-colors">
                  {logoPreview ? "Change" : "Upload logo"}
                </span>
                <input
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setLogoPreview(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Recommended: SVG or PNG with transparent background</p>
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Homepage Hero Banner</h2>
        <div className="space-y-5">
          {/* Hero image preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
            <div className="relative w-full aspect-[16/5] bg-gray-100 rounded overflow-hidden mb-3">
              {(heroPreview || settings?.hero_image_url) ? (
                <Image
                  src={heroPreview || settings!.hero_image_url}
                  alt="Hero preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs text-gray-400">No image — default will be used</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="text-sm text-gray-600 border border-gray-300 rounded px-4 py-2 hover:border-gray-500 transition-colors">
                {heroPreview ? "Change banner" : "Upload banner image"}
              </span>
              <input
                name="hero_image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setHeroPreview(URL.createObjectURL(f));
                }}
              />
            </label>
            <p className="text-xs text-gray-400 mt-1.5">Recommended: 1600×900px or wider</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Title</label>
            <input
              name="hero_title"
              defaultValue={settings?.hero_title ?? "New Season Arrivals"}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Subtitle</label>
            <input
              name="hero_subtitle"
              defaultValue={settings?.hero_subtitle ?? ""}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20"
              placeholder="A short tagline shown below the title"
            />
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Store Currency</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Currency</label>
          <select
            name="base_currency"
            defaultValue={settings?.base_currency ?? "USD"}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
          >
            {(Object.values(CURRENCIES) as typeof CURRENCIES[CurrencyCode][]).map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-4 py-3">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded px-4 py-3">
          Settings saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white text-sm font-medium px-6 py-3 hover:bg-gray-900 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
