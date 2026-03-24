"use client";

import { useState, useTransition } from "react";
import {
  saveMarqueeItems,
  updateSectionVisibility,
  saveNavLinks,
  saveFooterConfig,
  saveBanner,
  deleteBanner,
  saveHeroSettings,
} from "./actions";

type MarqueeItem = { id?: string; text: string; is_active: boolean; order_index: number };
type PageSection = { id: string; section_key: string; title: string; is_visible: boolean; order_index: number };
type NavLink = { id?: string; label: string; href: string; is_active: boolean; order_index: number };
type FooterConfig = {
  copyright_text: string;
  social_instagram: string;
  social_tiktok: string;
  social_pinterest: string;
  info_links: { label: string; href: string }[];
  support_links: { label: string; href: string }[];
};
type Banner = { id?: string; title: string; subtitle: string; image_url: string; link_url: string; is_active: boolean; order_index: number };

type Props = {
  marqueeItems: MarqueeItem[];
  pageSections: PageSection[];
  navLinks: NavLink[];
  footerConfig: FooterConfig | null;
  banners: Banner[];
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
};

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "marquee", label: "Announcement Bar" },
  { key: "sections", label: "Sections" },
  { key: "nav", label: "Navigation" },
  { key: "footer", label: "Footer" },
  { key: "banners", label: "Banners" },
];

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 text-sm font-medium shadow-lg ${ok ? "bg-[#111111] text-white" : "bg-red-500 text-white"}`}>
      {msg}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
export default function PagesClient({ marqueeItems, pageSections, navLinks, footerConfig, banners, heroTitle, heroSubtitle, heroImageUrl }: Props) {
  const [tab, setTab] = useState("hero");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div>
      {toast && <Toast {...toast} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Page Builder</h1>
          <p className="text-white/40 text-sm mt-1">Customize your storefront content</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${tab === t.key ? "bg-white text-[#111111] font-medium" : "text-white/50 hover:text-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
        {tab === "hero" && <HeroTab heroTitle={heroTitle} heroSubtitle={heroSubtitle} heroImageUrl={heroImageUrl} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "marquee" && <MarqueeTab items={marqueeItems} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "sections" && <SectionsTab sections={pageSections} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "nav" && <NavTab links={navLinks} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "footer" && <FooterTab config={footerConfig} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
        {tab === "banners" && <BannersTab banners={banners} isPending={isPending} startTransition={startTransition} showToast={showToast} />}
      </div>
    </div>
  );
}

// ── Hero Tab ─────────────────────────────────────────────────────────────────
function HeroTab({ heroTitle, heroSubtitle, heroImageUrl, isPending, startTransition, showToast }: {
  heroTitle: string; heroSubtitle: string; heroImageUrl: string;
  isPending: boolean; startTransition: (fn: () => void) => void; showToast: (msg: string, ok?: boolean) => void;
}) {
  const [title, setTitle] = useState(heroTitle);
  const [subtitle, setSubtitle] = useState(heroSubtitle);
  const [imageUrl, setImageUrl] = useState(heroImageUrl);

  function save() {
    startTransition(async () => {
      try {
        await saveHeroSettings({ hero_title: title, hero_subtitle: subtitle, hero_image_url: imageUrl });
        showToast("Hero saved ✓");
      } catch {
        showToast("Failed to save", false);
      }
    });
  }

  return (
    <div className="space-y-5 max-w-xl">
      <h2 className="text-white font-medium mb-6">Hero Banner</h2>
      <div>
        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Headline</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-white/30 transition-colors"
          placeholder="New Season Arrivals" />
      </div>
      <div>
        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Subheadline</label>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-white/30 transition-colors"
          placeholder="Discover curated pieces..." />
      </div>
      <div>
        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Background Image URL</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-white/30 transition-colors"
          placeholder="https://..." />
        {imageUrl && (
          <div className="mt-3 relative h-40 bg-white/5 overflow-hidden">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover opacity-70" />
          </div>
        )}
      </div>
      <button onClick={save} disabled={isPending}
        className="bg-white text-[#111111] text-sm font-medium px-6 py-2.5 hover:bg-white/90 transition-colors disabled:opacity-50">
        {isPending ? "Saving…" : "Save Hero"}
      </button>
    </div>
  );
}

// ── Marquee Tab ───────────────────────────────────────────────────────────────
function MarqueeTab({ items: initialItems, isPending, startTransition, showToast }: {
  items: MarqueeItem[]; isPending: boolean; startTransition: (fn: () => void) => void; showToast: (msg: string, ok?: boolean) => void;
}) {
  const [items, setItems] = useState<MarqueeItem[]>(
    initialItems.length > 0 ? initialItems : [{ text: "", is_active: true, order_index: 0 }]
  );

  function add() { setItems([...items, { text: "", is_active: true, order_index: items.length }]); }
  function remove(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  function update(i: number, field: keyof MarqueeItem, value: string | boolean) {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function save() {
    startTransition(async () => {
      try {
        await saveMarqueeItems(items);
        showToast("Marquee saved ✓");
      } catch {
        showToast("Failed to save", false);
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-white font-medium mb-6">Announcement Bar</h2>
      <div className="space-y-3 mb-5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={item.is_active}
              onChange={(e) => update(i, "is_active", e.target.checked)}
              className="w-4 h-4 accent-[#d2ff1f]"
            />
            <input
              value={item.text}
              onChange={(e) => update(i, "text", e.target.value)}
              placeholder="Announcement text..."
              className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
            />
            <button onClick={() => remove(i)} className="text-white/30 hover:text-red-400 transition-colors text-lg leading-none">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={add} className="border border-white/20 text-white/60 text-sm px-4 py-2 hover:border-white/40 hover:text-white transition-colors">
          + Add Item
        </button>
        <button onClick={save} disabled={isPending} className="bg-white text-[#111111] text-sm font-medium px-6 py-2 hover:bg-white/90 transition-colors disabled:opacity-50">
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Sections Tab ─────────────────────────────────────────────────────────────
function SectionsTab({ sections, isPending, startTransition, showToast }: {
  sections: PageSection[]; isPending: boolean; startTransition: (fn: () => void) => void; showToast: (msg: string, ok?: boolean) => void;
}) {
  const defaultSections = [
    { id: "1", section_key: "hero", title: "Hero Banner", is_visible: true, order_index: 0 },
    { id: "2", section_key: "marquee", title: "Announcement Bar", is_visible: true, order_index: 1 },
    { id: "3", section_key: "categories", title: "Featured Categories", is_visible: true, order_index: 2 },
    { id: "4", section_key: "new_arrivals", title: "New Arrivals", is_visible: true, order_index: 3 },
    { id: "5", section_key: "editorial", title: "Editorial Banner", is_visible: true, order_index: 4 },
    { id: "6", section_key: "newsletter", title: "Newsletter Signup", is_visible: true, order_index: 5 },
  ];

  const [localSections, setLocalSections] = useState<PageSection[]>(sections.length > 0 ? sections : defaultSections);

  function toggle(key: string) {
    const updated = localSections.map((s) => s.section_key === key ? { ...s, is_visible: !s.is_visible } : s);
    setLocalSections(updated);
    const section = updated.find((s) => s.section_key === key)!;
    startTransition(async () => {
      try {
        await updateSectionVisibility(key, section.is_visible);
        showToast("Section updated ✓");
      } catch {
        showToast("Failed to update", false);
      }
    });
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-white font-medium mb-2">Sections Manager</h2>
      <p className="text-white/40 text-xs mb-6">Toggle sections on or off for the homepage.</p>
      <div className="space-y-2">
        {localSections.map((section) => (
          <div key={section.section_key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-white/20 text-xs font-mono w-4">{section.order_index + 1}</span>
              <span className="text-sm text-white">{section.title}</span>
            </div>
            <button
              onClick={() => toggle(section.section_key)}
              disabled={isPending}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${section.is_visible ? "bg-[#d2ff1f]" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${section.is_visible ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Nav Tab ───────────────────────────────────────────────────────────────────
function NavTab({ links: initialLinks, isPending, startTransition, showToast }: {
  links: NavLink[]; isPending: boolean; startTransition: (fn: () => void) => void; showToast: (msg: string, ok?: boolean) => void;
}) {
  const [links, setLinks] = useState<NavLink[]>(
    initialLinks.length > 0 ? initialLinks : [{ label: "New Arrivals", href: "/", is_active: true, order_index: 0 }]
  );

  function add() { setLinks([...links, { label: "", href: "/", is_active: true, order_index: links.length }]); }
  function remove(i: number) { setLinks(links.filter((_, idx) => idx !== i)); }
  function update(i: number, field: keyof NavLink, value: string | boolean) {
    setLinks(links.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function save() {
    startTransition(async () => {
      try {
        await saveNavLinks(links);
        showToast("Navigation saved ✓");
      } catch {
        showToast("Failed to save", false);
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-white font-medium mb-6">Navigation Links</h2>
      <div className="space-y-3 mb-5">
        {links.map((link, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3">
            <input
              type="checkbox"
              checked={link.is_active}
              onChange={(e) => update(i, "is_active", e.target.checked)}
              className="w-4 h-4 accent-[#d2ff1f]"
            />
            <input
              value={link.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Label"
              className="bg-white/5 border border-white/10 text-white text-sm px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
            />
            <input
              value={link.href}
              onChange={(e) => update(i, "href", e.target.value)}
              placeholder="/path"
              className="bg-white/5 border border-white/10 text-white text-sm px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
            />
            <button onClick={() => remove(i)} className="text-white/30 hover:text-red-400 transition-colors text-lg leading-none">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={add} className="border border-white/20 text-white/60 text-sm px-4 py-2 hover:border-white/40 hover:text-white transition-colors">
          + Add Link
        </button>
        <button onClick={save} disabled={isPending} className="bg-white text-[#111111] text-sm font-medium px-6 py-2 hover:bg-white/90 transition-colors disabled:opacity-50">
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Footer Tab ────────────────────────────────────────────────────────────────
function FooterTab({ config, isPending, startTransition, showToast }: {
  config: FooterConfig | null; isPending: boolean; startTransition: (fn: () => void) => void; showToast: (msg: string, ok?: boolean) => void;
}) {
  const [data, setData] = useState<FooterConfig>({
    copyright_text: config?.copyright_text ?? "",
    social_instagram: config?.social_instagram ?? "https://instagram.com",
    social_tiktok: config?.social_tiktok ?? "https://tiktok.com",
    social_pinterest: config?.social_pinterest ?? "https://pinterest.com",
    info_links: config?.info_links ?? [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/about" },
    ],
    support_links: config?.support_links ?? [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Returns", href: "/shipping" },
      { label: "Contact Us", href: "/contact" },
    ],
  });

  function addInfoLink() { setData({ ...data, info_links: [...data.info_links, { label: "", href: "/" }] }); }
  function removeInfoLink(i: number) { setData({ ...data, info_links: data.info_links.filter((_, idx) => idx !== i) }); }
  function updateInfoLink(i: number, field: "label" | "href", value: string) {
    setData({ ...data, info_links: data.info_links.map((l, idx) => idx === i ? { ...l, [field]: value } : l) });
  }

  function addSupportLink() { setData({ ...data, support_links: [...data.support_links, { label: "", href: "/" }] }); }
  function removeSupportLink(i: number) { setData({ ...data, support_links: data.support_links.filter((_, idx) => idx !== i) }); }
  function updateSupportLink(i: number, field: "label" | "href", value: string) {
    setData({ ...data, support_links: data.support_links.map((l, idx) => idx === i ? { ...l, [field]: value } : l) });
  }

  function save() {
    startTransition(async () => {
      try {
        await saveFooterConfig(data);
        showToast("Footer saved ✓");
      } catch {
        showToast("Failed to save", false);
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-white font-medium">Footer Editor</h2>

      <div>
        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Copyright Text</label>
        <input value={data.copyright_text} onChange={(e) => setData({ ...data, copyright_text: e.target.value })}
          className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
          placeholder="Leave empty to use default" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["social_instagram", "social_tiktok", "social_pinterest"] as const).map((key) => (
          <div key={key}>
            <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">{key.replace("social_", "")}</label>
            <input value={data[key]} onChange={(e) => setData({ ...data, [key]: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-white/30 transition-colors"
              placeholder="https://..." />
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-white/50 uppercase tracking-wider">Company Links</label>
          <button onClick={addInfoLink} className="text-xs text-white/40 hover:text-white transition-colors">+ Add</button>
        </div>
        <div className="space-y-2">
          {data.info_links.map((link, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input value={link.label} onChange={(e) => updateInfoLink(i, "label", e.target.value)}
                placeholder="Label" className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30" />
              <input value={link.href} onChange={(e) => updateInfoLink(i, "href", e.target.value)}
                placeholder="/path" className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30" />
              <button onClick={() => removeInfoLink(i)} className="text-white/30 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-white/50 uppercase tracking-wider">Support Links</label>
          <button onClick={addSupportLink} className="text-xs text-white/40 hover:text-white transition-colors">+ Add</button>
        </div>
        <div className="space-y-2">
          {data.support_links.map((link, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input value={link.label} onChange={(e) => updateSupportLink(i, "label", e.target.value)}
                placeholder="Label" className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30" />
              <input value={link.href} onChange={(e) => updateSupportLink(i, "href", e.target.value)}
                placeholder="/path" className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30" />
              <button onClick={() => removeSupportLink(i)} className="text-white/30 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={isPending} className="bg-white text-[#111111] text-sm font-medium px-6 py-2.5 hover:bg-white/90 transition-colors disabled:opacity-50">
        {isPending ? "Saving…" : "Save Footer"}
      </button>
    </div>
  );
}

// ── Banners Tab ───────────────────────────────────────────────────────────────
function BannersTab({ banners: initialBanners, isPending, startTransition, showToast }: {
  banners: Banner[]; isPending: boolean; startTransition: (fn: () => void) => void; showToast: (msg: string, ok?: boolean) => void;
}) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isNew, setIsNew] = useState(false);

  function openNew() {
    setEditing({ title: "", subtitle: "", image_url: "", link_url: "/", is_active: true, order_index: banners.length });
    setIsNew(true);
  }

  function openEdit(b: Banner) {
    setEditing({ ...b });
    setIsNew(false);
  }

  function save() {
    if (!editing) return;
    startTransition(async () => {
      try {
        await saveBanner(editing);
        showToast(isNew ? "Banner added ✓" : "Banner updated ✓");
        setBanners(isNew
          ? [...banners, { ...editing, id: Date.now().toString() }]
          : banners.map((b) => b.id === editing.id ? editing : b)
        );
        setEditing(null);
      } catch {
        showToast("Failed to save", false);
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deleteBanner(id);
        setBanners(banners.filter((b) => b.id !== id));
        showToast("Banner deleted ✓");
      } catch {
        showToast("Failed to delete", false);
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-medium">Banners Manager</h2>
        <button onClick={openNew} className="bg-white text-[#111111] text-xs font-medium px-4 py-2 hover:bg-white/90 transition-colors">
          + New Banner
        </button>
      </div>

      {editing && (
        <div className="mb-6 p-5 bg-white/5 border border-white/20 space-y-4">
          <h3 className="text-white text-sm font-medium">{isNew ? "New Banner" : "Edit Banner"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Title</label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30" placeholder="Banner title" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Link URL</label>
              <input value={editing.link_url} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30" placeholder="/" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Subtitle</label>
            <input value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30" placeholder="Banner subtitle" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Image URL</label>
            <input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30" placeholder="https://..." />
            {editing.image_url && (
              <div className="mt-2 h-28 overflow-hidden">
                <img src={editing.image_url} alt="" className="w-full h-full object-cover opacity-60" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="w-4 h-4 accent-[#d2ff1f]" />
              <span className="text-sm text-white/70">Active</span>
            </label>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={isPending} className="bg-white text-[#111111] text-sm font-medium px-5 py-2 hover:bg-white/90 disabled:opacity-50">
              {isPending ? "Saving…" : "Save Banner"}
            </button>
            <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          No banners yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10">
              {b.image_url && (
                <div className="w-16 h-12 overflow-hidden shrink-0">
                  <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{b.title || "(Untitled)"}</p>
                <p className="text-xs text-white/40 truncate">{b.link_url}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 ${b.is_active ? "bg-[#d2ff1f] text-[#111111]" : "bg-white/10 text-white/40"}`}>
                {b.is_active ? "Active" : "Hidden"}
              </span>
              <button onClick={() => openEdit(b)} className="text-white/40 hover:text-white text-xs transition-colors">Edit</button>
              <button onClick={() => b.id && remove(b.id)} className="text-white/30 hover:text-red-400 text-xs transition-colors">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
