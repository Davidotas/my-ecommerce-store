"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import {
  saveMarqueeItems,
  saveMarqueeColors,
  updateSectionVisibility,
  updateSectionOrder,
  saveNavLinks,
  saveFooterConfig,
  saveBanner,
  deleteBanner,
  saveHeroSettings,
} from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────
type MarqueeItem = { id?: string; text: string; is_active: boolean; order_index: number };
type PageSection = { id: string; section_key: string; title: string; is_visible: boolean; order_index: number };
type NavLink     = { id?: string; label: string; href: string; is_active: boolean; order_index: number };
type FooterCfg   = {
  copyright_text: string; social_instagram: string; social_tiktok: string;
  social_pinterest: string; info_links: { label: string; href: string }[];
  support_links: { label: string; href: string }[];
};
type Banner = { id?: string; title: string; subtitle: string; image_url: string; link_url: string; is_active: boolean; order_index: number };

type Props = {
  marqueeItems: MarqueeItem[];
  pageSections: PageSection[];
  navLinks: NavLink[];
  footerConfig: FooterCfg | null;
  banners: Banner[];
  heroTitle: string; heroSubtitle: string; heroImageUrl: string;
  heroButtonText: string; heroButtonLink: string;
  marqueeBgColor: string; marqueeTextColor: string;
};

const TABS = [
  { key: "hero",     label: "Hero",             icon: "🖼️" },
  { key: "marquee",  label: "Announcement Bar", icon: "📢" },
  { key: "sections", label: "Sections",         icon: "⚡" },
  { key: "nav",      label: "Navigation",       icon: "🔗" },
  { key: "footer",   label: "Footer",           icon: "📄" },
  { key: "banners",  label: "Banners",          icon: "🎨" },
];

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero:         "Full-screen hero image with title, subtitle and CTA button",
  marquee:      "Scrolling announcement bar with promotional text",
  categories:   "Featured categories grid with images",
  new_arrivals: "Latest 8 products in an animated grid",
  editorial:    "Full-width editorial image banner",
  newsletter:   "Email newsletter signup section",
};

// ─── Shared helpers ────────────────────────────────────────────────────────────
async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }
  const { url } = await res.json();
  return url as string;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 text-sm font-medium shadow-xl animate-in slide-in-from-bottom-2 ${ok ? "bg-white text-[#111111]" : "bg-red-500 text-white"}`}>
      <span>{ok ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-1.5 font-medium">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-2.5 outline-none focus:border-white/40 transition-colors placeholder-white/20 ${className}`}
    />
  );
}

function SaveBtn({ onClick, pending, label = "Save Changes" }: { onClick: () => void; pending: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="bg-white text-[#111111] text-sm font-semibold px-6 py-2.5 hover:bg-[#d2ff1f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? <><span className="w-3.5 h-3.5 border-2 border-[#111]/30 border-t-[#111] rounded-full animate-spin" />{" "}Saving…</> : label}
    </button>
  );
}

/** Drag handle + up/down arrows for reordering */
function ReorderBtns({ onUp, onDown, disableUp, disableDown }: {
  onUp: () => void; onDown: () => void; disableUp: boolean; disableDown: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <button onClick={onUp} disabled={disableUp}
        className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button onClick={onDown} disabled={disableDown}
        className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

/** Image uploader with preview */
function ImageUploader({ value, onChange, label = "Image" }: {
  value: string; onChange: (url: string) => void; label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-3 items-start">
        <Input value={value} onChange={onChange} placeholder="https://… or upload →" className="flex-1" />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 bg-white/10 border border-white/20 text-white/70 text-xs px-4 py-2.5 hover:bg-white/20 transition-colors disabled:opacity-40 whitespace-nowrap"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {value && (
        <div className="mt-3 relative h-36 bg-white/5 overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover opacity-80" />
          <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5">Preview</span>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function PagesClient(props: Props) {
  const [tab, setTab] = useState("hero");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div>
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Page Builder</h1>
          <p className="text-white/40 text-sm mt-1">Customize your storefront content and layout</p>
        </div>
        <button
          onClick={() => window.open("/", "_blank")}
          className="flex items-center gap-2 border border-white/20 text-white/60 text-sm px-4 py-2 hover:border-white/50 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Site
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-lg flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
              tab === t.key ? "bg-white text-[#111111] font-semibold" : "text-white/50 hover:text-white"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 lg:p-8">
        {tab === "hero"     && <HeroTab     {...props} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "marquee"  && <MarqueeTab  {...props} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "sections" && <SectionsTab {...props} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "nav"      && <NavTab      {...props} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "footer"   && <FooterTab   {...props} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "banners"  && <BannersTab  {...props} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
      </div>
    </div>
  );
}

// ─── HERO TAB ─────────────────────────────────────────────────────────────────
type TabProps = Props & { isPending: boolean; startTransition: (fn: () => void) => void; showToast: (msg: string, ok?: boolean) => void };

function HeroTab({ heroTitle, heroSubtitle, heroImageUrl, heroButtonText, heroButtonLink, isPending, startTransition, showToast }: TabProps) {
  const [title,       setTitle]       = useState(heroTitle);
  const [subtitle,    setSubtitle]    = useState(heroSubtitle);
  const [imageUrl,    setImageUrl]    = useState(heroImageUrl);
  const [buttonText,  setButtonText]  = useState(heroButtonText);
  const [buttonLink,  setButtonLink]  = useState(heroButtonLink);

  function save() {
    startTransition(async () => {
      try {
        await saveHeroSettings({
          hero_title: title, hero_subtitle: subtitle,
          hero_image_url: imageUrl, hero_button_text: buttonText, hero_button_link: buttonLink,
        });
        showToast("Hero saved");
      } catch { showToast("Failed to save", false); }
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-5">
        <h2 className="text-white font-semibold text-base mb-6">Hero Banner</h2>
        <Field label="Headline">
          <Input value={title} onChange={setTitle} placeholder="New Season Arrivals" />
        </Field>
        <Field label="Subheadline">
          <Input value={subtitle} onChange={setSubtitle} placeholder="Discover curated pieces…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Button Text">
            <Input value={buttonText} onChange={setButtonText} placeholder="Shop Now" />
          </Field>
          <Field label="Button Link">
            <Input value={buttonLink} onChange={setButtonLink} placeholder="/#products" />
          </Field>
        </div>
        <ImageUploader value={imageUrl} onChange={setImageUrl} label="Background Image" />
        <SaveBtn onClick={save} pending={isPending} />
      </div>

      {/* Live preview */}
      <div>
        <Label>Live Preview</Label>
        <div
          className="relative h-64 overflow-hidden border border-white/10 bg-[#f9fafb]"
          style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {imageUrl && <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)" }} />}
          <div className="relative z-10 p-6 flex flex-col justify-end h-full">
            <p className="text-[9px] tracking-[0.4em] uppercase text-[#6b7280] mb-2">Collection 2026</p>
            <h3 className="text-xl text-[#111111] leading-tight mb-2 max-w-[180px]">{title || "Headline"}</h3>
            <p className="text-[#6b7280] text-[10px] mb-3 max-w-[160px] leading-relaxed">{subtitle || "Subtitle text here"}</p>
            <span className="inline-block bg-[#111111] text-white text-[9px] font-medium px-4 py-1.5 w-fit">
              {buttonText || "Shop Now"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MARQUEE TAB ──────────────────────────────────────────────────────────────
function MarqueeTab({ marqueeItems: init, marqueeBgColor: initBg, marqueeTextColor: initText, isPending, startTransition, showToast }: TabProps) {
  const [items,     setItems]     = useState<MarqueeItem[]>(init.length > 0 ? init : [{ text: "FREE SHIPPING ON ORDERS OVER $100", is_active: true, order_index: 0 }]);
  const [newText,   setNewText]   = useState("");
  const [bgColor,   setBgColor]   = useState(initBg);
  const [textColor, setTextColor] = useState(initText);

  function addItem() {
    if (!newText.trim()) return;
    setItems([...items, { text: newText.trim().toUpperCase(), is_active: true, order_index: items.length }]);
    setNewText("");
  }

  function saveItems() {
    startTransition(async () => {
      try {
        await saveMarqueeItems(items);
        await saveMarqueeColors(bgColor, textColor);
        showToast("Announcement bar saved");
      } catch { showToast("Failed to save", false); }
    });
  }

  // Live preview text
  const previewText = items.filter(i => i.is_active).map(i => i.text).join("   ·   ") || "YOUR TEXT HERE";

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="text-white font-semibold text-base">Announcement Bar</h2>

      {/* Live preview */}
      <div>
        <Label>Preview</Label>
        <div className="overflow-hidden py-3 px-4 text-[11px] tracking-[0.25em] uppercase font-medium truncate" style={{ backgroundColor: bgColor, color: textColor }}>
          {previewText}
        </div>
      </div>

      {/* Color pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Background Color</Label>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-7 cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="text-sm text-white font-mono">{bgColor}</span>
          </div>
        </div>
        <div>
          <Label>Text Color</Label>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-7 cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="text-sm text-white font-mono">{textColor}</span>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div>
        <Label>Items</Label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-white/5 border border-white/10">
              <ReorderBtns
                onUp={() => setItems(move(items, i, i - 1))}
                onDown={() => setItems(move(items, i, i + 1))}
                disableUp={i === 0} disableDown={i === items.length - 1}
              />
              {/* Toggle */}
              <button
                onClick={() => setItems(items.map((it, idx) => idx === i ? { ...it, is_active: !it.is_active } : it))}
                className={`shrink-0 w-8 h-4 rounded-full transition-colors duration-200 ${item.is_active ? "bg-[#d2ff1f]" : "bg-white/10"}`}
              >
                <span className={`block w-3 h-3 bg-white rounded-full shadow transition-transform mx-0.5 duration-200 ${item.is_active ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <input
                value={item.text}
                onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, text: e.target.value.toUpperCase() } : it))}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/20"
              />
              <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add new announcement…"
          className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-4 py-2.5 outline-none focus:border-white/40 placeholder-white/20"
        />
        <button onClick={addItem} className="border border-white/20 text-white/60 text-sm px-4 py-2.5 hover:border-white/50 hover:text-white transition-colors">+ Add</button>
      </div>

      <SaveBtn onClick={saveItems} pending={isPending} />
    </div>
  );
}

// ─── SECTIONS TAB ─────────────────────────────────────────────────────────────
const DEFAULT_SECTIONS: PageSection[] = [
  { id: "1", section_key: "hero",         title: "Hero Banner",         is_visible: true, order_index: 0 },
  { id: "2", section_key: "marquee",      title: "Announcement Bar",    is_visible: true, order_index: 1 },
  { id: "3", section_key: "categories",   title: "Featured Categories", is_visible: true, order_index: 2 },
  { id: "4", section_key: "new_arrivals", title: "New Arrivals",        is_visible: true, order_index: 3 },
  { id: "5", section_key: "editorial",    title: "Editorial Banner",    is_visible: true, order_index: 4 },
  { id: "6", section_key: "newsletter",   title: "Newsletter Signup",   is_visible: true, order_index: 5 },
];

function SectionsTab({ pageSections: init, isPending, startTransition, showToast }: TabProps) {
  const [sections, setSections] = useState<PageSection[]>(init.length > 0 ? init : DEFAULT_SECTIONS);

  function toggle(key: string) {
    const updated = sections.map((s) => s.section_key === key ? { ...s, is_visible: !s.is_visible } : s);
    setSections(updated);
    const s = updated.find((s) => s.section_key === key)!;
    startTransition(async () => {
      try { await updateSectionVisibility(key, s.is_visible); showToast("Section updated"); }
      catch { showToast("Failed", false); }
    });
  }

  function reorder(from: number, to: number) {
    const updated = move(sections, from, to).map((s, i) => ({ ...s, order_index: i }));
    setSections(updated);
    startTransition(async () => {
      try { await updateSectionOrder(updated.map((s) => ({ section_key: s.section_key, order_index: s.order_index }))); showToast("Order saved"); }
      catch { showToast("Failed", false); }
    });
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold text-base">Sections Manager</h2>
        <p className="text-white/30 text-xs">Reorder with arrows · Toggle visibility</p>
      </div>
      <div className="space-y-2">
        {sections.map((section, i) => (
          <div key={section.section_key} className={`flex items-start gap-3 p-4 border transition-colors ${section.is_visible ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02]"}`}>
            <ReorderBtns
              onUp={() => reorder(i, i - 1)}
              onDown={() => reorder(i, i + 1)}
              disableUp={i === 0} disableDown={i === sections.length - 1}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium ${section.is_visible ? "text-white" : "text-white/30"}`}>{section.title}</span>
                {!section.is_visible && <span className="text-[9px] bg-white/10 text-white/30 px-1.5 py-0.5 uppercase tracking-wider">Hidden</span>}
              </div>
              <p className="text-xs text-white/25 leading-relaxed">{SECTION_DESCRIPTIONS[section.section_key] ?? ""}</p>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => toggle(section.section_key)}
              disabled={isPending}
              className={`shrink-0 relative w-10 h-5 rounded-full transition-colors duration-200 ${section.is_visible ? "bg-[#d2ff1f]" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${section.is_visible ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>
      <p className="text-white/20 text-xs mt-4">Changes to visibility save instantly. Reorder saves automatically.</p>
    </div>
  );
}

// ─── NAVIGATION TAB ───────────────────────────────────────────────────────────
function NavTab({ navLinks: init, isPending, startTransition, showToast }: TabProps) {
  const [links, setLinks] = useState<NavLink[]>(
    init.length > 0 ? init : [{ label: "New Arrivals", href: "/", is_active: true, order_index: 0 }]
  );
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      try { await saveNavLinks(links); setSaved(true); setTimeout(() => setSaved(false), 2000); showToast("Navigation saved"); }
      catch { showToast("Failed to save", false); }
    });
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold text-base">Navigation Links</h2>
        <p className="text-white/30 text-xs">These appear in the top navbar</p>
      </div>

      <div className="space-y-2 mb-5">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2 p-3 bg-white/5 border border-white/10">
            <ReorderBtns
              onUp={() => setLinks(move(links, i, i - 1))}
              onDown={() => setLinks(move(links, i, i + 1))}
              disableUp={i === 0} disableDown={i === links.length - 1}
            />
            {/* Active toggle */}
            <button
              onClick={() => setLinks(links.map((l, idx) => idx === i ? { ...l, is_active: !l.is_active } : l))}
              className={`shrink-0 w-8 h-4 rounded-full transition-colors duration-200 ${link.is_active ? "bg-[#d2ff1f]" : "bg-white/10"}`}
            >
              <span className={`block w-3 h-3 bg-white rounded-full shadow transition-transform mx-0.5 duration-200 ${link.is_active ? "translate-x-4" : "translate-x-0"}`} />
            </button>
            <input
              value={link.label}
              onChange={(e) => setLinks(links.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l))}
              placeholder="Label"
              className="w-28 bg-transparent border-b border-white/10 text-white text-sm outline-none focus:border-white/40 pb-0.5"
            />
            <input
              value={link.href}
              onChange={(e) => setLinks(links.map((l, idx) => idx === i ? { ...l, href: e.target.value } : l))}
              placeholder="/path"
              className="flex-1 bg-transparent border-b border-white/10 text-white/60 text-sm outline-none focus:border-white/40 pb-0.5"
            />
            <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none">×</button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setLinks([...links, { label: "", href: "/", is_active: true, order_index: links.length }])}
          className="border border-white/20 text-white/50 text-sm px-4 py-2 hover:border-white/40 hover:text-white transition-colors"
        >
          + Add Link
        </button>
        <SaveBtn onClick={save} pending={isPending} label={saved ? "Saved ✓" : "Save Navigation"} />
      </div>
    </div>
  );
}

// ─── FOOTER TAB ───────────────────────────────────────────────────────────────
function FooterTab({ footerConfig: init, isPending, startTransition, showToast }: TabProps) {
  const [data, setData] = useState<FooterCfg>({
    copyright_text:   init?.copyright_text   ?? "",
    social_instagram: init?.social_instagram ?? "https://instagram.com",
    social_tiktok:    init?.social_tiktok    ?? "https://tiktok.com",
    social_pinterest: init?.social_pinterest ?? "https://pinterest.com",
    info_links:    init?.info_links    ?? [{ label: "About Us", href: "/about" }, { label: "Careers", href: "/about" }],
    support_links: init?.support_links ?? [{ label: "FAQ", href: "/faq" }, { label: "Shipping & Returns", href: "/shipping" }, { label: "Contact Us", href: "/contact" }],
  });

  function save() {
    startTransition(async () => {
      try { await saveFooterConfig(data); showToast("Footer saved"); }
      catch { showToast("Failed to save", false); }
    });
  }

  function LinkList({
    title, links, onChange,
  }: { title: string; links: { label: string; href: string }[]; onChange: (links: { label: string; href: string }[]) => void }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>{title}</Label>
          <button onClick={() => onChange([...links, { label: "", href: "/" }])} className="text-[10px] text-white/30 hover:text-white transition-colors">+ Add</button>
        </div>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={link.label}
                onChange={(e) => onChange(links.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l))}
                placeholder="Label"
                className="w-32 bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30"
              />
              <input
                value={link.href}
                onChange={(e) => onChange(links.map((l, idx) => idx === i ? { ...l, href: e.target.value } : l))}
                placeholder="/path"
                className="flex-1 bg-white/5 border border-white/10 text-white/60 text-sm px-3 py-2 outline-none focus:border-white/30"
              />
              <button onClick={() => onChange(links.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none">×</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-7">
      <h2 className="text-white font-semibold text-base">Footer Editor</h2>

      <Field label="Copyright Text">
        <Input value={data.copyright_text} onChange={(v) => setData({ ...data, copyright_text: v })} placeholder="Leave empty for default" />
      </Field>

      <div>
        <Label>Social Media URLs</Label>
        <div className="space-y-2">
          {(["social_instagram", "social_tiktok", "social_pinterest"] as const).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-white/30 w-20 capitalize">{key.replace("social_", "")}</span>
              <Input value={data[key]} onChange={(v) => setData({ ...data, [key]: v })} placeholder="https://…" />
            </div>
          ))}
        </div>
      </div>

      <LinkList
        title="Company Links"
        links={data.info_links}
        onChange={(links) => setData({ ...data, info_links: links })}
      />

      <LinkList
        title="Support Links"
        links={data.support_links}
        onChange={(links) => setData({ ...data, support_links: links })}
      />

      <SaveBtn onClick={save} pending={isPending} label="Save Footer" />
    </div>
  );
}

// ─── BANNERS TAB ──────────────────────────────────────────────────────────────
const EMPTY_BANNER: Banner = { title: "", subtitle: "", image_url: "", link_url: "/", is_active: true, order_index: 0 };

function BannersTab({ banners: init, isPending, startTransition, showToast }: TabProps) {
  const [banners, setBanners] = useState<Banner[]>(init);
  const [editing, setEditing] = useState<(Banner & { _idx?: number }) | null>(null);

  function openNew() { setEditing({ ...EMPTY_BANNER, order_index: banners.length }); }
  function openEdit(b: Banner, idx: number) { setEditing({ ...b, _idx: idx }); }

  function save() {
    if (!editing) return;
    startTransition(async () => {
      try {
        await saveBanner(editing);
        showToast(editing.id ? "Banner updated" : "Banner added");
        if (editing.id) {
          setBanners(banners.map((b) => b.id === editing.id ? editing : b));
        } else {
          setBanners([...banners, { ...editing, id: `tmp-${Date.now()}` }]);
        }
        setEditing(null);
      } catch { showToast("Failed to save", false); }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try { await deleteBanner(id); setBanners(banners.filter((b) => b.id !== id)); showToast("Banner deleted"); }
      catch { showToast("Failed to delete", false); }
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-base">Banners Manager</h2>
          <p className="text-white/30 text-xs mt-0.5">Upload images with overlaid text and links</p>
        </div>
        <button onClick={openNew} className="bg-white text-[#111111] text-xs font-semibold px-4 py-2 hover:bg-[#d2ff1f] transition-colors">
          + New Banner
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="mb-6 p-6 bg-white/5 border border-white/20 space-y-5">
          <h3 className="text-white text-sm font-semibold">{editing.id ? "Edit Banner" : "New Banner"}</h3>

          <ImageUploader value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} label="Banner Image" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Title">
              <Input value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="Banner title" />
            </Field>
            <Field label="Link URL">
              <Input value={editing.link_url} onChange={(v) => setEditing({ ...editing, link_url: v })} placeholder="/" />
            </Field>
          </div>

          <Field label="Subtitle">
            <Input value={editing.subtitle} onChange={(v) => setEditing({ ...editing, subtitle: v })} placeholder="Optional subtitle text" />
          </Field>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={editing.is_active}
              onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              className="w-4 h-4 accent-[#d2ff1f]"
            />
            <span className="text-sm text-white/70">Active (visible on site)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <SaveBtn onClick={save} pending={isPending} label={editing.id ? "Update Banner" : "Add Banner"} />
            <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="text-center py-16 border border-white/5 text-white/20 text-sm">
          No banners yet. Create your first one above.
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b, i) => (
            <div key={b.id ?? i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10">
              {/* Thumbnail */}
              <div className="w-20 h-14 overflow-hidden shrink-0 bg-white/5">
                {b.image_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">No image</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{b.title || "(Untitled)"}</p>
                <p className="text-xs text-white/30 truncate">{b.link_url}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 ${b.is_active ? "bg-[#d2ff1f] text-[#111111]" : "bg-white/10 text-white/30"}`}>
                {b.is_active ? "Live" : "Hidden"}
              </span>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => openEdit(b, i)} className="text-white/40 hover:text-white text-xs transition-colors">Edit</button>
                <button onClick={() => b.id && remove(b.id)} className="text-white/20 hover:text-red-400 text-xs transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
