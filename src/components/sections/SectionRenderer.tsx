"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Section } from "@/lib/builder-types";
import type { Product, Category } from "@/lib/products";
import { formatPrice } from "@/lib/products";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type S = Record<string, any>;

interface Props {
  section: Section;
  products?: Product[];
  categories?: Category[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVideoEmbed(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=0&rel=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

// ─── Section components ───────────────────────────────────────────────────────

function HeroBanner({ s }: { s: S }) {
  const h = s.height === "half" ? "50vh" : s.height === "custom" ? `${s.custom_height}px` : "100vh";
  const align = (s.text_align as string) || "center";
  const aClass = align === "left" ? "items-start text-left" : align === "right" ? "items-end text-right" : "items-center text-center";
  return (
    <section className="relative overflow-hidden" style={{ height: h }}>
      {s.image && <img src={s.image as string} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0" style={{ background: s.overlay_color as string, opacity: (s.overlay_opacity as number || 0) / 100 }} />
      <div className={`relative z-10 h-full flex flex-col justify-center px-6 sm:px-16 ${aClass}`}>
        {s.title && <h1 className="text-white text-[clamp(2rem,5vw,4.5rem)] font-light leading-none mb-4" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>{s.title as string}</h1>}
        {s.subtitle && <p className="text-white/80 text-lg mb-8 max-w-xl">{s.subtitle as string}</p>}
        {s.button_text && (
          <a href={s.button_link as string || "#"} className="inline-block bg-[#d2ff1f] text-[#111] text-sm font-bold px-8 py-4 hover:bg-white transition-colors uppercase tracking-widest">
            {s.button_text as string}
          </a>
        )}
      </div>
    </section>
  );
}

function SplitBanner({ s }: { s: S }) {
  const imgLeft = s.image_position !== "right";
  return (
    <section style={{ background: s.bg_color as string || "#fff" }}>
      <div className="grid md:grid-cols-2">
        {imgLeft && s.image && <div className="relative h-64 md:h-auto"><img src={s.image as string} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>}
        <div className="flex flex-col justify-center px-8 sm:px-16 py-16">
          {s.title && <h2 className="text-3xl sm:text-4xl text-[#111] mb-4">{s.title as string}</h2>}
          {s.body && <p className="text-[#6b7280] leading-relaxed mb-8 max-w-sm">{s.body as string}</p>}
          {s.button_text && (
            <a href={s.button_link as string || "#"} className="inline-block bg-[#111] text-white text-xs font-bold px-8 py-4 hover:bg-[#333] transition-colors uppercase tracking-widest w-fit">
              {s.button_text as string}
            </a>
          )}
        </div>
        {!imgLeft && s.image && <div className="relative h-64 md:h-auto order-first md:order-last"><img src={s.image as string} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>}
      </div>
    </section>
  );
}

function ProductGrid({ s, products = [] }: { s: S; products: Product[] }) {
  const selection = s.selection as string || "all";
  const cols = s.columns as number || 3;
  let grid = [...products];
  if (selection === "category" && s.category_id) {
    grid = grid.filter(p => p.categoryId === s.category_id);
  } else if (selection === "manual" && Array.isArray(s.product_ids) && (s.product_ids as string[]).length > 0) {
    const ids = s.product_ids as string[];
    grid = ids.map(id => grid.find(p => p.id === id)).filter(Boolean) as Product[];
  }
  grid = grid.slice(0, s.limit as number || 6);
  const colClass = cols === 2 ? "grid-cols-1 sm:grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3";
  return (
    <section className="py-16 px-6 sm:px-10 max-w-7xl mx-auto">
      {s.title && <h2 className="text-3xl text-[#111] mb-10">{s.title as string}</h2>}
      <div className={`grid gap-6 ${colClass}`}>
        {grid.map(p => (
          <Link key={p.id} href={`/products/${p.id}`} className="group">
            <div className="relative overflow-hidden bg-[#f5f5f5] aspect-square">
              {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
            </div>
            <div className="mt-3">
              <p className="text-sm text-[#111] font-medium">{p.name}</p>
              {s.show_price !== false && <p className="text-sm text-[#6b7280] mt-0.5">{formatPrice(p.price)}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedProduct({ s, products = [] }: { s: S; products: Product[] }) {
  const p = products.find(pr => pr.id === s.product_id);
  if (!p) return null;
  return (
    <section style={{ background: s.bg_color as string || "#f5f0eb" }} className="py-20 px-6 sm:px-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="aspect-square relative overflow-hidden">
          {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
        </div>
        <div>
          <p className="text-xs tracking-[0.4em] uppercase text-[#9ca3af] mb-4">Featured</p>
          <h2 className="text-4xl text-[#111] mb-4">{(s.title as string) || p.name}</h2>
          <p className="text-[#6b7280] leading-relaxed mb-6">{(s.description as string) || p.description}</p>
          <p className="text-2xl font-light text-[#111] mb-8">{formatPrice(p.price)}</p>
          <Link href={`/products/${p.id}`} className="inline-block bg-[#111] text-white text-xs font-bold px-10 py-4 hover:bg-[#333] transition-colors uppercase tracking-widest">
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}

function TextBlock({ s }: { s: S }) {
  const align = s.align as string || "center";
  const pad = s.padding === "sm" ? "py-10" : s.padding === "lg" ? "py-24" : "py-16";
  const textAlign = align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  return (
    <section style={{ background: s.bg_color as string || "#fff" }} className={pad}>
      <div className={`max-w-3xl mx-auto px-6 ${textAlign}`}>
        {s.subheading && <p className="text-xs tracking-[0.4em] uppercase text-[#9ca3af] mb-3">{s.subheading as string}</p>}
        {s.heading && <h2 className="text-3xl sm:text-4xl text-[#111] mb-6">{s.heading as string}</h2>}
        {s.body && <p className="text-[#6b7280] leading-relaxed text-lg">{s.body as string}</p>}
      </div>
    </section>
  );
}

function ImageGallery({ s }: { s: S }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const imgs = (s.images as string[]) ?? [];
  const cols = s.columns as number || 3;
  const gap = s.gap === "sm" ? "gap-2" : s.gap === "lg" ? "gap-6" : "gap-4";
  const colClass = cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3";
  return (
    <section className="py-12 px-6 max-w-7xl mx-auto">
      {s.title && <h2 className="text-3xl text-[#111] mb-8">{s.title as string}</h2>}
      <div className={`grid ${colClass} ${gap}`}>
        {imgs.map((url, i) => (
          <button key={i} onClick={() => s.lightbox !== false ? setLightbox(url) : undefined}
            className={`relative aspect-square overflow-hidden bg-gray-100 ${s.lightbox !== false ? "cursor-zoom-in" : ""}`}>
            <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-4 right-4 text-white text-4xl leading-none">×</button>
        </div>
      )}
    </section>
  );
}

function VideoBanner({ s }: { s: S }) {
  const embedUrl = getVideoEmbed(s.url as string || "");
  return (
    <section className="relative">
      <div className="relative w-full aspect-video bg-black">
        {embedUrl && <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
        {(s.overlay_text || s.overlay_subtitle) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ background: s.overlay_color as string, opacity: (s.overlay_opacity as number || 50) / 100 }}>
          </div>
        )}
      </div>
      {(s.overlay_text || s.overlay_subtitle) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          {s.overlay_text && <h2 className="text-white text-4xl font-light mb-4 drop-shadow-lg">{s.overlay_text as string}</h2>}
          {s.overlay_subtitle && <p className="text-white/80 text-lg drop-shadow">{s.overlay_subtitle as string}</p>}
        </div>
      )}
    </section>
  );
}

function Testimonials({ s }: { s: S }) {
  type TItem = { id: string; name: string; text: string; rating: number; photo: string };
  const [idx, setIdx] = useState(0);
  const items = (s.items as TItem[]) ?? [];
  if (!items.length) return null;
  const item = items[idx];
  return (
    <section className="py-20 px-6 bg-[#f9f9f7]">
      <div className="max-w-3xl mx-auto text-center">
        {s.title && <h2 className="text-3xl text-[#111] mb-12">{s.title as string}</h2>}
        <div className="min-h-[160px] flex flex-col items-center justify-center">
          <p className="text-[#f59e0b] text-xl mb-4">{"★".repeat(item.rating)}</p>
          <p className="text-xl text-[#111] italic leading-relaxed mb-6 max-w-xl">&ldquo;{item.text}&rdquo;</p>
          <p className="text-sm font-semibold text-[#111]">{item.name}</p>
        </div>
        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {items.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-[#111]" : "bg-gray-300"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatsBar({ s }: { s: S }) {
  type StatItem = { id: string; number: string; label: string };
  const items = (s.items as StatItem[]) ?? [];
  return (
    <section style={{ background: s.bg_color as string || "#111", color: s.text_color as string || "#fff" }} className="py-12">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {items.map(item => (
          <div key={item.id}>
            <p className="text-4xl font-light mb-1">{item.number}</p>
            <p className="text-sm opacity-60 uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandLogos({ s }: { s: S }) {
  const logos = (s.logos as string[]) ?? [];
  return (
    <section className="py-12 px-6 border-y border-gray-100">
      {s.title && <p className="text-center text-xs tracking-[0.4em] uppercase text-[#9ca3af] mb-8">{s.title as string}</p>}
      <div className="flex flex-wrap justify-center gap-8 items-center">
        {logos.map((url, i) => (
          <img key={i} src={url} alt="" className="h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
        ))}
        {logos.length === 0 && <p className="text-sm text-gray-400">Add logos in the editor</p>}
      </div>
    </section>
  );
}

function Newsletter({ s }: { s: S }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="relative py-20 px-6" style={{ background: s.bg_color as string || "#111" }}>
      {s.bg_image && <img src={s.bg_image as string} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
      <div className="relative max-w-xl mx-auto text-center">
        {s.title && <h2 className="text-3xl mb-3" style={{ color: s.text_color as string || "#fff" }}>{s.title as string}</h2>}
        {s.subtitle && <p className="mb-8 opacity-70" style={{ color: s.text_color as string || "#fff" }}>{s.subtitle as string}</p>}
        {done ? (
          <p className="text-[#d2ff1f] font-semibold">Thanks for subscribing! ✓</p>
        ) : (
          <div className="flex gap-3 max-w-sm mx-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 py-3 text-sm outline-none focus:border-white/50 rounded" />
            <button onClick={() => { if (email) setDone(true); }}
              className="bg-[#d2ff1f] text-[#111] text-xs font-bold px-6 py-3 hover:bg-white transition-colors rounded uppercase tracking-wider">
              {s.button_text as string || "Subscribe"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function FAQAccordion({ s }: { s: S }) {
  type FAQItem = { id: string; question: string; answer: string };
  const [open, setOpen] = useState<string | null>(null);
  const items = (s.items as FAQItem[]) ?? [];
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      {s.title && <h2 className="text-3xl text-[#111] mb-10">{s.title as string}</h2>}
      <div className="divide-y divide-gray-200">
        {items.map(item => (
          <div key={item.id}>
            <button onClick={() => setOpen(open === item.id ? null : item.id)}
              className="w-full flex justify-between items-center py-5 text-left">
              <span className="text-[#111] font-medium">{item.question}</span>
              <span className="text-gray-400 ml-4 flex-shrink-0 text-xl">{open === item.id ? "−" : "+"}</span>
            </button>
            {open === item.id && <p className="text-[#6b7280] pb-5 leading-relaxed">{item.answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function TwoColumn({ s }: { s: S }) {
  return (
    <section style={{ background: s.bg_color as string || "#fff" }} className="py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          {s.left_heading && <h2 className="text-2xl text-[#111] mb-4">{s.left_heading as string}</h2>}
          {s.left_body && <p className="text-[#6b7280] leading-relaxed">{s.left_body as string}</p>}
        </div>
        <div>
          {s.right_heading && <h2 className="text-2xl text-[#111] mb-4">{s.right_heading as string}</h2>}
          {s.right_body && <p className="text-[#6b7280] leading-relaxed">{s.right_body as string}</p>}
        </div>
      </div>
    </section>
  );
}

function FullWidthImage({ s }: { s: S }) {
  return (
    <section>
      <div className="relative overflow-hidden" style={{ height: `${s.height as number || 500}px` }}>
        {s.image && <img src={s.image as string} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: s.object_position as string || "center" }} />}
        {(s.overlay_opacity as number) > 0 && (
          <div className="absolute inset-0" style={{ background: s.overlay_color as string, opacity: (s.overlay_opacity as number) / 100 }} />
        )}
      </div>
      {s.caption && <p className="text-center text-sm text-[#9ca3af] py-3">{s.caption as string}</p>}
    </section>
  );
}

function CountdownTimer({ s }: { s: S }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, sc: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!s.end_date) return;
    function tick() {
      const diff = new Date(s.end_date as string).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); setTime({ d: 0, h: 0, m: 0, sc: 0 }); return; }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        sc: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [s.end_date]);

  const units = [["Days", time.d], ["Hours", time.h], ["Mins", time.m], ["Secs", time.sc]];
  return (
    <section style={{ background: s.bg_color as string || "#111", color: s.text_color as string || "#fff" }} className="py-16 px-6 text-center">
      {s.title && <h2 className="text-2xl mb-2">{s.title as string}</h2>}
      {s.subtitle && <p className="opacity-60 mb-8 text-sm">{s.subtitle as string}</p>}
      {expired ? (
        <p className="text-xl opacity-60">Sale has ended</p>
      ) : s.end_date ? (
        <div className="flex justify-center gap-6 sm:gap-10">
          {units.map(([label, val]) => (
            <div key={label as string} className="min-w-[60px]">
              <p className="text-5xl font-light">{String(val).padStart(2, "0")}</p>
              <p className="text-xs uppercase tracking-widest mt-1 opacity-60">{label as string}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="opacity-40 text-sm">Set an end date in the editor</p>
      )}
    </section>
  );
}

function InstagramFeed({ s }: { s: S }) {
  const imgs = (s.images as string[]) ?? [];
  const cols = s.columns as number || 4;
  const colClass = cols === 3 ? "grid-cols-3" : cols === 5 ? "grid-cols-3 sm:grid-cols-5" : cols === 6 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-2 sm:grid-cols-4";
  return (
    <section className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {s.title && (
          <div className="text-center mb-6">
            <h2 className="text-2xl text-[#111]">{s.title as string}</h2>
            {s.handle && <p className="text-sm text-[#9ca3af] mt-1">{s.handle as string}</p>}
          </div>
        )}
        <div className={`grid gap-1 ${colClass}`}>
          {imgs.map((url, i) => (
            <div key={i} className="aspect-square overflow-hidden bg-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
        {s.link && (
          <div className="text-center mt-6">
            <a href={s.link as string} target="_blank" rel="noopener noreferrer"
              className="text-sm text-[#111] border-b border-[#111]/30 pb-0.5 hover:border-[#111] transition-colors">
              View on Instagram →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryShowcase({ s, categories = [] }: { s: S; categories: Category[] }) {
  const selected = s.category_ids as string[] || [];
  const display = selected.length > 0 ? categories.filter(c => selected.includes(c.id)) : categories;
  const cols = s.columns as number || 3;
  const colClass = cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3";
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {s.title && <h2 className="text-3xl text-[#111] mb-10">{s.title as string}</h2>}
      <div className={`grid gap-4 ${colClass}`}>
        {display.map(cat => (
          <Link key={cat.id} href={`/?category=${cat.slug}`}
            className="group relative aspect-square overflow-hidden bg-[#f5f5f5] flex items-end">
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <p className="relative z-10 text-white text-xl font-light p-6">{cat.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TeamSection({ s }: { s: S }) {
  type M = { id: string; name: string; role: string; bio: string; photo: string };
  const members = (s.members as M[]) ?? [];
  return (
    <section style={{ background: s.bg_color as string || "#fff" }} className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {s.title && <h2 className="text-3xl text-[#111] mb-2 text-center">{s.title as string}</h2>}
        {s.subtitle && <p className="text-center text-[#9ca3af] mb-12">{s.subtitle as string}</p>}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {members.map(m => (
            <div key={m.id} className="text-center">
              <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">👤</div>}
              </div>
              <p className="font-semibold text-[#111]">{m.name}</p>
              <p className="text-sm text-[#9ca3af] mt-0.5 mb-2">{m.role}</p>
              {m.bio && <p className="text-sm text-[#6b7280] leading-relaxed">{m.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactForm({ s }: { s: S }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <section style={{ background: s.bg_color as string || "#fff" }} className="py-20 px-6">
      <div className="max-w-xl mx-auto">
        {s.title && <h2 className="text-3xl text-[#111] mb-2">{s.title as string}</h2>}
        {s.subtitle && <p className="text-[#9ca3af] mb-8">{s.subtitle as string}</p>}
        {sent ? (
          <div className="text-center py-10">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-[#111] font-medium">Message sent! We&apos;ll be in touch.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[["name", "Full Name", "text"], ["email", "Email", "email"]].map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                <input type={type} value={form[field as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-3 text-sm focus:outline-none focus:border-gray-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Message</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5}
                className="w-full border border-gray-200 rounded px-3 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
            </div>
            <button onClick={() => { if (form.name && form.email && form.message) setSent(true); }}
              className="w-full bg-[#111] text-white text-xs font-bold py-4 uppercase tracking-widest hover:bg-[#333] transition-colors">
              Send Message
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function MapEmbed({ s }: { s: S }) {
  return (
    <section className="py-12 px-6 max-w-5xl mx-auto">
      {s.title && <h2 className="text-2xl text-[#111] mb-4">{s.title as string}</h2>}
      {s.address && <p className="text-[#9ca3af] text-sm mb-4">{s.address as string}</p>}
      {s.embed_url ? (
        <iframe src={s.embed_url as string} width="100%" height={s.height as number || 400}
          style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm" style={{ height: `${s.height as number || 400}px` }}>
          Add a Google Maps embed URL in the editor
        </div>
      )}
    </section>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export default function SectionRenderer({ section, products = [], categories = [] }: Props) {
  if (!section.visible) return null;
  const s = section.settings;

  switch (section.type) {
    case "hero_banner":       return <HeroBanner s={s} />;
    case "split_banner":      return <SplitBanner s={s} />;
    case "product_grid":      return <ProductGrid s={s} products={products} />;
    case "featured_product":  return <FeaturedProduct s={s} products={products} />;
    case "text_block":        return <TextBlock s={s} />;
    case "image_gallery":     return <ImageGallery s={s} />;
    case "video_banner":      return <VideoBanner s={s} />;
    case "testimonials":      return <Testimonials s={s} />;
    case "stats_bar":         return <StatsBar s={s} />;
    case "brand_logos":       return <BrandLogos s={s} />;
    case "newsletter":        return <Newsletter s={s} />;
    case "faq_accordion":     return <FAQAccordion s={s} />;
    case "two_column":        return <TwoColumn s={s} />;
    case "full_width_image":  return <FullWidthImage s={s} />;
    case "countdown_timer":   return <CountdownTimer s={s} />;
    case "instagram_feed":    return <InstagramFeed s={s} />;
    case "category_showcase": return <CategoryShowcase s={s} categories={categories} />;
    case "team_section":      return <TeamSection s={s} />;
    case "contact_form":      return <ContactForm s={s} />;
    case "map_embed":         return <MapEmbed s={s} />;
    default:                  return null;
  }
}
