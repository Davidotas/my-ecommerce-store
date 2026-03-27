"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/products";

// ─── Step data ────────────────────────────────────────────────────────────────

const PRODUCT_TYPES = [
  { id: "Bowl",       icon: "🥣" },
  { id: "Spoon",      icon: "🥄" },
  { id: "Tag",        icon: "🏷️" },
  { id: "Wall Art",   icon: "🖼️" },
  { id: "Key Holder", icon: "🗝️" },
  { id: "Sculpture",  icon: "🗿" },
  { id: "Plate",      icon: "🍽️" },
  { id: "Frame",      icon: "🪟" },
];

const ALL_SHAPES = [
  { id: "Round",    path: "M50,10 a40,40 0 1,0 0.001,0 Z" },
  { id: "Oval",     path: "M50,22 a35,28 0 1,0 0.001,0 Z" },
  { id: "Square",   path: "M15,15 h70 v70 h-70 Z" },
  { id: "Abstract", path: "M20,70 Q50,10 80,70 Q65,90 35,85 Z" },
  { id: "Natural",  path: "M20,60 Q30,20 50,15 Q70,20 80,55 Q75,80 50,85 Q25,80 20,60 Z" },
  { id: "Carved",   path: "M50,15 L85,50 L70,85 L30,85 L15,50 Z" },
];

const SHAPES_BY_PRODUCT: Record<string, string[]> = {
  Bowl:        ["Round", "Oval", "Natural"],
  Spoon:       ["Round", "Oval", "Natural", "Carved"],
  Tag:         ["Round", "Oval", "Square", "Abstract"],
  "Wall Art":  ["Round", "Square", "Abstract", "Natural"],
  "Key Holder":["Square", "Abstract", "Natural", "Carved"],
  Sculpture:   ["Round", "Abstract", "Natural", "Carved"],
  Plate:       ["Round", "Oval", "Square"],
  Frame:       ["Square", "Natural"],
};

const SIZES = [
  { id: "Small",  dim: "10 × 10 cm",  addon: 0 },
  { id: "Medium", dim: "15 × 15 cm",  addon: 1000 },
  { id: "Large",  dim: "25 × 25 cm",  addon: 2000 },
  { id: "Custom", dim: "You specify", addon: 3000 },
];

const WOODS = [
  { id: "Oak",                  color: "#c8a96e", addon: 0,    desc: "Durable & classic" },
  { id: "Walnut",               color: "#5c3d23", addon: 1000, desc: "Rich dark grain",    badge: "Most Popular" },
  { id: "Mahogany",             color: "#6b2c20", addon: 1500, desc: "Deep reddish tones" },
  { id: "Reclaimed Mixed Wood", color: "#8b6f4e", addon: 0,    desc: "Eco-friendly & unique" },
];

const PATTERNS = [
  { id: "Minimal", desc: "Clean lines, no frills" },
  { id: "Tribal",  desc: "Traditional African motifs" },
  { id: "Modern",  desc: "Geometric & sleek" },
  { id: "Rustic",  desc: "Organic & weathered" },
];

const FINISHES = [
  { id: "Smooth Polished", desc: "Silky to the touch",          bg: "linear-gradient(135deg,#e0d0b0,#f5edd8)" },
  { id: "Matte",           desc: "Non-reflective natural look",  bg: "#c8a96e" },
  { id: "Rough/Raw",       desc: "Textured, as-found feel",      bg: "repeating-linear-gradient(45deg,#a07048,#a07048 2px,#c8a96e 2px,#c8a96e 6px)" },
  { id: "Burnt Finish",    desc: "Shou sugi ban style",          bg: "#2a1a0a" },
  { id: "Glossy",          desc: "High sheen & reflective",      bg: "linear-gradient(135deg,#f8f0d8,#ffe8a0)" },
];

const COLOURS = [
  { id: "Natural",     hex: "#c8a96e" },
  { id: "Dark Stain",  hex: "#3b2a1a" },
  { id: "Light Stain", hex: "#e0c9a0" },
  { id: "Ebony",       hex: "#1a1a1a" },
  { id: "Custom",      hex: null },
];

const ADDONS = [
  { id: "Handle Carving",        label: "Handle Carving",        price: 500  },
  { id: "Hanging Hook",          label: "Hanging Hook",          price: 300  },
  { id: "Gift Packaging",        label: "Gift Packaging",        price: 800  },
  { id: "Protective Coating",    label: "Protective Coating",    price: 400  },
  { id: "Rush Order - 3 days",   label: "Rush Order (3 days)",   price: 1500 },
];

const OCCASIONS = [
  { id: "Wedding",          icon: "💍" },
  { id: "Birthday",         icon: "🎂" },
  { id: "Anniversary",      icon: "🥂" },
  { id: "Housewarming",     icon: "🏡" },
  { id: "Corporate Gift",   icon: "💼" },
  { id: "Personal Use",     icon: "😊" },
];

const VIBES = [
  {
    id: "Romantic", label: "Romantic", emoji: "🌹",
    fills: { productType: "Bowl", shape: "Round", wood: "Walnut", finish: "Smooth Polished", colour: "Light Stain", patternStyle: "Minimal", occasion: "Wedding" },
  },
  {
    id: "Traditional African", label: "Traditional African", emoji: "🌍",
    fills: { productType: "Wall Art", shape: "Natural", wood: "Reclaimed Mixed Wood", finish: "Rough/Raw", colour: "Natural", patternStyle: "Tribal", occasion: "Personal Use" },
  },
  {
    id: "Modern Luxury", label: "Modern Luxury", emoji: "✨",
    fills: { productType: "Frame", shape: "Square", wood: "Mahogany", finish: "Glossy", colour: "Ebony", patternStyle: "Modern", occasion: "Corporate Gift" },
  },
  {
    id: "Nature-Inspired", label: "Nature-Inspired", emoji: "🌿",
    fills: { productType: "Sculpture", shape: "Natural", wood: "Oak", finish: "Matte", colour: "Natural", patternStyle: "Rustic", occasion: "Housewarming" },
  },
];

// ─── Types & defaults ─────────────────────────────────────────────────────────

type Selections = {
  productType:      string;
  shape:            string;
  size:             string;
  customWidth:      string;
  customHeight:     string;
  wood:             string;
  engravingText:    string;
  uploadedImageName:string;
  patternStyle:     string;
  finish:           string;
  colour:           string;
  addons:           string[];
  occasion:         string;
  notes:            string;
  vibe:             string;
};

const DEFAULT: Selections = {
  productType: "", shape: "", size: "Small", customWidth: "", customHeight: "",
  wood: "", engravingText: "", uploadedImageName: "", patternStyle: "Minimal",
  finish: "", colour: "Natural", addons: [], occasion: "", notes: "", vibe: "",
};

// ─── Price & prompt helpers ───────────────────────────────────────────────────

const BASE_PRICE = 2500;

function calcPrice(s: Selections): number {
  let p = BASE_PRICE;
  p += WOODS.find(w => w.id === s.wood)?.addon ?? 0;
  p += SIZES.find(sz => sz.id === s.size)?.addon ?? 0;
  if (s.engravingText.trim()) p += 800;
  if (s.uploadedImageName) p += 1200;
  for (const id of s.addons) p += ADDONS.find(a => a.id === id)?.price ?? 0;
  return p;
}

function fmt(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

const VIBE_MOOD: Record<string, string> = {
  "Romantic":           "warm, intimate and romantic",
  "Traditional African":"bold, cultural and rooted in tradition",
  "Modern Luxury":      "sleek, premium and contemporary",
  "Nature-Inspired":    "earthy, organic and calming",
};

function generatePrompt(s: Selections): string {
  const mood = VIBE_MOOD[s.vibe] || "timeless and artisanal";
  const sizeStr = s.size === "Custom" && (s.customWidth || s.customHeight)
    ? `Custom (${s.customWidth || "?"}×${s.customHeight || "?"}cm)`
    : s.size;
  return [
    `Create a handcrafted wooden ${s.productType || "product"} with:`,
    `Shape: ${s.shape || "Not specified"}, Size: ${sizeStr}, Wood: ${s.wood || "Not specified"}`,
    `Finish: ${s.finish || "Not specified"}, Colour: ${s.colour || "Not specified"}`,
    `Engraving: ${s.engravingText || "None"}, Style: ${s.patternStyle}`,
    `Occasion: ${s.occasion || "Not specified"}`,
    `Notes: ${s.notes || "None"}`,
    `The design should feel ${mood}`,
  ].join("\n");
}

// ─── Shared card component ────────────────────────────────────────────────────

function Card({
  selected, onClick, children, className = "",
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-2 p-4 text-left transition-all duration-150 w-full ${
        selected
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-[#e8e8e5] hover:border-[#111111] bg-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StepHeader({ num, title, subtitle }: { num: number; title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] font-medium mb-1">Step {num}</p>
      <h2 className="text-2xl font-semibold text-[#111111] tracking-tight">{title}</h2>
      <p className="text-sm text-[#6b7280] mt-1">{subtitle}</p>
    </div>
  );
}

// ─── Quick mode step list ─────────────────────────────────────────────────────

const QUICK_STEPS = [1, 3, 5, 10];
const TOTAL_STEPS = 10;

// ─── Main component ───────────────────────────────────────────────────────────

export default function CustomizerClient() {
  const router = useRouter();
  const { addCustomizedItem } = useCart();

  const [step, setStep]                   = useState(1);
  const [sel, setSel]                     = useState<Selections>(DEFAULT);
  const [quickMode, setQuickMode]         = useState(false);
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [aiLoading, setAiLoading]         = useState(false);
  const [aiError, setAiError]             = useState("");
  const [added, setAdded]                 = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const steps = quickMode ? QUICK_STEPS : Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);
  const stepIdx = steps.indexOf(step);
  const progress = ((stepIdx + 1) / steps.length) * 100;

  function update<K extends keyof Selections>(field: K, value: Selections[K]) {
    setSel(prev => ({ ...prev, [field]: value }));
  }

  function goNext() {
    const next = steps[stepIdx + 1];
    if (next) setStep(next);
  }

  function goPrev() {
    const prev = steps[stepIdx - 1];
    if (prev !== undefined) setStep(prev);
  }

  function canProceed(): boolean {
    if (step === 1) return !!sel.productType;
    if (step === 2) return !!sel.shape;
    if (step === 4) return !!sel.wood;
    if (step === 6) return !!sel.finish;
    return true;
  }

  function applyVibe(v: typeof VIBES[0]) {
    setSel(prev => ({ ...prev, ...v.fills, vibe: v.id }));
    setInspirationOpen(false);
    setStep(quickMode ? 3 : 3);
  }

  async function getAiSuggestion() {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: sel.productType, occasion: sel.occasion }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSel(prev => ({
        ...prev,
        shape:         data.shape         ?? prev.shape,
        wood:          data.wood          ?? prev.wood,
        finish:        data.finish        ?? prev.finish,
        engravingText: data.engravingIdea ?? prev.engravingText,
        patternStyle:  data.patternStyle  ?? prev.patternStyle,
        colour:        data.colour        ?? prev.colour,
      }));
    } catch {
      setAiError("AI suggestion failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleAddToCart() {
    const price  = calcPrice(sel);
    const prompt = generatePrompt(sel);
    const fullData = { ...sel, smartPrompt: prompt };

    const product: Product = {
      id:            "custom-order",
      name:          `Custom ${sel.productType || "Wood Creation"}`,
      description:   `Handcrafted ${sel.wood} ${sel.productType}${sel.shape ? `, ${sel.shape} shape` : ""}`,
      price,
      compareAtPrice: null,
      image:          "",
      images:         [],
      category:       "Custom",
      categoryId:     null,
      stock:          999,
      createdAt:      new Date().toISOString(),
    };

    addCustomizedItem(product, {
      fabricJson:    JSON.stringify(fullData),
      previewDataUrl: "",
      summary:       `${sel.wood} ${sel.productType}, ${sel.size}${sel.engravingText ? ` · "${sel.engravingText.slice(0, 20)}${sel.engravingText.length > 20 ? "…" : ""}"` : ""}`,
      productId:     "custom-order",
    });

    setAdded(true);
    setTimeout(() => router.push("/cart"), 1200);
  }

  const price = calcPrice(sel);

  // ─── Render step content ──────────────────────────────────────────────────────

  function renderStep() {
    // ── Step 1: Product Type ──────────────────────────────────────────────────
    if (step === 1) return (
      <div>
        <StepHeader num={1} title="Choose Product Type" subtitle="What would you like us to create?" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRODUCT_TYPES.map(pt => (
            <Card
              key={pt.id}
              selected={sel.productType === pt.id}
              onClick={() => {
                update("productType", pt.id);
                const valid = SHAPES_BY_PRODUCT[pt.id] ?? [];
                if (sel.shape && !valid.includes(sel.shape)) update("shape", "");
              }}
              className="flex flex-col items-center gap-2 py-6"
            >
              <span className="text-3xl">{pt.icon}</span>
              <span className="text-xs font-medium">{pt.id}</span>
            </Card>
          ))}
        </div>
      </div>
    );

    // ── Step 2: Shape ─────────────────────────────────────────────────────────
    if (step === 2) {
      const available = sel.productType
        ? (SHAPES_BY_PRODUCT[sel.productType] ?? ALL_SHAPES.map(s => s.id))
        : ALL_SHAPES.map(s => s.id);
      const shapes = ALL_SHAPES.filter(s => available.includes(s.id));
      return (
        <div>
          <StepHeader num={2} title="Choose Shape & Style" subtitle={`Available shapes for ${sel.productType || "your product"}`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shapes.map(shape => (
              <Card
                key={shape.id}
                selected={sel.shape === shape.id}
                onClick={() => update("shape", shape.id)}
                className="flex flex-col items-center gap-3 py-6"
              >
                <svg width="64" height="64" viewBox="0 0 100 100">
                  <path
                    d={shape.path}
                    strokeWidth="2"
                    className={sel.shape === shape.id ? "fill-white/20 stroke-white" : "fill-[#f5f5f3] stroke-[#9ca3af]"}
                  />
                </svg>
                <span className="text-xs font-medium">{shape.id}</span>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // ── Step 3: Size ──────────────────────────────────────────────────────────
    if (step === 3) return (
      <div>
        <StepHeader num={3} title="Select Size" subtitle="All sizes are approximate" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {SIZES.map(sz => (
            <Card
              key={sz.id}
              selected={sel.size === sz.id}
              onClick={() => update("size", sz.id)}
              className="flex flex-col gap-1.5"
            >
              <p className="text-sm font-semibold">{sz.id}</p>
              <p className="text-xs opacity-70">{sz.dim}</p>
              {sz.addon > 0 && <p className="text-[11px] font-medium mt-1 opacity-80">+{fmt(sz.addon)}</p>}
            </Card>
          ))}
        </div>
        {sel.size === "Custom" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4 max-w-xs"
          >
            {[
              { label: "Width (cm)", field: "customWidth" as const, placeholder: "e.g. 30" },
              { label: "Height (cm)", field: "customHeight" as const, placeholder: "e.g. 20" },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="text-[10px] tracking-[0.3em] uppercase text-[#9ca3af] block mb-1.5">{label}</label>
                <input
                  type="number"
                  value={sel[field]}
                  onChange={e => update(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-[#e8e8e5] px-3 py-2.5 text-sm outline-none focus:border-[#111111] transition-colors"
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    );

    // ── Step 4: Wood ──────────────────────────────────────────────────────────
    if (step === 4) return (
      <div>
        <StepHeader num={4} title="Choose Wood Type" subtitle="Each wood has a unique character and grain" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WOODS.map(wood => (
            <Card
              key={wood.id}
              selected={sel.wood === wood.id}
              onClick={() => update("wood", wood.id)}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 flex-shrink-0 rounded" style={{ backgroundColor: wood.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-sm font-semibold">{wood.id}</p>
                  {wood.badge && (
                    <span className={`text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 font-bold ${sel.wood === wood.id ? "bg-white/20 text-white" : "bg-[#d2ff1f] text-[#111]"}`}>
                      {wood.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-70">{wood.desc}</p>
                {wood.addon > 0 && <p className="text-xs font-medium mt-1 opacity-80">+{fmt(wood.addon)}</p>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );

    // ── Step 5: Design & Engraving ────────────────────────────────────────────
    if (step === 5) return (
      <div>
        <StepHeader num={5} title="Design & Engraving" subtitle="Personalise your piece" />

        <div className="mb-7">
          <label className="text-[10px] tracking-[0.35em] uppercase text-[#9ca3af] font-medium block mb-2">
            Text Engraving <span className="normal-case tracking-normal font-normal ml-1 text-[#6b7280]">(+£8)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={sel.engravingText}
              onChange={e => update("engravingText", e.target.value.slice(0, 50))}
              placeholder="Name, date, or short quote…"
              className="w-full border border-[#e8e8e5] px-4 py-3 text-sm outline-none focus:border-[#111111] transition-colors pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af]">
              {sel.engravingText.length}/50
            </span>
          </div>
        </div>

        <div className="mb-7">
          <label className="text-[10px] tracking-[0.35em] uppercase text-[#9ca3af] font-medium block mb-2">
            Upload Image / Logo <span className="normal-case tracking-normal font-normal ml-1 text-[#6b7280]">(+£12)</span>
          </label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => update("uploadedImageName", e.target.files?.[0]?.name ?? "")} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="border border-[#e8e8e5] px-5 py-2.5 text-sm text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-all">
              Choose File
            </button>
            {sel.uploadedImageName
              ? <span className="text-sm text-[#111111] truncate max-w-[200px]">{sel.uploadedImageName}</span>
              : <span className="text-sm text-[#9ca3af]">No file chosen</span>}
            {sel.uploadedImageName && (
              <button onClick={() => update("uploadedImageName", "")}
                className="text-[#ef4444] text-xs hover:underline">Remove</button>
            )}
          </div>
        </div>

        <div>
          <label className="text-[10px] tracking-[0.35em] uppercase text-[#9ca3af] font-medium block mb-3">Pattern Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PATTERNS.map(p => (
              <Card key={p.id} selected={sel.patternStyle === p.id} onClick={() => update("patternStyle", p.id)}
                className="flex flex-col gap-1">
                <p className="text-sm font-medium">{p.id}</p>
                <p className="text-[11px] opacity-70">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );

    // ── Step 6: Finish ────────────────────────────────────────────────────────
    if (step === 6) return (
      <div>
        <StepHeader num={6} title="Finish & Texture" subtitle="How should the surface feel?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FINISHES.map(f => (
            <Card key={f.id} selected={sel.finish === f.id} onClick={() => update("finish", f.id)}
              className="flex items-center gap-4">
              <div className="w-11 h-11 flex-shrink-0 rounded border border-[#e8e8e5]"
                style={{ background: f.bg }} />
              <div>
                <p className="text-sm font-medium">{f.id}</p>
                <p className="text-[11px] opacity-70 mt-0.5">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );

    // ── Step 7: Colour ────────────────────────────────────────────────────────
    if (step === 7) return (
      <div>
        <StepHeader num={7} title="Colour / Stain" subtitle="Choose your colour preference" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {COLOURS.map(c => (
            <Card key={c.id} selected={sel.colour === c.id} onClick={() => update("colour", c.id)}
              className="flex flex-col items-center gap-3 py-5">
              <div
                className={`w-10 h-10 rounded-full border-2 ${sel.colour === c.id ? "border-white" : "border-[#e8e8e5]"}`}
                style={{
                  backgroundColor: c.hex ?? undefined,
                  background: c.hex ? undefined : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                }}
              />
              <p className="text-xs font-medium text-center">{c.id}</p>
            </Card>
          ))}
        </div>
      </div>
    );

    // ── Step 8: Add-ons ───────────────────────────────────────────────────────
    if (step === 8) {
      const addonTotal = sel.addons.reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price ?? 0), 0);
      return (
        <div>
          <StepHeader num={8} title="Special Add-ons" subtitle="Optional extras to enhance your piece" />
          <div className="space-y-2">
            {ADDONS.map(addon => {
              const checked = sel.addons.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => setSel(prev => ({
                    ...prev,
                    addons: prev.addons.includes(addon.id)
                      ? prev.addons.filter(a => a !== addon.id)
                      : [...prev.addons, addon.id],
                  }))}
                  className={`w-full flex items-center justify-between p-4 border-2 text-left transition-all ${
                    checked ? "border-[#111111] bg-[#111111] text-white" : "border-[#e8e8e5] hover:border-[#111111]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-white" : "border-[#d1d5db]"}`}>
                      {checked && (
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 3L5 8.5 2 5.5l-1 1L5 10.5l6-7z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{addon.label}</span>
                  </div>
                  <span className="text-sm font-semibold">+{fmt(addon.price)}</span>
                </button>
              );
            })}
          </div>
          {sel.addons.length > 0 && (
            <p className="text-sm text-[#6b7280] mt-4">
              {sel.addons.length} add-on{sel.addons.length > 1 ? "s" : ""} selected · +{fmt(addonTotal)}
            </p>
          )}
        </div>
      );
    }

    // ── Step 9: Occasion ──────────────────────────────────────────────────────
    if (step === 9) return (
      <div>
        <StepHeader num={9} title="Occasion" subtitle="Optional — helps us tailor the design" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OCCASIONS.map(occ => (
            <Card key={occ.id} selected={sel.occasion === occ.id}
              onClick={() => update("occasion", sel.occasion === occ.id ? "" : occ.id)}
              className="flex items-center gap-3">
              <span className="text-2xl">{occ.icon}</span>
              <span className="text-sm font-medium">{occ.id}</span>
            </Card>
          ))}
        </div>
        <p className="text-xs text-[#9ca3af] mt-4">Tap to toggle — this step is optional.</p>
      </div>
    );

    // ── Step 10: Preview & Confirm ────────────────────────────────────────────
    if (step === 10) {
      const prompt = generatePrompt(sel);
      const woodAddon = WOODS.find(w => w.id === sel.wood)?.addon ?? 0;
      const sizeAddon = SIZES.find(s => s.id === sel.size)?.addon ?? 0;
      const engravingAddon = sel.engravingText.trim() ? 800 : 0;
      const imageAddon = sel.uploadedImageName ? 1200 : 0;
      const addonSum = sel.addons.reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price ?? 0), 0);

      const priceRows = [
        ["Base price", BASE_PRICE],
        ...(woodAddon > 0 ? [[`Wood upgrade: ${sel.wood}`, woodAddon]] : []),
        ...(sizeAddon > 0 ? [[`Size: ${sel.size}`, sizeAddon]] : []),
        ...(engravingAddon > 0 ? [["Text engraving", engravingAddon]] : []),
        ...(imageAddon > 0 ? [["Image/logo", imageAddon]] : []),
        ...sel.addons.map(id => [ADDONS.find(a => a.id === id)!.label, ADDONS.find(a => a.id === id)!.price]),
      ] as [string, number][];

      const sizeLabel = sel.size === "Custom" && (sel.customWidth || sel.customHeight)
        ? `Custom (${sel.customWidth || "?"}×${sel.customHeight || "?"}cm)`
        : sel.size;

      return (
        <div>
          <StepHeader num={10} title="Preview & Confirm" subtitle="Review your design before adding to cart" />

          {/* Summary grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {([
              ["Product",  sel.productType || "—"],
              ["Shape",    sel.shape || "—"],
              ["Size",     sizeLabel],
              ["Wood",     sel.wood || "—"],
              ["Finish",   sel.finish || "—"],
              ["Colour",   sel.colour || "—"],
              ["Pattern",  sel.patternStyle],
              ["Occasion", sel.occasion || "—"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="bg-white border border-[#e8e8e5] p-3">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#9ca3af] mb-1">{label}</p>
                <p className="text-sm font-medium text-[#111111] truncate">{value}</p>
              </div>
            ))}
          </div>

          {sel.engravingText && (
            <div className="bg-white border border-[#e8e8e5] p-4 mb-4">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#9ca3af] mb-1">Engraving</p>
              <p className="text-sm font-medium italic text-[#111111]">"{sel.engravingText}"</p>
            </div>
          )}

          {sel.addons.length > 0 && (
            <div className="bg-white border border-[#e8e8e5] p-4 mb-4">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#9ca3af] mb-2">Add-ons</p>
              <div className="flex flex-wrap gap-2">
                {sel.addons.map(id => (
                  <span key={id} className="text-[11px] bg-[#111111] text-white px-2 py-0.5">{id}</span>
                ))}
              </div>
            </div>
          )}

          {/* Workshop prompt */}
          <div className="bg-[#111111] text-white p-5 mb-5">
            <p className="text-[9px] tracking-[0.35em] uppercase text-white/40 mb-2">Workshop Prompt</p>
            <pre className="text-[11px] text-white/70 leading-relaxed whitespace-pre-wrap font-mono">{prompt}</pre>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className="text-[10px] tracking-[0.35em] uppercase text-[#9ca3af] font-medium block mb-2">
              Special Instructions
            </label>
            <textarea
              value={sel.notes}
              onChange={e => update("notes", e.target.value)}
              rows={4}
              placeholder="Any special requests for our craftspeople?"
              className="w-full border border-[#e8e8e5] px-4 py-3 text-sm outline-none focus:border-[#111111] transition-colors resize-none"
            />
          </div>

          {/* Price breakdown */}
          <div className="border border-[#e8e8e5] bg-white mb-4">
            {priceRows.map(([label, amount]) => (
              <div key={label as string} className="flex items-center justify-between px-4 py-2.5 border-b border-[#f5f5f3] last:border-0 text-sm">
                <span className="text-[#6b7280]">{label as string}</span>
                <span className="font-medium text-[#111111]">{fmt(amount as number)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-[#fafaf8] border-t border-[#e8e8e5]">
              <span className="text-sm font-semibold text-[#111111]">Total</span>
              <span className="text-xl font-bold text-[#111111]">{fmt(price)}</span>
            </div>
          </div>

          <p className="text-xs text-[#9ca3af] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estimated delivery: 7–14 business days
            {sel.addons.includes("Rush Order - 3 days") && " (Rush: 3 days)"}
          </p>
        </div>
      );
    }

    return null;
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-[#e8e8e5] sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#9ca3af] font-medium">
              {quickMode ? "Quick Custom" : "Custom Order"}
            </p>
            <h1 className="text-lg font-semibold text-[#111111] tracking-tight">Design Your Piece</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#111111]">{fmt(price)}</span>
            <button
              onClick={() => { setQuickMode(!quickMode); setStep(1); }}
              className="text-[10px] tracking-[0.15em] uppercase border border-[#e8e8e5] px-3 py-1.5 text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-all whitespace-nowrap"
            >
              {quickMode ? "Full Mode" : "Quick Mode"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-3xl mx-auto px-5 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#9ca3af]">
              Step {stepIdx + 1} of {steps.length}
            </span>
            <span className="text-[10px] text-[#9ca3af]">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1 bg-[#f0f0ee] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#111111] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {/* Step dots */}
          {!quickMode && (
            <div className="hidden sm:flex justify-between mt-2 px-0.5">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <button
                  key={i}
                  onClick={() => i + 1 <= step && setStep(i + 1)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    i + 1 === step ? "bg-[#111111] scale-150" :
                    i + 1 < step  ? "bg-[#111111]/40 cursor-pointer" :
                    "bg-[#e8e8e5]"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Inspiration + AI (step 1 only) */}
        {step === 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setInspirationOpen(true)}
              className="flex items-center gap-2 border border-[#e8e8e5] px-4 py-2.5 text-sm text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-all"
            >
              ✨ Inspiration Mode
            </button>
            <button
              onClick={getAiSuggestion}
              disabled={aiLoading}
              className="flex items-center gap-2 border border-[#e8e8e5] px-4 py-2.5 text-sm text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-all disabled:opacity-50"
            >
              {aiLoading ? (
                <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> Thinking…</>
              ) : "🤖 AI Suggestion"}
            </button>
            {aiError && <p className="text-xs text-[#ef4444] self-center">{aiError}</p>}
          </div>
        )}

        {/* Step content with slide animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#e8e8e5]">
          <button
            onClick={goPrev}
            className={`flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#111111] transition-colors ${stepIdx === 0 ? "invisible" : ""}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {step === 10 ? (
            <motion.button
              onClick={handleAddToCart}
              disabled={added}
              whileHover={!added ? { scale: 1.02 } : {}}
              whileTap={!added ? { scale: 0.98 } : {}}
              className={`px-10 py-3.5 text-[11px] tracking-[0.18em] uppercase font-semibold transition-colors ${
                added ? "bg-green-600 text-white" : "bg-[#111111] text-white hover:bg-[#222]"
              }`}
            >
              {added ? "Added to Cart ✓" : "Add to Cart"}
            </motion.button>
          ) : (
            <button
              onClick={() => canProceed() && goNext()}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-[#111111] text-white text-sm px-8 py-3 disabled:opacity-40 hover:bg-[#222] transition-colors"
            >
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Inspiration Mode overlay ── */}
      <AnimatePresence>
        {inspirationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
            onClick={() => setInspirationOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-8 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-[#111111] mb-1">Choose Your Vibe</h2>
              <p className="text-sm text-[#6b7280] mb-6">We'll auto-fill the recommended options for you.</p>
              <div className="grid grid-cols-2 gap-3">
                {VIBES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => applyVibe(v)}
                    className="border border-[#e8e8e5] p-4 text-left hover:border-[#111111] transition-all"
                  >
                    <div className="text-2xl mb-1.5">{v.emoji}</div>
                    <p className="text-sm font-medium text-[#111111]">{v.label}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setInspirationOpen(false)}
                className="mt-4 w-full text-[11px] tracking-[0.15em] uppercase text-[#9ca3af] hover:text-[#111111] transition-colors py-2"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
