"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES, CurrencyCode } from "@/lib/currency";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors">
        <span>{CURRENCIES[currency].flag}</span>
        <span>{currency}</span>
        <svg className="w-3 h-3 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-lg border border-gray-100 w-52 py-2 z-50">
        {(Object.values(CURRENCIES) as typeof CURRENCIES[CurrencyCode][]).map((c) => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
              currency === c.code ? "text-black font-medium" : "text-gray-600"
            }`}
          >
            <span>{c.flag}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
