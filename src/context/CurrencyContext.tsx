"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";

// EU member state country codes → EUR
const EU_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU",
  "IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
]);

// Country code → currency code mapping
const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD", GB: "GBP", NG: "NGN", CA: "CAD",
  AU: "AUD", NZ: "AUD", JP: "JPY", IN: "INR",
  SG: "USD", AE: "USD", ZA: "USD", KE: "USD",
  GH: "USD", BR: "USD", MX: "USD",
};

async function detectCurrency(): Promise<CurrencyCode> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return "USD";
    const { country_code } = await res.json();
    if (!country_code) return "USD";
    if (EU_COUNTRIES.has(country_code)) return "EUR";
    return COUNTRY_CURRENCY[country_code] ?? "USD";
  } catch {
    return "USD";
  }
}

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  detectedCurrency: CurrencyCode | null;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  detectedCurrency: null,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [detectedCurrency, setDetectedCurrency] = useState<CurrencyCode | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currency") as CurrencyCode | null;

    if (stored && CURRENCIES[stored]) {
      // User has an explicit saved preference — use it, skip detection
      setCurrencyState(stored);
      return;
    }

    // No stored preference — detect from IP
    detectCurrency().then((detected) => {
      setDetectedCurrency(detected);
      // Only apply if user still hasn't set a preference
      if (!localStorage.getItem("currency")) {
        setCurrencyState(detected);
        // Do NOT save to localStorage here — we want to re-detect next visit
        // unless the user makes an explicit choice
      }
    });
  }, []);

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c);
    localStorage.setItem("currency", c); // explicit user choice → persist
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, detectedCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
