"use client";

import { useState } from "react";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">

          {/* Left: Info */}
          <div>
            <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">Get in touch</p>
            <h1 className="text-4xl sm:text-5xl text-[#111111] mb-6 leading-tight">
              We&apos;d love to hear from you.
            </h1>
            <p className="text-[#6b7280] text-sm leading-relaxed mb-12">
              Have a question about your order, a product, or just want to say hi? We&apos;re here and we respond within 24 hours.
            </p>

            <div className="space-y-8">
              {[
                { label: "Email", value: "hello@mykolomy sibi.com", icon: "✉️" },
                { label: "Phone", value: "+234 (0) 800 000 0000", icon: "📞" },
                { label: "Hours", value: "Mon–Fri, 9am–6pm WAT", icon: "🕐" },
                { label: "Response time", value: "Within 24 hours", icon: "⚡" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#9ca3af] mb-0.5">{item.label}</p>
                    <p className="text-sm text-[#111111]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center mb-6 text-2xl text-white">✓</div>
                <h2 className="text-2xl text-[#111111] mb-2">Message sent!</h2>
                <p className="text-[#6b7280] text-sm">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase font-medium text-[#6b7280] mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-[#e5e7eb] text-[#111111] text-sm px-4 py-3 outline-none focus:border-[#111111] transition-colors placeholder-[#d1d5db]"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase font-medium text-[#6b7280] mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-[#e5e7eb] text-[#111111] text-sm px-4 py-3 outline-none focus:border-[#111111] transition-colors placeholder-[#d1d5db]"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase font-medium text-[#6b7280] mb-2">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-[#e5e7eb] text-[#111111] text-sm px-4 py-3 outline-none focus:border-[#111111] transition-colors bg-white"
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Order inquiry</option>
                    <option value="product">Product question</option>
                    <option value="bespoke">Bespoke / custom order</option>
                    <option value="return">Returns & exchanges</option>
                    <option value="wholesale">Wholesale enquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase font-medium text-[#6b7280] mb-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-[#e5e7eb] text-[#111111] text-sm px-4 py-3 outline-none focus:border-[#111111] transition-colors resize-none placeholder-[#d1d5db]"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#111111] text-white text-sm font-medium py-4 hover:bg-[#333333] transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
