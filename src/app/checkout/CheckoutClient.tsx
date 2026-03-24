"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

type Profile = {
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
} | null;

type Props = { userId: string; userEmail: string; profile: Profile };

export default function CheckoutClient({ userId, userEmail, profile }: Props) {
  const { items, totalPrice } = useCart();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          userId,
          userEmail,
          shippingAddress: profile
            ? {
                name:    profile.full_name ?? "",
                line1:   profile.address_line1 ?? "",
                line2:   profile.address_line2 ?? "",
                city:    profile.city ?? "",
                state:   profile.state ?? "",
                postal:  profile.postal_code ?? "",
                country: profile.country ?? "GB",
              }
            : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      window.location.href = data.url;
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 bg-white pt-[68px]">
        <p className="text-[#6b7280] text-sm">Your cart is empty</p>
        <Link href="/" className="text-sm text-[#111111] border-b border-[#111111]/30 pb-px hover:border-[#111111] transition-colors">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center mb-10">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mykolo-logo.png" alt="Logo" style={{ height: "40px", width: "auto" }} />
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Review your order</p>
          <h1 className="text-2xl text-[#111111]">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: shipping & account info */}
          <div>
            <h2 className="text-sm font-semibold text-[#111111] mb-4">Shipping to</h2>
            {profile?.address_line1 ? (
              <div className="border border-[#e8e8e5] p-4 text-sm text-[#6b7280] space-y-1 mb-4">
                <p className="text-[#111111] font-medium">{profile.full_name ?? userEmail}</p>
                <p>{profile.address_line1}{profile.address_line2 ? `, ${profile.address_line2}` : ""}</p>
                <p>{[profile.city, profile.state, profile.postal_code].filter(Boolean).join(", ")}</p>
                <p>{profile.country}</p>
              </div>
            ) : (
              <div className="border border-[#f3f4f6] p-4 text-sm text-[#9ca3af] mb-4">
                No saved address.{" "}
                <Link href="/account/profile" className="text-[#111111] underline underline-offset-2">
                  Add one →
                </Link>
              </div>
            )}

            <p className="text-xs text-[#9ca3af]">
              Signed in as <span className="text-[#111111]">{userEmail}</span>
            </p>
          </div>

          {/* Right: order summary */}
          <div>
            <h2 className="text-sm font-semibold text-[#111111] mb-4">Order summary</h2>
            <div className="divide-y divide-[#f3f4f6] mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-3 text-sm">
                  <span className="text-[#374151]">
                    {item.name} <span className="text-[#9ca3af]">× {item.quantity}</span>
                  </span>
                  <span className="text-[#111111] font-medium">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e8e8e5] pt-4 flex justify-between text-sm font-medium text-[#111111] mb-6">
              <span>Total</span>
              <span>{formatCurrency(totalPrice, currency)}</span>
            </div>

            {error && (
              <p className="text-xs text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 mb-4">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors"
            >
              {loading ? "Redirecting to Stripe…" : "Pay with Stripe"}
            </button>

            <p className="text-xs text-[#9ca3af] text-center mt-3">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
