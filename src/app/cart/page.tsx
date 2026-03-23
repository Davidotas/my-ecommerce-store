"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { currency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render nothing until client has hydrated — prevents SSR/client mismatch
  // on cart items (which live only in client state, never on the server).
  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-[#9c9381] text-sm">Loading…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
        <p className="text-[#9c9381] text-sm">Your cart is empty</p>
        <Link
          href="/"
          className="text-sm text-white border-b border-white/30 pb-px hover:border-white transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <div className="flex justify-center mb-10">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mykolo-logo.png" alt="Mykolo" style={{ height: "40px", width: "auto" }} />
        </Link>
      </div>
      <h1 className="text-2xl text-white mb-8">
        Shopping Bag ({items.length})
      </h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 divide-y divide-[rgba(255,255,255,0.1)]">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 py-6">
              <div className="relative w-24 h-28 shrink-0 bg-[#0d1117] overflow-hidden">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4 mb-1">
                  <h3 className="text-sm font-medium text-white">{item.name}</h3>
                  <span className="text-sm font-medium shrink-0 text-white">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </span>
                </div>
                <p className="text-xs text-[#9c9381] mb-4">
                  {formatCurrency(item.price, currency)} each
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-[rgba(255,255,255,0.2)] w-fit">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#9c9381] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#9c9381] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-[#9c9381] hover:text-[#f01919] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-[rgba(255,255,255,0.2)] p-6">
            <h2 className="text-xs tracking-[0.5px] uppercase font-medium text-[#9c9381] mb-6">
              Order Summary
            </h2>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-[#9c9381]">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice, currency)}</span>
              </div>
              <div className="flex justify-between text-[#9c9381]">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-[rgba(255,255,255,0.2)] pt-3 flex justify-between text-white">
                <span>Total</span>
                <span>{formatCurrency(totalPrice, currency)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-[#d2ff1f] text-[#030607] text-sm font-medium text-center py-3.5 hover:opacity-90 transition-opacity mb-3"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/"
              className="block w-full text-center text-sm text-[#9c9381] hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
