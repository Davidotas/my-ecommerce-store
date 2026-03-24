"use client";

const FALLBACK_ITEMS = [
  "FREE SHIPPING ON ORDERS OVER $100",
  "NEW ARRIVALS EVERY WEEK",
  "EXCLUSIVE MEMBER DROPS",
  "FREE RETURNS WITHIN 30 DAYS",
  "SUSTAINABLY MADE",
  "WORLDWIDE DELIVERY",
];

type Props = { items?: string[] };

export default function Marquee({ items }: Props) {
  const displayItems = items && items.length > 0 ? items : FALLBACK_ITEMS;
  const text = displayItems.join("   ·   ");
  const repeated = `${text}   ·   ${text}`;

  return (
    <div className="bg-[#111111] py-3.5 overflow-hidden select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-white text-[11px] tracking-[0.25em] uppercase font-medium pr-8">
          {repeated}
        </span>
        <span className="text-white text-[11px] tracking-[0.25em] uppercase font-medium pr-8" aria-hidden>
          {repeated}
        </span>
      </div>
    </div>
  );
}
