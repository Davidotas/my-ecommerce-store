export type CurrencyCode = "USD" | "GBP" | "EUR" | "NGN" | "CAD" | "AUD" | "JPY" | "INR";

export type CurrencyInfo = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  rate: number; // relative to USD
};

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$",   label: "USD – US Dollar",         flag: "🇺🇸", rate: 1 },
  GBP: { code: "GBP", symbol: "£",   label: "GBP – British Pound",     flag: "🇬🇧", rate: 0.79 },
  EUR: { code: "EUR", symbol: "€",   label: "EUR – Euro",              flag: "🇪🇺", rate: 0.92 },
  NGN: { code: "NGN", symbol: "₦",   label: "NGN – Nigerian Naira",    flag: "🇳🇬", rate: 1590 },
  CAD: { code: "CAD", symbol: "CA$", label: "CAD – Canadian Dollar",   flag: "🇨🇦", rate: 1.36 },
  AUD: { code: "AUD", symbol: "A$",  label: "AUD – Australian Dollar", flag: "🇦🇺", rate: 1.53 },
  JPY: { code: "JPY", symbol: "¥",   label: "JPY – Japanese Yen",      flag: "🇯🇵", rate: 151 },
  INR: { code: "INR", symbol: "₹",   label: "INR – Indian Rupee",      flag: "🇮🇳", rate: 83 },
};

export function formatCurrency(cents: number, currency: CurrencyCode): string {
  const { rate } = CURRENCIES[currency];
  const value = (cents / 100) * rate;
  if (currency === "JPY") {
    return `¥${Math.round(value).toLocaleString()}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
