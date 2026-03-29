"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, CurrencyCode } from "@/lib/currency";

// Initialise Stripe once at module level
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

// ─── Types ──────────────────────────────────────────────────────────────────

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
  fullName: string; email: string; phone: string;
  line1: string; line2: string; city: string;
  postcode: string; country: string;
};

const STEPS = ["Cart", "Delivery", "Payment"];

const COUNTRY_CODES: Record<string, string> = {
  "United Kingdom": "GB", "United States": "US", "Nigeria": "NG",
  "Canada": "CA", "Australia": "AU", "Germany": "DE",
  "France": "FR", "Ireland": "IE", "Netherlands": "NL",
};

// ─── Stripe Element shared styles ───────────────────────────────────────────

const ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: "14px",
      color: "#111111",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444", iconColor: "#ef4444" },
  },
};

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
              i <= current ? "bg-[#111111] text-white" : "bg-[#f5f5f3] text-[#9ca3af] border border-[#e8e8e5]"
            }`}>
              {i < current ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-[9px] mt-1.5 tracking-wider uppercase transition-colors ${
              i === current ? "text-[#111111] font-semibold" : "text-[#9ca3af]"
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 sm:w-16 h-px mx-1 mb-5 transition-colors ${i < current ? "bg-[#111111]" : "bg-[#e8e8e5]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Order summary sidebar ───────────────────────────────────────────────────

function OrderSummary({
  items, totalPrice, currency,
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
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover flex-shrink-0 border border-[#e8e8e5]" />
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
          <span>Subtotal</span><span>{formatCurrency(totalPrice, currency)}</span>
        </div>
        <div className="flex justify-between text-xs text-[#6b7280]">
          <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-[#111111] pt-2 border-t border-[#e8e8e5]">
          <span>Total</span><span>{formatCurrency(totalPrice, currency)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Embedded payment form (must live inside <Elements>) ────────────────────

function EmbeddedPaymentForm({
  clientSecret, orderId, delivery, totalPrice, currency, clearCart,
  onBack,
}: {
  clientSecret: string;
  orderId: string | null;
  delivery: DeliveryForm;
  totalPrice: number;
  currency: CurrencyCode;
  clearCart: () => void;
  onBack: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();

  const [nameOnCard, setNameOnCard] = useState(delivery.fullName);
  const [paying, setPaying]         = useState(false);
  const [payError, setPayError]     = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setPayError("");

    const cardNumberEl = elements.getElement(CardNumberElement);
    if (!cardNumberEl) {
      setPayError("Card element not ready. Please refresh and try again.");
      setPaying(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberEl,
        billing_details: {
          name: nameOnCard || delivery.fullName,
          email: delivery.email,
          address: {
            line1:       delivery.line1   || undefined,
            line2:       delivery.line2   || undefined,
            city:        delivery.city    || undefined,
            postal_code: delivery.postcode || undefined,
            country:     COUNTRY_CODES[delivery.country] ?? "US",
          },
        },
      },
    });

    if (error) {
      setPayError(error.message ?? "Payment failed. Please check your card details.");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      clearCart();
      const params = new URLSearchParams();
      if (orderId) params.set("order_id", orderId);
      params.set("payment_intent_id", paymentIntent.id);
      window.location.href = `/checkout/success?${params.toString()}`;
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <h2 className="text-lg font-semibold text-[#111111] mb-2">Pay securely</h2>

      {/* Delivery recap */}
      <div className="border border-[#e8e8e5] px-4 py-3 bg-[#f5f5f3] flex items-center justify-between">
        <div className="text-xs text-[#6b7280]">
          <span className="text-[#111111] font-medium">{delivery.fullName}</span>
          {" · "}{delivery.line1}{delivery.city ? `, ${delivery.city}` : ""}
        </div>
        <button type="button" onClick={onBack}
          className="text-[10px] text-[#111111] underline underline-offset-2 shrink-0 ml-3">Edit</button>
      </div>

      {/* Name on card */}
      <div>
        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">
          Name on card
        </label>
        <input
          type="text"
          value={nameOnCard}
          onChange={e => setNameOnCard(e.target.value)}
          placeholder="Jane Smith"
          required
          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
        />
      </div>

      {/* Card number */}
      <div>
        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">
          Card number
        </label>
        <div className="border border-[#e8e8e5] px-3 py-3.5 focus-within:border-[#111111] transition-colors bg-white">
          <CardNumberElement options={{ ...ELEMENT_STYLE, showIcon: true }} />
        </div>
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">
            Expiry date
          </label>
          <div className="border border-[#e8e8e5] px-3 py-3.5 focus-within:border-[#111111] transition-colors bg-white">
            <CardExpiryElement options={ELEMENT_STYLE} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">
            CVC
          </label>
          <div className="border border-[#e8e8e5] px-3 py-3.5 focus-within:border-[#111111] transition-colors bg-white">
            <CardCvcElement options={ELEMENT_STYLE} />
          </div>
        </div>
      </div>

      {/* Mobile order total */}
      <div className="lg:hidden border border-[#e8e8e5] px-4 py-3 bg-[#f5f5f3] flex justify-between text-sm">
        <span className="text-[#6b7280]">Order total</span>
        <span className="font-semibold text-[#111111]">{formatCurrency(totalPrice, currency)}</span>
      </div>

      {/* Error */}
      {payError && (
        <div className="flex items-start gap-2 text-xs text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {payError}
        </div>
      )}

      {/* Pay button */}
      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full bg-[#111111] text-white text-[11px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {paying ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Processing…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay {formatCurrency(totalPrice, currency)}
          </>
        )}
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <svg className="w-4 h-4 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-[10px] text-[#9ca3af]">
          Secured by Stripe · Your card details are never stored on our servers
        </p>
      </div>
    </form>
  );
}

// ─── Main checkout component ─────────────────────────────────────────────────

export default function CheckoutClient({ userId, userEmail, profile }: Props) {
  const { items, totalPrice, clearCart } = useCart();
  const { currency } = useCurrency();

  const [step, setStep]           = useState(0);
  const [error, setError]         = useState("");

  // Stripe PaymentIntent state
  const [clientSecret, setClientSecret]   = useState<string | null>(null);
  const [payOrderId,   setPayOrderId]     = useState<string | null>(null);
  const [fetchingIntent, setFetchingIntent] = useState(false);

  const [delivery, setDelivery] = useState<DeliveryForm>({
    fullName: profile?.full_name    ?? "",
    email:    userEmail,
    phone:    profile?.phone        ?? "",
    line1:    profile?.address_line1 ?? "",
    line2:    profile?.address_line2 ?? "",
    city:     profile?.city         ?? "",
    postcode: profile?.postal_code  ?? "",
    country:  profile?.country      ?? "United Kingdom",
  });

  function updateDelivery(field: keyof DeliveryForm, value: string) {
    setDelivery(prev => ({ ...prev, [field]: value }));
  }

  async function goToPayment() {
    setFetchingIntent(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({
            id: i.id, name: i.name, price: i.price,
            image: i.image, quantity: i.quantity, customization: i.customization,
          })),
          userId, userEmail,
          shippingAddress: {
            name: delivery.fullName, line1: delivery.line1, line2: delivery.line2,
            city: delivery.city, postal_code: delivery.postcode,
            country: delivery.country, phone: delivery.phone,
          },
          paymentMethod: "card",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        setError(data.error || "Failed to initialise payment. Please try again.");
        setFetchingIntent(false);
        return;
      }
      setClientSecret(data.clientSecret);
      setPayOrderId(data.orderId ?? null);
      setStep(2);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setFetchingIntent(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 bg-white pt-[68px]">
        <p className="text-[#6b7280] text-sm">Your cart is empty</p>
        <Link href="/" className="text-sm text-[#111111] border-b border-[#111111]/30 pb-px hover:border-[#111111] transition-colors">
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
          {/* Main column */}
          <div>
            <AnimatePresence mode="wait">

              {/* ── STEP 0: Cart review ── */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-lg font-semibold text-[#111111] mb-6">Your Cart</h2>
                  <div className="divide-y divide-[#f3f4f6]">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4 py-5">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover flex-shrink-0 border border-[#e8e8e5]" />
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
                          <p className="text-sm font-semibold text-[#111111]">{formatCurrency(item.price * item.quantity, currency)}</p>
                          <p className="text-[10px] text-[#9ca3af] mt-1">{formatCurrency(item.price, currency)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile summary */}
                  <div className="lg:hidden mt-5 border border-[#e8e8e5] p-4 bg-[#f5f5f3]">
                    <div className="flex justify-between text-xs text-[#6b7280] mb-2">
                      <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-[#111111]">
                      <span>Total</span><span>{formatCurrency(totalPrice, currency)}</span>
                    </div>
                  </div>

                  <button onClick={() => setStep(1)}
                    className="mt-6 w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] transition-colors">
                    Continue to Delivery
                  </button>
                </motion.div>
              )}

              {/* ── STEP 1: Delivery address ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-lg font-semibold text-[#111111] mb-6">Delivery Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Full Name</label>
                        <input type="text" value={delivery.fullName} onChange={e => updateDelivery("fullName", e.target.value)} placeholder="Jane Smith"
                          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Email</label>
                        <input type="email" value={delivery.email} onChange={e => updateDelivery("email", e.target.value)}
                          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Phone</label>
                      <input type="tel" value={delivery.phone} onChange={e => updateDelivery("phone", e.target.value)} placeholder="+44 7700 000000"
                        className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Address Line 1</label>
                      <input type="text" value={delivery.line1} onChange={e => updateDelivery("line1", e.target.value)} placeholder="123 High Street"
                        className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Address Line 2 <span className="text-[#9ca3af]">(optional)</span></label>
                      <input type="text" value={delivery.line2} onChange={e => updateDelivery("line2", e.target.value)} placeholder="Flat 2"
                        className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">City</label>
                        <input type="text" value={delivery.city} onChange={e => updateDelivery("city", e.target.value)} placeholder="London"
                          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Postcode</label>
                        <input type="text" value={delivery.postcode} onChange={e => updateDelivery("postcode", e.target.value)} placeholder="SW1A 1AA"
                          className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">Country</label>
                      <select value={delivery.country} onChange={e => updateDelivery("country", e.target.value)}
                        className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors bg-white">
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

                  {error && (
                    <p className="text-xs text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 mt-4">{error}</p>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(0)}
                      className="px-6 py-4 border border-[#e8e8e5] text-[10px] tracking-[0.22em] uppercase font-semibold text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-colors">
                      Back
                    </button>
                    <button
                      onClick={goToPayment}
                      disabled={!delivery.fullName || !delivery.line1 || !delivery.city || fetchingIntent}
                      className="flex-1 bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                    >
                      {fetchingIntent ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                          </svg>
                          Setting up payment…
                        </>
                      ) : "Continue to Payment"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Embedded payment form ── */}
              {step === 2 && clientSecret && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <EmbeddedPaymentForm
                      clientSecret={clientSecret}
                      orderId={payOrderId}
                      delivery={delivery}
                      totalPrice={totalPrice}
                      currency={currency}
                      clearCart={clearCart}
                      onBack={() => { setStep(1); setClientSecret(null); }}
                    />
                  </Elements>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right: sticky order summary */}
          <div className="hidden lg:block">
            <OrderSummary items={items} totalPrice={totalPrice} currency={currency} />
          </div>
        </div>
      </div>
    </div>
  );
}
