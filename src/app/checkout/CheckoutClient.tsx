"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, CurrencyCode } from "@/lib/currency";

type Profile = {
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
} | null;

type Props = { userId: string; userEmail: string; profile: Profile };

type DeliveryForm = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
};

const STEPS = ["Cart", "Delivery", "Payment", "Review"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                i < current
                  ? "bg-[#111111] text-white"
                  : i === current
                  ? "bg-[#111111] text-white"
                  : "bg-[#f5f5f3] text-[#9ca3af] border border-[#e8e8e5]"
              }`}
            >
              {i < current ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-[9px] mt-1.5 tracking-wider uppercase transition-colors ${
                i === current ? "text-[#111111] font-semibold" : "text-[#9ca3af]"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 sm:w-16 h-px mx-1 mb-5 transition-colors ${
                i < current ? "bg-[#111111]" : "bg-[#e8e8e5]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderSummary({
  items,
  totalPrice,
  currency,
}: {
  items: ReturnType<typeof useCart>["items"];
  totalPrice: number;
  currency: CurrencyCode;
}) {
  return (
    <div className="bg-[#f5f5f3] p-6 sticky top-24">
      <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-5">Order Summary</h3>
      <div className="space-y-3 mb-5">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-start">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover flex-shrink-0 border border-[#e8e8e5]"
              />
            ) : (
              <div className="w-12 h-12 bg-[#e8e8e5] flex-shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#111111] font-medium leading-tight truncate">{item.name}</p>
              {item.customization?.summary && (
                <p className="text-[10px] text-[#9ca3af] mt-0.5 truncate">{item.customization.summary}</p>
              )}
              <p className="text-[10px] text-[#6b7280] mt-0.5">Qty: {item.quantity}</p>
            </div>
            <span className="text-xs text-[#111111] font-medium whitespace-nowrap">
              {formatCurrency(item.price * item.quantity, currency)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#e8e8e5] pt-4 space-y-2">
        <div className="flex justify-between text-xs text-[#6b7280]">
          <span>Subtotal</span>
          <span>{formatCurrency(totalPrice, currency)}</span>
        </div>
        <div className="flex justify-between text-xs text-[#6b7280]">
          <span>Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-[#111111] pt-2 border-t border-[#e8e8e5]">
          <span>Total</span>
          <span>{formatCurrency(totalPrice, currency)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutClient({ userId, userEmail, profile }: Props) {
  const { items, totalPrice, clearCart } = useCart();
  const { currency } = useCurrency();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "klarna">("card");

  const [delivery, setDelivery] = useState<DeliveryForm>({
    fullName: profile?.full_name ?? "",
    email: userEmail,
    phone: profile?.phone ?? "",
    line1: profile?.address_line1 ?? "",
    line2: profile?.address_line2 ?? "",
    city: profile?.city ?? "",
    postcode: profile?.postal_code ?? "",
    country: profile?.country ?? "United Kingdom",
  });

  function updateDelivery(field: keyof DeliveryForm, value: string) {
    setDelivery((prev) => ({ ...prev, [field]: value }));
  }

  const estimatedDelivery = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  })();

  const klarnaAmount = (totalPrice / 300).toFixed(2);

  async function handleConfirmAndPay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
            customization: i.customization,
          })),
          userId,
          userEmail,
          shippingAddress: {
            name: delivery.fullName,
            line1: delivery.line1,
            line2: delivery.line2,
            city: delivery.city,
            postal_code: delivery.postcode,
            country: delivery.country,
            phone: delivery.phone,
          },
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      if (!data.url) {
        setError("No payment URL returned. Please try again.");
        setLoading(false);
        return;
      }
      clearCart();
      window.location.href = data.url;
    } catch {
      setError("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 bg-white pt-[68px]">
        <p className="text-[#6b7280] text-sm">Your cart is empty</p>
        <Link
          href="/"
          className="text-sm text-[#111111] border-b border-[#111111]/30 pb-px hover:border-[#111111] transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mykolo-logo.png" alt="Logo" style={{ height: "38px", width: "auto" }} />
          </Link>
        </div>

        <StepIndicator current={step} />

        <div className="grid lg:grid-cols-[1fr_340px] gap-10">
          {/* Main content */}
          <div>
            <AnimatePresence mode="wait">
              {/* ── STEP 0: Cart Review ── */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-lg font-semibold text-[#111111] mb-6">Your Cart</h2>
                  <div className="divide-y divide-[#f3f4f6]">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 py-5">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover flex-shrink-0 border border-[#e8e8e5]"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-[#f5f5f3] flex-shrink-0 border border-[#e8e8e5] flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111111]">{item.name}</p>
                          {item.customization?.summary && (
                            <p className="text-xs text-[#6b7280] mt-1">{item.customization.summary}</p>
                          )}
                          <p className="text-xs text-[#9ca3af] mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#111111]">
                            {formatCurrency(item.price * item.quantity, currency)}
                          </p>
                          <p className="text-[10px] text-[#9ca3af] mt-1">
                            {formatCurrency(item.price, currency)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile summary */}
                  <div className="lg:hidden mt-5 border border-[#e8e8e5] p-4 bg-[#f5f5f3]">
                    <div className="flex justify-between text-xs text-[#6b7280] mb-2">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-[#111111]">
                      <span>Total</span>
                      <span>{formatCurrency(totalPrice, currency)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="mt-6 w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] transition-colors"
                  >
                    Continue to Delivery
                  </button>
                </motion.div>
              )}

              {/* ── STEP 1: Delivery Address ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-lg font-semibold text-[#111111] mb-6">Delivery Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={delivery.fullName}
                          onChange={(e) => updateDelivery("fullName", e.target.value)}
                          placeholder="Jane Smith"
                          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Email</label>
                        <input
                          type="email"
                          value={delivery.email}
                          onChange={(e) => updateDelivery("email", e.target.value)}
                          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={delivery.phone}
                        onChange={(e) => updateDelivery("phone", e.target.value)}
                        placeholder="+44 7700 000000"
                        className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Address Line 1</label>
                      <input
                        type="text"
                        value={delivery.line1}
                        onChange={(e) => updateDelivery("line1", e.target.value)}
                        placeholder="123 High Street"
                        className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Address Line 2 <span className="text-[#9ca3af]">(optional)</span></label>
                      <input
                        type="text"
                        value={delivery.line2}
                        onChange={(e) => updateDelivery("line2", e.target.value)}
                        placeholder="Flat 2"
                        className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">City</label>
                        <input
                          type="text"
                          value={delivery.city}
                          onChange={(e) => updateDelivery("city", e.target.value)}
                          placeholder="London"
                          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Postcode</label>
                        <input
                          type="text"
                          value={delivery.postcode}
                          onChange={(e) => updateDelivery("postcode", e.target.value)}
                          placeholder="SW1A 1AA"
                          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Country</label>
                      <select
                        value={delivery.country}
                        onChange={(e) => updateDelivery("country", e.target.value)}
                        className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors bg-white"
                      >
                        <option>United Kingdom</option>
                        <option>United States</option>
                        <option>Nigeria</option>
                        <option>Canada</option>
                        <option>Australia</option>
                        <option>Germany</option>
                        <option>France</option>
                        <option>Ireland</option>
                        <option>Netherlands</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(0)}
                      className="px-6 py-4 border border-[#e8e8e5] text-[10px] tracking-[0.22em] uppercase font-semibold text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!delivery.fullName || !delivery.line1 || !delivery.city}
                      className="flex-1 bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-40 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Payment Method ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-lg font-semibold text-[#111111] mb-6">Payment Method</h2>
                  <div className="space-y-3">
                    {/* Card option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`w-full text-left border p-4 transition-colors ${
                        paymentMethod === "card"
                          ? "border-[#111111] bg-white"
                          : "border-[#e8e8e5] hover:border-[#6b7280]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              paymentMethod === "card" ? "border-[#111111]" : "border-[#d1d5db]"
                            }`}
                          >
                            {paymentMethod === "card" && (
                              <div className="w-2 h-2 bg-[#111111] rounded-full m-auto mt-[2px]" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#111111]">Credit / Debit Card</p>
                            <p className="text-xs text-[#9ca3af] mt-0.5">
                              You&apos;ll be redirected to our secure payment page
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Visa */}
                          <svg viewBox="0 0 38 24" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
                            <rect width="38" height="24" rx="4" fill="#1A1F71"/>
                            <text x="19" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">VISA</text>
                          </svg>
                          {/* Mastercard */}
                          <svg viewBox="0 0 38 24" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
                            <rect width="38" height="24" rx="4" fill="#252525"/>
                            <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                            <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
                            <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00"/>
                          </svg>
                          {/* Amex */}
                          <svg viewBox="0 0 38 24" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
                            <rect width="38" height="24" rx="4" fill="#007BC1"/>
                            <text x="19" y="16" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="bold" fontFamily="Arial">AMEX</text>
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* PayPal option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`w-full text-left border p-4 transition-colors ${
                        paymentMethod === "paypal"
                          ? "border-[#111111] bg-white"
                          : "border-[#e8e8e5] hover:border-[#6b7280]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            paymentMethod === "paypal" ? "border-[#111111]" : "border-[#d1d5db]"
                          }`}
                        >
                          {paymentMethod === "paypal" && (
                            <div className="w-2 h-2 bg-[#111111] rounded-full m-auto mt-[2px]" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 101 32" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.237 2.8H5.6C5.116 2.8 4.7 3.16 4.62 3.64L2 19.4c-.06.36.22.68.6.68h3.24c.484 0 .9-.36.98-.84l.64-4.08c.08-.48.5-.84.98-.84h2.18c4.54 0 7.16-2.2 7.84-6.56.32-1.9.02-3.4-.86-4.44-.96-1.14-2.66-1.74-4.94-1.74zm.8 6.46c-.38 2.46-2.26 2.46-4.08 2.46h-1.04l.72-4.6c.04-.3.3-.52.62-.52h.48c1.24 0 2.42 0 3.02.7.36.42.48 1.04.28 1.96z" fill="#009CDE"/>
                            <path d="M35.438 9.2h-3.26c-.32 0-.58.22-.62.52l-.16 1-.24-.36c-.78-1.12-2.5-1.5-4.22-1.5-3.96 0-7.34 3-7.98 7.22-.34 2.1.14 4.1 1.3 5.5 1.08 1.28 2.6 1.82 4.44 1.82 3.2 0 4.96-2.06 4.96-2.06l-.16 1c-.06.36.22.68.6.68h2.94c.484 0 .9-.36.98-.84l1.76-11.12c.06-.38-.22-.7-.58-.7l-.3.04zm-4.56 6.98c-.34 2.02-1.94 3.38-3.98 3.38-1.02 0-1.84-.32-2.36-1-.52-.64-.7-1.56-.54-2.56.32-2 1.94-3.4 3.96-3.4 1 0 1.8.34 2.34 1.02.54.68.74 1.6.58 2.56z" fill="#009CDE"/>
                            <path d="M55.238 9.2h-3.28c-.36 0-.7.18-.9.48l-5.18 7.64-2.2-7.34c-.14-.46-.56-.78-1.04-.78h-3.22c-.42 0-.72.42-.58.82l4.14 12.14-3.9 5.5c-.28.4.02.94.5.94h3.26c.36 0 .68-.18.88-.46l12.54-18.1c.28-.4 0-.94-.5-.94l-.52.1z" fill="#009CDE"/>
                          </svg>
                          <span className="text-sm font-medium text-[#111111]">PayPal</span>
                        </div>
                      </div>
                    </button>

                    {/* Klarna option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("klarna")}
                      className={`w-full text-left border p-4 transition-colors ${
                        paymentMethod === "klarna"
                          ? "border-[#111111] bg-white"
                          : "border-[#e8e8e5] hover:border-[#6b7280]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            paymentMethod === "klarna" ? "border-[#111111]" : "border-[#d1d5db]"
                          }`}
                        >
                          {paymentMethod === "klarna" && (
                            <div className="w-2 h-2 bg-[#111111] rounded-full m-auto mt-[2px]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#111111]">Klarna</span>
                            <span className="bg-[#FFB3C7] text-[10px] font-bold px-1.5 py-0.5 rounded text-[#111111]">K</span>
                          </div>
                          <p className="text-xs text-[#9ca3af] mt-0.5">Pay in 3 interest-free instalments</p>
                          {paymentMethod === "klarna" && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="border border-[#e8e8e5] p-2 text-center">
                                  <p className="text-[10px] text-[#9ca3af]">
                                    {i === 0 ? "Today" : i === 1 ? "30 days" : "60 days"}
                                  </p>
                                  <p className="text-xs font-semibold text-[#111111] mt-0.5">
                                    {formatCurrency(parseFloat(klarnaAmount) * 100, currency)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-4 border border-[#e8e8e5] text-[10px] tracking-[0.22em] uppercase font-semibold text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] transition-colors"
                    >
                      Continue to Review
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Order Review ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-lg font-semibold text-[#111111] mb-6">Review Order</h2>

                  {/* Items */}
                  <div className="border border-[#e8e8e5] mb-4">
                    <div className="px-4 py-3 border-b border-[#f3f4f6] bg-[#f5f5f3]">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280]">Items ({items.length})</p>
                    </div>
                    <div className="divide-y divide-[#f3f4f6]">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3 p-4 items-center">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover flex-shrink-0 border border-[#e8e8e5]"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-[#f5f5f3] flex-shrink-0 border border-[#e8e8e5]" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#111111] truncate">{item.name}</p>
                            <p className="text-xs text-[#9ca3af] mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-[#111111]">
                            {formatCurrency(item.price * item.quantity, currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="border border-[#e8e8e5] mb-4">
                    <div className="px-4 py-3 border-b border-[#f3f4f6] bg-[#f5f5f3] flex items-center justify-between">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280]">Delivery Address</p>
                      <button
                        onClick={() => setStep(1)}
                        className="text-[10px] text-[#111111] underline underline-offset-2"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="px-4 py-4 text-sm text-[#374151] space-y-0.5">
                      <p className="font-medium">{delivery.fullName}</p>
                      <p className="text-[#6b7280]">{delivery.line1}</p>
                      {delivery.line2 && <p className="text-[#6b7280]">{delivery.line2}</p>}
                      <p className="text-[#6b7280]">{delivery.city}{delivery.postcode ? `, ${delivery.postcode}` : ""}</p>
                      <p className="text-[#6b7280]">{delivery.country}</p>
                      {delivery.phone && <p className="text-[#9ca3af] text-xs mt-1">{delivery.phone}</p>}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="border border-[#e8e8e5] mb-4">
                    <div className="px-4 py-3 border-b border-[#f3f4f6] bg-[#f5f5f3] flex items-center justify-between">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280]">Payment Method</p>
                      <button
                        onClick={() => setStep(2)}
                        className="text-[10px] text-[#111111] underline underline-offset-2"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="px-4 py-4 text-sm text-[#374151]">
                      {paymentMethod === "card" && "Credit / Debit Card (Stripe)"}
                      {paymentMethod === "paypal" && "PayPal"}
                      {paymentMethod === "klarna" && "Klarna — Pay in 3"}
                    </div>
                  </div>

                  {/* Total breakdown */}
                  <div className="border border-[#e8e8e5] mb-6">
                    <div className="px-4 py-3 border-b border-[#f3f4f6] bg-[#f5f5f3]">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#6b7280]">Order Total</p>
                    </div>
                    <div className="px-4 py-4 space-y-2">
                      <div className="flex justify-between text-sm text-[#6b7280]">
                        <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                        <span>{formatCurrency(totalPrice, currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#6b7280]">
                        <span>Shipping</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-[#111111] pt-2 border-t border-[#f3f4f6]">
                        <span>Total</span>
                        <span>{formatCurrency(totalPrice, currency)}</span>
                      </div>
                      <p className="text-[10px] text-[#9ca3af] mt-2">
                        Estimated delivery: {estimatedDelivery} (5–7 business days)
                      </p>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 mb-4">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-4 border border-[#e8e8e5] text-[10px] tracking-[0.22em] uppercase font-semibold text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmAndPay}
                      disabled={loading}
                      className="flex-1 bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Redirecting…" : "Confirm and Pay"}
                    </button>
                  </div>

                  <p className="text-[10px] text-[#9ca3af] text-center mt-3">
                    Secure payment powered by Stripe — your card details are never stored
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: sticky order summary (desktop, steps 0-2) */}
          {step < 3 && (
            <div className="hidden lg:block">
              <OrderSummary items={items} totalPrice={totalPrice} currency={currency} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
