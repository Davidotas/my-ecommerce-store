"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  // Read localStorage only after mount so the initial SSR render ("USD") always
  // matches the client's first render — preventing a hydration mismatch.
  useEffect(() => {
    const stored = localStorage.getItem("currency") as CurrencyCode;
    if (stored && CURRENCIES[stored]) setCurrencyState(stored);
  }, []);

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
