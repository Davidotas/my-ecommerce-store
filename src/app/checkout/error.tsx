"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Checkout error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pt-[68px]">
      <div className="max-w-md w-full text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#9ca3af] mb-3">Checkout Error</p>
        <h1 className="text-2xl font-semibold text-[#111111] mb-3">Checkout unavailable</h1>
        <p className="text-sm text-[#6b7280] mb-8">
          {error.message?.includes("STRIPE")
            ? "Payment processing is not available right now. Please try again later or contact support."
            : error.message || "Something went wrong during checkout. Your cart has been saved."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#111111] text-white text-[11px] tracking-[0.2em] uppercase font-semibold px-8 py-3 hover:bg-[#333333] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/cart"
            className="border border-[#e8e8e5] text-[#111111] text-[11px] tracking-[0.2em] uppercase font-semibold px-8 py-3 hover:border-[#111111] transition-colors"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
