"use client";

import { useRef, useState } from "react";
import { Section, SECTION_LIBRARY } from "@/lib/builder-types";
import type { Product, Category } from "@/lib/products";

interface Props {
  section: Section;
  onChange: (settings: Record<string, unknown>) => void;
  products: Product[];
  categories: Category[];
  onClose: () => void;
}

// ─── Reusable field components ────────────────────────────────────────────────

function F({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors";
const textareaCls = inputCls + " resize-none";

function TI({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />;
}
function TA({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={textareaCls} />;
}
function CI({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2">
      <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)} className="w-7 h-7 cursor-pointer rounded border-0 p-0 bg-transparent" />
      <span className="text-sm font-mono text-gray-700">{value || "#000000"}</span>
      {label && <span className="text-xs text-gray-400 ml-auto">{label}</span>}
    </div>
  );
}
function NI({ value, onChange, min = 0, max = 100, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={value ?? 0} onChange={e => onChange(+e.target.value)} className="flex-1 accent-gray-900" />
      <span className="text-sm font-mono text-gray-600 w-10 text-right">{value ?? 0}</span>
    </div>
  );
}
function SI({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value || options[0]?.value} onChange={e => onChange(e.target.value)} className={inputCls}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer py-1">
      <button type="button" onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-gray-900" : "bg-gray-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
function Seg({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors capitalize ${value === o ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── Image upload ─────────────────────────────────────────────────────────────

function ImgField({ value, onChange, label = "Image" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setErr("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onChange(data.url); else setErr(data.error || "Upload failed");
    } catch { setErr("Upload failed"); }
    setUploading(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <div className="flex gap-2 items-center">
        <input type="text" value={value || ""} onChange={e => onChange(e.target.value)}
          placeholder="https://… or upload →" className={inputCls + " flex-1"} />
        <button onClick={() => ref.current?.click()} disabled={uploading}
          className="flex-shrink-0 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap">
          {uploading ? "…" : "Upload"}
        </button>
      </div>
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
      {value && <img src={value} alt="" className="mt-2 w-full h-28 object-cover rounded-lg border border-gray-200" />}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function MultiImgField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const imgs = Array.isArray(value) ? value : [];

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    onChange([...imgs, ...urls]);
    setUploading(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {imgs.map((url, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => onChange(imgs.filter((_, j) => j !== i))}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none">×</button>
          </div>
        ))}
        <button onClick={() => ref.current?.click()} disabled={uploading}
          className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-500 transition-colors text-2xl">
          {uploading ? "…" : "+"}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Per-type settings renderers ──────────────────────────────────────────────

function HeroSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Background Image"><ImgField value={s.image as string} onChange={v => u({ image: v })} /></F>
    <F label="Height">
      <Seg value={s.height as string || "full"} onChange={v => u({ height: v })} options={["full", "half", "custom"]} />
      {s.height === "custom" && <input type="number" value={s.custom_height as number || 600} onChange={e => u({ custom_height: +e.target.value })} className={inputCls + " mt-2"} placeholder="Height in px" />}
    </F>
    <F label="Overlay Color"><CI value={s.overlay_color as string} onChange={v => u({ overlay_color: v })} /></F>
    <F label="Overlay Opacity"><NI value={s.overlay_opacity as number} onChange={v => u({ overlay_opacity: v })} /></F>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} placeholder="New Season Arrivals" /></F>
    <F label="Subtitle"><TI value={s.subtitle as string} onChange={v => u({ subtitle: v })} /></F>
    <F label="Button Text"><TI value={s.button_text as string} onChange={v => u({ button_text: v })} placeholder="Shop Now" /></F>
    <F label="Button Link"><TI value={s.button_link as string} onChange={v => u({ button_link: v })} placeholder="/#products" /></F>
    <F label="Text Alignment"><Seg value={s.text_align as string || "center"} onChange={v => u({ text_align: v })} options={["left", "center", "right"]} /></F>
  </>;
}

function SplitSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Image"><ImgField value={s.image as string} onChange={v => u({ image: v })} /></F>
    <F label="Image Position"><Seg value={s.image_position as string || "left"} onChange={v => u({ image_position: v })} options={["left", "right"]} /></F>
    <F label="Background Color"><CI value={s.bg_color as string || "#ffffff"} onChange={v => u({ bg_color: v })} /></F>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Body Text"><TA value={s.body as string} onChange={v => u({ body: v })} rows={4} /></F>
    <F label="Button Text"><TI value={s.button_text as string} onChange={v => u({ button_text: v })} /></F>
    <F label="Button Link"><TI value={s.button_link as string} onChange={v => u({ button_link: v })} /></F>
  </>;
}

function ProductGridSettings({ s, u, products, categories }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void; products: Product[]; categories: Category[] }) {
  const selection = s.selection as string || "all";
  const selectedIds = (s.product_ids as string[]) ?? [];
  return <>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Columns">
      <Seg value={String(s.columns || 3)} onChange={v => u({ columns: +v })} options={["2", "3", "4"]} />
    </F>
    <F label="Limit (max products)">
      <input type="number" min={1} max={24} value={s.limit as number || 6} onChange={e => u({ limit: +e.target.value })} className={inputCls} />
    </F>
    <F label="Product Selection">
      <Seg value={selection} onChange={v => u({ selection: v })} options={["all", "category", "manual"]} />
    </F>
    {selection === "category" && (
      <F label="Category">
        <SI value={s.category_id as string || ""} onChange={v => u({ category_id: v })} options={[{ value: "", label: "All categories" }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
      </F>
    )}
    {selection === "manual" && (
      <F label="Select Products" hint="Check the products to display">
        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
          {products.map(p => (
            <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={e => {
                const next = e.target.checked ? [...selectedIds, p.id] : selectedIds.filter(id => id !== p.id);
                u({ product_ids: next });
              }} className="accent-gray-900" />
              {p.image && <img src={p.image} alt="" className="w-8 h-8 object-cover rounded" />}
              <span className="text-xs text-gray-700 flex-1 truncate">{p.name}</span>
            </label>
          ))}
        </div>
      </F>
    )}
    <Toggle value={s.show_price as boolean ?? true} onChange={v => u({ show_price: v })} label="Show prices" />
  </>;
}

function FeaturedProductSettings({ s, u, products }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void; products: Product[] }) {
  return <>
    <F label="Product">
      <SI value={s.product_id as string || ""} onChange={v => u({ product_id: v })} options={[{ value: "", label: "— Select a product —" }, ...products.map(p => ({ value: p.id, label: p.name }))]} />
    </F>
    <F label="Title Override" hint="Leave blank to use product name"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Description Override" hint="Leave blank to use product description"><TA value={s.description as string} onChange={v => u({ description: v })} /></F>
    <F label="Background Color"><CI value={s.bg_color as string || "#f5f0eb"} onChange={v => u({ bg_color: v })} /></F>
  </>;
}

function TextBlockSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Heading"><TI value={s.heading as string} onChange={v => u({ heading: v })} /></F>
    <F label="Subheading"><TI value={s.subheading as string} onChange={v => u({ subheading: v })} /></F>
    <F label="Body"><TA value={s.body as string} onChange={v => u({ body: v })} rows={5} /></F>
    <F label="Text Alignment"><Seg value={s.align as string || "center"} onChange={v => u({ align: v })} options={["left", "center", "right"]} /></F>
    <F label="Background Color"><CI value={s.bg_color as string || "#ffffff"} onChange={v => u({ bg_color: v })} /></F>
    <F label="Padding"><Seg value={s.padding as string || "md"} onChange={v => u({ padding: v })} options={["sm", "md", "lg"]} /></F>
  </>;
}

function ImageGallerySettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Title" hint="Optional section heading"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Images"><MultiImgField value={s.images as string[]} onChange={v => u({ images: v })} /></F>
    <F label="Columns"><Seg value={String(s.columns || 3)} onChange={v => u({ columns: +v })} options={["2", "3", "4"]} /></F>
    <F label="Gap"><Seg value={s.gap as string || "md"} onChange={v => u({ gap: v })} options={["sm", "md", "lg"]} /></F>
    <Toggle value={s.lightbox as boolean ?? true} onChange={v => u({ lightbox: v })} label="Enable lightbox on click" />
  </>;
}

function VideoBannerSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Video URL" hint="YouTube or Vimeo URL"><TI value={s.url as string} onChange={v => u({ url: v })} placeholder="https://youtube.com/watch?v=…" /></F>
    <F label="Overlay Text"><TI value={s.overlay_text as string} onChange={v => u({ overlay_text: v })} /></F>
    <F label="Overlay Subtitle"><TI value={s.overlay_subtitle as string} onChange={v => u({ overlay_subtitle: v })} /></F>
    <F label="Overlay Color"><CI value={s.overlay_color as string} onChange={v => u({ overlay_color: v })} /></F>
    <F label="Overlay Opacity"><NI value={s.overlay_opacity as number} onChange={v => u({ overlay_opacity: v })} /></F>
  </>;
}

type TItem = { id: string; name: string; text: string; rating: number; photo: string };
function TestimonialsSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  const items = (s.items as TItem[]) ?? [];
  return <>
    <F label="Section Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Reviews">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-500">Review {i + 1}</span>
              <button onClick={() => u({ items: items.filter(it => it.id !== item.id) })} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            </div>
            <TI value={item.name} onChange={v => u({ items: items.map(it => it.id === item.id ? { ...it, name: v } : it) })} placeholder="Customer name" />
            <TA value={item.text} onChange={v => u({ items: items.map(it => it.id === item.id ? { ...it, text: v } : it) })} rows={2} placeholder="Review text" />
            <select value={item.rating} onChange={e => u({ items: items.map(it => it.id === item.id ? { ...it, rating: +e.target.value } : it) })} className={inputCls}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{"★".repeat(r)} ({r} stars)</option>)}
            </select>
          </div>
        ))}
        <button onClick={() => u({ items: [...items, { id: crypto.randomUUID(), name: "", text: "", rating: 5, photo: "" }] })}
          className="w-full py-2 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
          + Add Review
        </button>
      </div>
    </F>
  </>;
}

type StatItem = { id: string; number: string; label: string };
function StatsBarSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  const items = (s.items as StatItem[]) ?? [];
  return <>
    <F label="Background Color"><CI value={s.bg_color as string || "#111"} onChange={v => u({ bg_color: v })} /></F>
    <F label="Text Color"><CI value={s.text_color as string || "#fff"} onChange={v => u({ text_color: v })} /></F>
    <F label="Stats">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2 items-center">
            <input value={item.number} onChange={e => u({ items: items.map(it => it.id === item.id ? { ...it, number: e.target.value } : it) })}
              placeholder="500+" className={inputCls + " w-28"} />
            <input value={item.label} onChange={e => u({ items: items.map(it => it.id === item.id ? { ...it, label: e.target.value } : it) })}
              placeholder="Products Sold" className={inputCls + " flex-1"} />
            <button onClick={() => u({ items: items.filter(it => it.id !== item.id) })} className="text-gray-300 hover:text-red-500 text-lg flex-shrink-0">×</button>
          </div>
        ))}
        <button onClick={() => u({ items: [...items, { id: crypto.randomUUID(), number: "", label: "" }] })}
          className="w-full py-2 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400">
          + Add Stat
        </button>
      </div>
    </F>
  </>;
}

function BrandLogosSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Section Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Logos"><MultiImgField value={s.logos as string[]} onChange={v => u({ logos: v })} /></F>
    <F label="Scroll Speed (lower = faster)"><NI value={s.speed as number || 30} onChange={v => u({ speed: v })} min={5} max={60} /></F>
  </>;
}

function NewsletterSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Subtitle"><TI value={s.subtitle as string} onChange={v => u({ subtitle: v })} /></F>
    <F label="Button Text"><TI value={s.button_text as string} onChange={v => u({ button_text: v })} /></F>
    <F label="Background Image" hint="Overlaid with background color"><ImgField value={s.bg_image as string} onChange={v => u({ bg_image: v })} /></F>
    <F label="Background Color"><CI value={s.bg_color as string || "#111"} onChange={v => u({ bg_color: v })} /></F>
    <F label="Text Color"><CI value={s.text_color as string || "#fff"} onChange={v => u({ text_color: v })} /></F>
  </>;
}

type FAQItem = { id: string; question: string; answer: string };
function FAQSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  const items = (s.items as FAQItem[]) ?? [];
  return <>
    <F label="Section Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Questions & Answers">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-500">Q{i + 1}</span>
              <button onClick={() => u({ items: items.filter(it => it.id !== item.id) })} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            </div>
            <TI value={item.question} onChange={v => u({ items: items.map(it => it.id === item.id ? { ...it, question: v } : it) })} placeholder="Question" />
            <TA value={item.answer} onChange={v => u({ items: items.map(it => it.id === item.id ? { ...it, answer: v } : it) })} rows={2} placeholder="Answer" />
          </div>
        ))}
        <button onClick={() => u({ items: [...items, { id: crypto.randomUUID(), question: "", answer: "" }] })}
          className="w-full py-2 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400">
          + Add Question
        </button>
      </div>
    </F>
  </>;
}

function TwoColumnSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Background Color"><CI value={s.bg_color as string || "#ffffff"} onChange={v => u({ bg_color: v })} /></F>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Left Column</p>
        <div className="space-y-2">
          <TI value={s.left_heading as string} onChange={v => u({ left_heading: v })} placeholder="Heading" />
          <TA value={s.left_body as string} onChange={v => u({ left_body: v })} rows={4} placeholder="Body text" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Right Column</p>
        <div className="space-y-2">
          <TI value={s.right_heading as string} onChange={v => u({ right_heading: v })} placeholder="Heading" />
          <TA value={s.right_body as string} onChange={v => u({ right_body: v })} rows={4} placeholder="Body text" />
        </div>
      </div>
    </div>
  </>;
}

function FullWidthImageSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Image"><ImgField value={s.image as string} onChange={v => u({ image: v })} /></F>
    <F label="Height (px)">
      <input type="number" value={s.height as number || 500} onChange={e => u({ height: +e.target.value })} min={200} max={1200} className={inputCls} />
    </F>
    <F label="Object Position">
      <Seg value={s.object_position as string || "center"} onChange={v => u({ object_position: v })} options={["top", "center", "bottom"]} />
    </F>
    <F label="Overlay Color"><CI value={s.overlay_color as string || "#000"} onChange={v => u({ overlay_color: v })} /></F>
    <F label="Overlay Opacity"><NI value={s.overlay_opacity as number || 0} onChange={v => u({ overlay_opacity: v })} /></F>
    <F label="Caption" hint="Optional text below image"><TI value={s.caption as string} onChange={v => u({ caption: v })} /></F>
  </>;
}

function CountdownSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} placeholder="Sale Ends In" /></F>
    <F label="Subtitle"><TI value={s.subtitle as string} onChange={v => u({ subtitle: v })} /></F>
    <F label="End Date & Time">
      <input type="datetime-local" value={s.end_date as string || ""} onChange={e => u({ end_date: e.target.value })} className={inputCls} />
    </F>
    <F label="Background Color"><CI value={s.bg_color as string || "#111"} onChange={v => u({ bg_color: v })} /></F>
    <F label="Text Color"><CI value={s.text_color as string || "#fff"} onChange={v => u({ text_color: v })} /></F>
  </>;
}

function InstagramFeedSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} placeholder="Follow Us" /></F>
    <F label="Handle"><TI value={s.handle as string} onChange={v => u({ handle: v })} placeholder="@yourstore" /></F>
    <F label="Link URL" hint="Profile link"><TI value={s.link as string} onChange={v => u({ link: v })} placeholder="https://instagram.com/…" /></F>
    <F label="Images"><MultiImgField value={s.images as string[]} onChange={v => u({ images: v })} /></F>
    <F label="Columns"><Seg value={String(s.columns || 4)} onChange={v => u({ columns: +v })} options={["3", "4", "5", "6"]} /></F>
  </>;
}

function CategoryShowcaseSettings({ s, u, categories }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void; categories: Category[] }) {
  const selected = (s.category_ids as string[]) ?? [];
  return <>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Columns"><Seg value={String(s.columns || 3)} onChange={v => u({ columns: +v })} options={["2", "3", "4"]} /></F>
    <F label="Categories" hint="Leave all unchecked to show all">
      <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100">
        {categories.map(c => (
          <label key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" checked={selected.includes(c.id)} onChange={e => {
              const next = e.target.checked ? [...selected, c.id] : selected.filter(id => id !== c.id);
              u({ category_ids: next });
            }} className="accent-gray-900" />
            <span className="text-xs text-gray-700">{c.name}</span>
          </label>
        ))}
      </div>
    </F>
  </>;
}

type MemberItem = { id: string; name: string; role: string; bio: string; photo: string };
function TeamSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  const members = (s.members as MemberItem[]) ?? [];
  return <>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Subtitle"><TI value={s.subtitle as string} onChange={v => u({ subtitle: v })} /></F>
    <F label="Background Color"><CI value={s.bg_color as string || "#fff"} onChange={v => u({ bg_color: v })} /></F>
    <F label="Team Members">
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-500">{m.name || "New Member"}</span>
              <button onClick={() => u({ members: members.filter(it => it.id !== m.id) })} className="text-xs text-red-400">Remove</button>
            </div>
            <ImgField value={m.photo} onChange={v => u({ members: members.map(it => it.id === m.id ? { ...it, photo: v } : it) })} label="" />
            <TI value={m.name} onChange={v => u({ members: members.map(it => it.id === m.id ? { ...it, name: v } : it) })} placeholder="Full name" />
            <TI value={m.role} onChange={v => u({ members: members.map(it => it.id === m.id ? { ...it, role: v } : it) })} placeholder="Role / Title" />
            <TA value={m.bio} onChange={v => u({ members: members.map(it => it.id === m.id ? { ...it, bio: v } : it) })} rows={2} placeholder="Short bio" />
          </div>
        ))}
        <button onClick={() => u({ members: [...members, { id: crypto.randomUUID(), name: "", role: "", bio: "", photo: "" }] })}
          className="w-full py-2 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400">
          + Add Member
        </button>
      </div>
    </F>
  </>;
}

function ContactFormSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Subtitle"><TI value={s.subtitle as string} onChange={v => u({ subtitle: v })} /></F>
    <F label="Send Emails To" hint="Where form submissions are sent"><TI value={s.email_to as string} onChange={v => u({ email_to: v })} placeholder="you@example.com" /></F>
    <F label="Background Color"><CI value={s.bg_color as string || "#fff"} onChange={v => u({ bg_color: v })} /></F>
  </>;
}

function MapEmbedSettings({ s, u }: { s: Record<string, unknown>; u: (v: Record<string, unknown>) => void }) {
  return <>
    <F label="Title"><TI value={s.title as string} onChange={v => u({ title: v })} /></F>
    <F label="Google Maps Embed URL" hint="From Google Maps → Share → Embed → copy src URL">
      <TA value={s.embed_url as string} onChange={v => u({ embed_url: v })} rows={3} placeholder="https://www.google.com/maps/embed?pb=…" />
    </F>
    <F label="Address"><TI value={s.address as string} onChange={v => u({ address: v })} placeholder="123 Main St, City, Country" /></F>
    <F label="Height (px)">
      <input type="number" value={s.height as number || 400} onChange={e => u({ height: +e.target.value })} min={200} max={800} className={inputCls} />
    </F>
  </>;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SettingsPanel({ section, onChange, products, categories, onClose }: Props) {
  const s = section.settings;
  const u = onChange;
  const meta = SECTION_LIBRARY.find(l => l.type === section.type);

  function renderSettings() {
    switch (section.type) {
      case "hero_banner":       return <HeroSettings s={s} u={u} />;
      case "split_banner":      return <SplitSettings s={s} u={u} />;
      case "product_grid":      return <ProductGridSettings s={s} u={u} products={products} categories={categories} />;
      case "featured_product":  return <FeaturedProductSettings s={s} u={u} products={products} />;
      case "text_block":        return <TextBlockSettings s={s} u={u} />;
      case "image_gallery":     return <ImageGallerySettings s={s} u={u} />;
      case "video_banner":      return <VideoBannerSettings s={s} u={u} />;
      case "testimonials":      return <TestimonialsSettings s={s} u={u} />;
      case "stats_bar":         return <StatsBarSettings s={s} u={u} />;
      case "brand_logos":       return <BrandLogosSettings s={s} u={u} />;
      case "newsletter":        return <NewsletterSettings s={s} u={u} />;
      case "faq_accordion":     return <FAQSettings s={s} u={u} />;
      case "two_column":        return <TwoColumnSettings s={s} u={u} />;
      case "full_width_image":  return <FullWidthImageSettings s={s} u={u} />;
      case "countdown_timer":   return <CountdownSettings s={s} u={u} />;
      case "instagram_feed":    return <InstagramFeedSettings s={s} u={u} />;
      case "category_showcase": return <CategoryShowcaseSettings s={s} u={u} categories={categories} />;
      case "team_section":      return <TeamSettings s={s} u={u} />;
      case "contact_form":      return <ContactFormSettings s={s} u={u} />;
      case "map_embed":         return <MapEmbedSettings s={s} u={u} />;
      default: return <p className="text-sm text-gray-400">No settings available.</p>;
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{meta?.category}</p>
          <h3 className="font-semibold text-gray-900 text-base mt-0.5">{meta?.icon} {meta?.label}</h3>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-xl transition-colors">×</button>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {renderSettings()}
      </div>
    </div>
  );
}
