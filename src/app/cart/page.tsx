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

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-[#9ca3af] text-sm">Loading…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 bg-white pt-[68px]">
        <p className="text-[#6b7280] text-sm">Your cart is empty</p>
        <Link
          href="/"
          className="text-sm text-[#111111] border-b border-[#111111]/30 pb-px hover:border-[#111111] transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <div className="flex justify-center mb-10">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mykolo-logo.png" alt="Mykolo" style={{ height: "40px", width: "auto" }} />
        </Link>
      </div>
      <h1 className="text-2xl text-[#111111] mb-8">
        Shopping Bag ({items.length})
      </h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 divide-y divide-[#f3f4f6]">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 py-6">
              <div className="relative w-24 h-28 shrink-0 bg-[#f3f4f6] overflow-hidden">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4 mb-1">
                  <h3 className="text-sm font-medium text-[#111111]">{item.name}</h3>
                  <span className="text-sm font-medium shrink-0 text-[#111111]">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af] mb-4">
                  {formatCurrency(item.price, currency)} each
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-[#e5e7eb] w-fit">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#6b7280] hover:text-[#111111] hover:bg-[#f9fafb] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm text-[#111111]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#6b7280] hover:text-[#111111] hover:bg-[#f9fafb] transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-[#9ca3af] hover:text-[#ef4444] transition-colors"
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
          <div className="border border-[#e5e7eb] p-6">
            <h2 className="text-xs tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-6">
              Order Summary
            </h2>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-[#6b7280]">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice, currency)}</span>
              </div>
              <div className="flex justify-between text-[#6b7280]">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-[#f3f4f6] pt-3 flex justify-between text-[#111111] font-medium">
                <span>Total</span>
                <span>{formatCurrency(totalPrice, currency)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-[#111111] text-white text-sm font-medium text-center py-3.5 hover:bg-[#333333] transition-colors mb-3"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/"
              className="block w-full text-center text-sm text-[#6b7280] hover:text-[#111111] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
