"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

type Profile = {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

const empty: Profile = {
  full_name: "", phone: "", address_line1: "", address_line2: "",
  city: "", state: "", postal_code: "", country: "GB",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabaseBrowser.auth.getUser();
      if (!u) { router.push("/account/login?redirect=/account/profile"); return; }
      setUser(u);

      const { data } = await supabaseBrowser.from("profiles").select("*").eq("id", u.id).single();
      if (data) {
        setProfile({
          full_name:    data.full_name    ?? "",
          phone:        data.phone        ?? "",
          address_line1: data.address_line1 ?? "",
          address_line2: data.address_line2 ?? "",
          city:         data.city         ?? "",
          state:        data.state        ?? "",
          postal_code:  data.postal_code  ?? "",
          country:      data.country      ?? "GB",
        });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabaseBrowser
      .from("profiles")
      .upsert({ id: user!.id, ...profile, updated_at: new Date().toISOString() });

    setSaving(false);
    setMessage(error
      ? { type: "error", text: error.message }
      : { type: "success", text: "Profile saved." }
    );
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) { setMessage({ type: "error", text: "Password must be at least 6 characters." }); return; }
    setPwSaving(true);
    setMessage(null);

    const { error } = await supabaseBrowser.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    setNewPassword("");
    setMessage(error
      ? { type: "error", text: error.message }
      : { type: "success", text: "Password updated." }
    );
  }

  if (loading) {
    return <div className="text-sm text-[#9ca3af] py-16 text-center">Loading…</div>;
  }

  const field = (label: string, key: keyof Profile, type = "text", full = false) => (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs font-medium text-[#374151] mb-1.5">{label}</label>
      <input
        type={type}
        value={profile[key]}
        onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
        className="w-full border border-[#e5e7eb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
      />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Account</p>
        <h1 className="text-[clamp(24px,2.5vw,36px)] text-[#111111]">Profile</h1>
        <p className="text-sm text-[#9ca3af] mt-1">{user?.email}</p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 text-sm border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
          {message.text}
        </div>
      )}

      {/* Personal info */}
      <form onSubmit={handleSave}>
        <h2 className="text-sm font-semibold text-[#111111] mb-4">Personal information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {field("Full name", "full_name", "text", true)}
          {field("Phone", "phone", "tel")}
        </div>

        <h2 className="text-sm font-semibold text-[#111111] mb-4 mt-6">Default shipping address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {field("Address line 1", "address_line1", "text", true)}
          {field("Address line 2 (optional)", "address_line2", "text", true)}
          {field("City", "city")}
          {field("State / County", "state")}
          {field("Postal / ZIP code", "postal_code")}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Country</label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
              placeholder="GB"
              className="w-full border border-[#e5e7eb] px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold px-8 py-3.5 hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>

      {/* Change password */}
      <div className="mt-12 pt-8 border-t border-[#f3f4f6]">
        <h2 className="text-sm font-semibold text-[#111111] mb-4">Change password</h2>
        <form onSubmit={handlePasswordChange} className="flex gap-3 items-end max-w-sm">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#374151] mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full border border-[#e5e7eb] px-3 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="border border-[#111111] text-[#111111] text-[10px] tracking-[0.18em] uppercase font-semibold px-5 py-2.5 hover:bg-[#111111] hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {pwSaving ? "Updating…" : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}
