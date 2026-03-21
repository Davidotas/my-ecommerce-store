"use client";

const ITEMS = [
  "FREE SHIPPING ON ORDERS OVER $100",
  "NEW ARRIVALS EVERY WEEK",
  "EXCLUSIVE MEMBER DROPS",
  "FREE RETURNS WITHIN 30 DAYS",
  "SUSTAINABLY MADE",
  "WORLDWIDE DELIVERY",
];

const text = ITEMS.join("   ·   ");
const repeated = `${text}   ·   ${text}`;

export default function Marquee() {
  return (
    <div className="bg-[#d2ff1f] py-3 overflow-hidden select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-[#030607] text-xs tracking-[0.2em] uppercase font-medium pr-8">
          {repeated}
        </span>
        <span className="text-[#030607] text-xs tracking-[0.2em] uppercase font-medium pr-8" aria-hidden>
          {repeated}
        </span>
      </div>
    </div>
  );
}
