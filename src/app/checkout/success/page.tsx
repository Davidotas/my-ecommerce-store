"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="pt-12 min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="w-px h-16 bg-white/20 mb-10" />
      <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">Order confirmed</p>
      <h1 className="text-3xl sm:text-4xl font-light text-white mb-4">Thank you</h1>
      <p className="text-sm text-white/30 max-w-xs leading-relaxed mb-12">
        Your order has been placed. A confirmation will be sent to your email shortly.
      </p>
      <Link
        href="/"
        className="text-xs tracking-[0.2em] uppercase text-white border-b border-white/30 pb-px hover:border-white transition-colors"
      >
        Continue shopping
      </Link>
    </div>
  );
}
