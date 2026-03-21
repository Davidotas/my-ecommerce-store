"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="pt-12 min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-xs tracking-[0.25em] uppercase text-white/30">Nothing to checkout</p>
        <a href="/" className="text-xs tracking-[0.2em] uppercase text-white border-b border-white/30 pb-px hover:border-white transition-colors">
          Shop now
        </a>
      </div>
    );
  }

  return (
    <div className="pt-12 min-h-screen">
      <div className="px-6 lg:px-10 py-12 border-b border-white/8">
        <p className="text-xs tracking-[0.25em] uppercase text-white/30 mb-2">Checkout</p>
        <h1 className="text-3xl font-light text-white">Order Summary</h1>
      </div>

      <div className="px-6 lg:px-10 py-8 max-w-lg">
        <div className="divide-y divide-white/8">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-4">
              <div>
                <p className="text-sm text-white/80">{item.name}</p>
                <p className="text-xs text-white/30 mt-0.5">Qty {item.quantity}</p>
              </div>
              <span className="text-sm text-white/60">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 flex justify-between items-center py-6 mt-2">
          <span className="text-xs tracking-[0.2em] uppercase text-white/40">Total</span>
          <span className="text-base text-white">{formatPrice(totalPrice)}</span>
        </div>

        {error && (
          <p className="text-xs text-red-400/80 border border-red-400/20 px-4 py-3 mb-6 tracking-wide">{error}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-white text-black text-xs tracking-[0.2em] uppercase font-medium py-4 hover:bg-[#e8e8e8] disabled:opacity-40 transition-colors"
        >
          {loading ? "Redirecting..." : "Pay with Stripe"}
        </button>
      </div>
    </div>
  );
}
