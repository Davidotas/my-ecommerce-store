"use client";

const FALLBACK_ITEMS = [
  "FREE SHIPPING ON ORDERS OVER $100",
  "NEW ARRIVALS EVERY WEEK",
  "EXCLUSIVE MEMBER DROPS",
  "FREE RETURNS WITHIN 30 DAYS",
  "SUSTAINABLY MADE",
  "WORLDWIDE DELIVERY",
];

type Props = {
  items?: string[];
  bgColor?: string;
  textColor?: string;
};

export default function Marquee({ items, bgColor = "#111111", textColor = "#ffffff" }: Props) {
  const displayItems = items && items.length > 0 ? items : FALLBACK_ITEMS;
  const text = displayItems.join("   ·   ");
  const repeated = `${text}   ·   ${text}`;

  return (
    <div className="py-3.5 overflow-hidden select-none" style={{ backgroundColor: bgColor }}>
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-[11px] tracking-[0.25em] uppercase font-medium pr-8" style={{ color: textColor }}>
          {repeated}
        </span>
        <span className="text-[11px] tracking-[0.25em] uppercase font-medium pr-8" style={{ color: textColor }} aria-hidden>
          {repeated}
        </span>
      </div>
    </div>
  );
}
