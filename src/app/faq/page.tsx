"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

const FAQS = [
  {
    category: "Orders",
    items: [
      { q: "How do I track my order?", a: "Once your order ships, you'll receive an email with your tracking number. You can use it to track your package on our carrier's website." },
      { q: "Can I change or cancel my order?", a: "Orders can be modified or cancelled within 1 hour of placement. Please contact us immediately at hello@mystore.com if you need to make changes." },
      { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and PayPal." },
    ],
  },
  {
    category: "Shipping",
    items: [
      { q: "How long does delivery take?", a: "Standard delivery takes 5–7 business days. Express delivery (2–3 business days) is available at checkout for an additional fee." },
      { q: "Do you ship internationally?", a: "Yes! We ship to over 80 countries worldwide. International orders typically take 10–14 business days." },
      { q: "Is shipping free?", a: "Free standard shipping on all orders over $100. Orders under $100 have a flat $8 shipping fee." },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      { q: "What is your return policy?", a: "We offer free returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with tags attached." },
      { q: "How do I start a return?", a: "Visit our returns portal at mystore.com/returns, enter your order number and email, and follow the instructions. We'll email you a prepaid label." },
      { q: "How long does a refund take?", a: "Once we receive your return, refunds are processed within 3–5 business days. Bank processing may take an additional 2–3 days." },
    ],
  },
  {
    category: "Products",
    items: [
      { q: "How do I find my size?", a: "Each product page has a detailed size guide. We recommend measuring your chest, waist, and hips and comparing to our size chart." },
      { q: "Are your products sustainable?", a: "Yes. All our manufacturers are certified by GOTS (Global Organic Textile Standard). We use organic and recycled materials wherever possible." },
      { q: "Do you restock sold-out items?", a: "Most items are restocked within 4–6 weeks. Sign up to our newsletter or use the 'Notify Me' button on any sold-out product page." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#f3f4f6]">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="text-sm font-medium text-[#111111]">{q}</span>
        <span className={`shrink-0 w-5 h-5 flex items-center justify-center border border-[#e5e7eb] rounded-full transition-transform duration-200 ${open ? "rotate-45" : ""}`}>
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48 pb-5" : "max-h-0"}`}>
        <p className="text-sm text-[#6b7280] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">Help center</p>
        <h1 className="text-4xl sm:text-5xl text-[#111111] mb-4 leading-tight">Frequently Asked Questions</h1>
        <p className="text-[#6b7280] text-sm mb-16 leading-relaxed">
          Can&apos;t find your answer here?{" "}
          <Link href="/contact" className="text-[#111111] underline underline-offset-2 hover:text-[#6b7280] transition-colors">
            Contact us
          </Link>{" "}
          and we&apos;ll be happy to help.
        </p>

        <div className="space-y-12">
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="text-[10px] tracking-[0.4em] uppercase font-medium text-[#9ca3af] mb-1 border-t border-[#f3f4f6] pt-6">{section.category}</h2>
              <div>
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#f9fafb] border border-[#e5e7eb] p-8 text-center">
          <h3 className="text-lg text-[#111111] mb-2">Still have questions?</h3>
          <p className="text-[#6b7280] text-sm mb-5">Our team is here to help you.</p>
          <Link href="/contact" className="inline-block bg-[#111111] text-white text-xs tracking-[0.2em] uppercase font-medium px-8 py-3.5 hover:bg-[#333333] transition-colors">
            Get in touch
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
