"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { type CustomizationData } from "@/context/CartContext";

// ─── Font catalogue ────────────────────────────────────────────────────────

export type FontDef = {
  id: string;
  name: string;
  family: string;   // CSS font-family string
  google: string;   // Google Fonts API name (space → +)
  category: "Serif" | "Sans-serif" | "Script" | "Decorative" | "Monospace";
};

const FONT_CATALOGUE: FontDef[] = [
  // Serif
  { id: "playfair",    name: "Playfair Display",   family: "'Playfair Display', Georgia, serif",    google: "Playfair+Display",   category: "Serif" },
  { id: "cormorant",   name: "Cormorant Garamond",  family: "'Cormorant Garamond', Georgia, serif",  google: "Cormorant+Garamond", category: "Serif" },
  { id: "eb-garamond", name: "EB Garamond",         family: "'EB Garamond', Georgia, serif",         google: "EB+Garamond",        category: "Serif" },
  { id: "libre-bask",  name: "Libre Baskerville",   family: "'Libre Baskerville', Georgia, serif",   google: "Libre+Baskerville",  category: "Serif" },
  // Sans-serif
  { id: "inter",       name: "Inter",               family: "'Inter', Helvetica, sans-serif",        google: "Inter",              category: "Sans-serif" },
  { id: "montserrat",  name: "Montserrat",          family: "'Montserrat', Helvetica, sans-serif",   google: "Montserrat",         category: "Sans-serif" },
  { id: "raleway",     name: "Raleway",             family: "'Raleway', Helvetica, sans-serif",      google: "Raleway",            category: "Sans-serif" },
  { id: "josefin",     name: "Josefin Sans",        family: "'Josefin Sans', Helvetica, sans-serif", google: "Josefin+Sans",       category: "Sans-serif" },
  // Script
  { id: "dancing",     name: "Dancing Script",      family: "'Dancing Script', cursive",             google: "Dancing+Script",     category: "Script" },
  { id: "great-vibes", name: "Great Vibes",         family: "'Great Vibes', cursive",                google: "Great+Vibes",        category: "Script" },
  { id: "pacifico",    name: "Pacifico",            family: "'Pacifico', cursive",                   google: "Pacifico",           category: "Script" },
  { id: "sacramento",  name: "Sacramento",          family: "'Sacramento', cursive",                 google: "Sacramento",         category: "Script" },
  // Decorative
  { id: "cinzel",      name: "Cinzel",              family: "'Cinzel', serif",                       google: "Cinzel",             category: "Decorative" },
  { id: "bebas",       name: "Bebas Neue",          family: "'Bebas Neue', Impact, sans-serif",      google: "Bebas+Neue",         category: "Decorative" },
  { id: "abril",       name: "Abril Fatface",       family: "'Abril Fatface', serif",                google: "Abril+Fatface",      category: "Decorative" },
  // Monospace
  { id: "courier-p",   name: "Courier Prime",       family: "'Courier Prime', 'Courier New', mono",  google: "Courier+Prime",      category: "Monospace" },
  { id: "special-e",   name: "Special Elite",       family: "'Special Elite', cursive",              google: "Special+Elite",      category: "Monospace" },
];

const POPULAR_IDS = ["playfair", "dancing", "great-vibes", "cinzel", "montserrat"];
const CATEGORIES = ["Serif", "Sans-serif", "Script", "Decorative", "Monospace"] as const;

// ─── Text colours ──────────────────────────────────────────────────────────

const TEXT_COLORS = [
  { id: "natural", label: "Natural",  fill: "#2c0f00", swatch: "linear-gradient(135deg,#9b6c45,#5c3318)" },
  { id: "black",   label: "Black",    fill: "#111111", swatch: "#111" },
  { id: "gold",    label: "Gold",     fill: "#c89b0a", swatch: "linear-gradient(135deg,#f0d060,#c89b0a)" },
  { id: "silver",  label: "Silver",   fill: "#b0b0b0", swatch: "linear-gradient(135deg,#e8e8e8,#9e9e9e)" },
  { id: "white",   label: "White",    fill: "#ffffff", swatch: "#fff" },
];

// ─── Product shape detection ───────────────────────────────────────────────

type ShapeId = "oval" | "circle" | "rect" | "tag";

function detectShape(product: Product): ShapeId {
  const t = `${product.name} ${product.category ?? ""}`.toLowerCase();
  if (t.includes("bowl"))              return "oval";
  if (t.includes("plate") || t.includes("disc")) return "circle";
  if (t.includes("tag") || t.includes("label")) return "tag";
  return "rect";
}

// ─── Canvas rendering ──────────────────────────────────────────────────────

function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = "#c49a6c";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) {
    const yBase = (i / 30) * H;
    const amp   = 3 + Math.random() * 12;
    const freq  = 1.5 + Math.random() * 2.5;
    const phase = Math.random() * Math.PI * 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const y = yBase + Math.sin((x / W) * Math.PI * 2 * freq + phase) * amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i % 3 === 0 ? "#8b5e3c" : "#a87850";
    ctx.lineWidth   = 0.4 + Math.random() * 1.4;
    ctx.globalAlpha = 0.12 + Math.random() * 0.32;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.65);
  g.addColorStop(0, "rgba(255,215,140,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function tracePath(ctx: CanvasRenderingContext2D, shape: ShapeId, W: number, H: number) {
  ctx.beginPath();
  if (shape === "oval") {
    ctx.ellipse(W / 2, H / 2, W * 0.44, H * 0.41, 0, 0, Math.PI * 2);
  } else if (shape === "circle") {
    const r = Math.min(W, H) * 0.41;
    ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
  } else if (shape === "tag") {
    const tw = W * 0.38, th = H * 0.74, r = 14;
    const tx = W / 2 - tw / 2, ty = H / 2 - th / 2;
    ctx.moveTo(tx + r, ty); ctx.lineTo(tx + tw - r, ty);
    ctx.quadraticCurveTo(tx + tw, ty, tx + tw, ty + r);
    ctx.lineTo(tx + tw, ty + th - r);
    ctx.quadraticCurveTo(tx + tw, ty + th, tx + tw - r, ty + th);
    ctx.lineTo(tx + r, ty + th);
    ctx.quadraticCurveTo(tx, ty + th, tx, ty + th - r);
    ctx.lineTo(tx, ty + r);
    ctx.quadraticCurveTo(tx, ty, tx + r, ty);
    ctx.closePath();
  } else {
    const pw = W * 0.84, ph = H * 0.76, r = 14;
    const px = (W - pw) / 2, py = (H - ph) / 2;
    ctx.moveTo(px + r, py); ctx.lineTo(px + pw - r, py);
    ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
    ctx.lineTo(px + pw, py + ph - r);
    ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
    ctx.lineTo(px + r, py + ph);
    ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
    ctx.lineTo(px, py + r);
    ctx.quadraticCurveTo(px, py, px + r, py);
    ctx.closePath();
  }
}

function drawCurvedText(
  ctx: CanvasRenderingContext2D, text: string,
  cx: number, cy: number, radius: number, fill: string,
) {
  if (!text) return;
  const span = Math.min((text.length * 0.62) / radius, 1.15) * Math.PI;
  const start = -Math.PI / 2 - span / 2;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < text.length; i++) {
    const a = start + (i / Math.max(text.length - 1, 1)) * span;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawStraightText(
  ctx: CanvasRenderingContext2D, text: string,
  cx: number, cy: number, fill: string, shadow: string,
) {
  if (!text) return;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = shadow;
  ctx.fillText(text, cx + 1.5, cy + 1.5);
  ctx.fillStyle = fill;
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

async function renderToCanvas(
  canvas: HTMLCanvasElement,
  opts: {
    text: string;
    fontFamily: string;
    fontSize: number;
    colorId: string;
    shape: ShapeId;
    productImageSrc: string | null;
  },
) {
  const { text, fontFamily, fontSize, colorId, shape, productImageSrc } = opts;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const color = TEXT_COLORS.find(c => c.id === colorId) ?? TEXT_COLORS[0];
  const shadowFill = colorId === "white" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.3)";

  ctx.clearRect(0, 0, W, H);

  // Dark surround
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, W, H);

  // Clip to product shape and fill with wood/image
  ctx.save();
  tracePath(ctx, shape, W, H);
  ctx.clip();

  if (productImageSrc) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej();
        img.src = productImageSrc;
      });
      // Cover-fit
      const aspect = img.naturalWidth / img.naturalHeight;
      const ca     = W / H;
      let sw = W, sh = H, sx = 0, sy = 0;
      if (aspect > ca) { sw = H * aspect; sx = -(sw - W) / 2; }
      else             { sh = W / aspect; sy = -(sh - H) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, W, H);
    } catch { drawGrain(ctx, W, H); }
  } else {
    drawGrain(ctx, W, H);
  }
  ctx.restore();

  // Shape outline
  ctx.save();
  tracePath(ctx, shape, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Text
  if (text.trim()) {
    try { await document.fonts.load(`bold ${fontSize}px ${fontFamily}`); } catch { /* fallback */ }
    ctx.font = `${fontSize}px ${fontFamily}`;
    if (shape === "oval" || shape === "circle") {
      const r = shape === "oval" ? H * 0.27 : Math.min(W, H) * 0.27;
      drawCurvedText(ctx, text, W / 2, H / 2, r, color.fill);
    } else {
      drawStraightText(ctx, text, W / 2, H / 2, color.fill, shadowFill);
    }
  }
}

// ─── Font picker sub-component ─────────────────────────────────────────────

function FontPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<string>("Popular");

  const popular = FONT_CATALOGUE.filter(f => POPULAR_IDS.includes(f.id));

  const filtered = query.trim()
    ? FONT_CATALOGUE.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : null;

  const selected = FONT_CATALOGUE.find(f => f.id === value);

  return (
    <div>
      {/* Selected font display + search */}
      <div className="relative mb-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search fonts… (${selected?.name ?? ""})`}
          className="w-full border border-[#e8e8e5] bg-white px-3 py-2 text-sm outline-none focus:border-[#111111] transition-colors"
        />
        {query && (
          <button onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#111111]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results */}
      <div className="border border-[#e8e8e5] bg-white max-h-[260px] overflow-y-auto">
        {filtered ? (
          // Search results
          filtered.length === 0
            ? <p className="text-xs text-[#9ca3af] text-center py-6">No fonts found</p>
            : filtered.map(f => (
                <FontRow key={f.id} font={f} selected={f.id === value} onClick={() => { onChange(f.id); setQuery(""); }} />
              ))
        ) : (
          // Grouped
          <>
            {/* Popular */}
            <div>
              <GroupHeader label="Popular" open={openGroup === "Popular"} onClick={() => setOpenGroup(g => g === "Popular" ? "" : "Popular")} />
              <AnimatePresence initial={false}>
                {openGroup === "Popular" && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    {popular.map(f => (
                      <FontRow key={f.id} font={f} selected={f.id === value} onClick={() => onChange(f.id)} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {CATEGORIES.map(cat => (
              <div key={cat}>
                <GroupHeader label={cat} open={openGroup === cat} onClick={() => setOpenGroup(g => g === cat ? "" : cat)} />
                <AnimatePresence initial={false}>
                  {openGroup === cat && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      {FONT_CATALOGUE.filter(f => f.category === cat).map(f => (
                        <FontRow key={f.id} font={f} selected={f.id === value} onClick={() => onChange(f.id)} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function GroupHeader({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2 bg-[#f9f9f7] border-b border-[#f0f0ee] text-left hover:bg-[#f5f5f3] transition-colors">
      <span className="text-[9px] tracking-[0.35em] uppercase text-[#9ca3af] font-semibold">{label}</span>
      <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
        className="w-3 h-3 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </motion.svg>
    </button>
  );
}

function FontRow({ font, selected, onClick }: { font: FontDef; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 border-b border-[#f5f5f3] last:border-0 text-left transition-colors ${
        selected ? "bg-[#111111]" : "hover:bg-[#fafaf8]"
      }`}>
      <span style={{ fontFamily: font.family }} className={`text-[17px] truncate max-w-[140px] ${selected ? "text-white" : "text-[#111111]"}`}>
        {font.name}
      </span>
      <span className={`text-[10px] shrink-0 ml-2 ${selected ? "text-white/50" : "text-[#9ca3af]"}`}>
        {font.category}
      </span>
    </button>
  );
}

// ─── Main EngravingPanel component ─────────────────────────────────────────

export default function EngravingPanel({
  product,
  onAddToCart,
  onClose,
}: {
  product: Product;
  onAddToCart: (data: CustomizationData) => void;
  onClose: () => void;
}) {
  const [text, setText]           = useState("");
  const [fontId, setFontId]       = useState("playfair");
  const [fontSize, setFontSize]   = useState(32);
  const [colorId, setColorId]     = useState("natural");
  const [fileName, setFileName]   = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [notes, setNotes]         = useState("");
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [fontsLoaded, setFontsLoaded]       = useState(false);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const shape      = detectShape(product);
  const selectedFont = FONT_CATALOGUE.find(f => f.id === fontId) ?? FONT_CATALOGUE[0];

  // ── Load all Google Fonts once ──────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    const existing = document.getElementById("engraving-gfonts");
    if (!existing) {
      const params = FONT_CATALOGUE.map(f => `family=${f.google}:wght@400;700`).join("&");
      const link = document.createElement("link");
      link.id   = "engraving-gfonts";
      link.rel  = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
      link.onload = () => setFontsLoaded(true);
      document.head.appendChild(link);
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // ── Redraw canvas whenever inputs change ────────────────────────────────
  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await renderToCanvas(canvas, {
      text,
      fontFamily: selectedFont.family,
      fontSize,
      colorId,
      shape,
      productImageSrc: product.image || null,
    });
  }, [text, selectedFont, fontSize, colorId, shape, product.image]);

  useEffect(() => { redraw(); }, [redraw]);
  // Also redraw once fonts are done loading
  useEffect(() => { if (fontsLoaded) redraw(); }, [fontsLoaded, redraw]);

  // ── Download preview ────────────────────────────────────────────────────
  function downloadPreview() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href     = canvas.toDataURL("image/png");
    a.download = `engraving-preview-${product.id}.png`;
    a.click();
  }

  // ── Add to cart ─────────────────────────────────────────────────────────
  function handleAdd() {
    const previewDataUrl = canvasRef.current?.toDataURL("image/png") ?? "";
    const summary = [
      text ? `"${text.slice(0, 28)}${text.length > 28 ? "…" : ""}"` : null,
      text ? `· ${selectedFont.name}` : null,
      colorId !== "natural" ? `· ${TEXT_COLORS.find(c => c.id === colorId)?.label}` : null,
      fileName ? `· image` : null,
    ].filter(Boolean).join(" ");

    onAddToCart({
      fabricJson: JSON.stringify({ text, fontId, fontFamily: selectedFont.family, fontSize, colorId, fileName, notes }),
      previewDataUrl,
      summary: summary || "Custom engraving",
      productId: product.id,
    });
  }

  const canW = 400, canH = 264;

  return (
    <div className="border border-[#e8e8e5] bg-[#fafaf8] mt-1">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e8e5] bg-white">
        <div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-[#9ca3af] font-semibold">Personalise</p>
          <p className="text-sm font-medium text-[#111111]">Add Engraving</p>
        </div>
        <button onClick={onClose} className="text-[#9ca3af] hover:text-[#111111] transition-colors p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-5">

        {/* ── Live preview canvas ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] tracking-[0.35em] uppercase text-[#9ca3af] font-medium">Preview</p>
            {text && (
              <button onClick={downloadPreview}
                className="flex items-center gap-1 text-[10px] text-[#6b7280] hover:text-[#111111] transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save PNG
              </button>
            )}
          </div>
          <div className="relative bg-[#111111] overflow-hidden" style={{ borderRadius: 6 }}>
            <canvas
              ref={canvasRef}
              width={canW}
              height={canH}
              className="w-full"
              style={{ display: "block" }}
            />
            {!text && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-[11px] text-white/25 tracking-[0.2em] uppercase">Type text below to preview</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#9ca3af] mt-1.5 text-center">
            This is how your engraving will look
            {shape === "oval" || shape === "circle" ? " (curved on round products)" : ""}
          </p>
        </div>

        {/* ── Text input ── */}
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] block mb-2">
            Engraving Text
          </label>
          <div className="relative">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value.slice(0, 40))}
              placeholder="Name, date, or short quote…"
              autoFocus
              className="w-full border border-[#e8e8e5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#111111] transition-colors pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9ca3af] tabular-nums">
              {text.length}/40
            </span>
          </div>
        </div>

        {/* ── Font picker ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280]">Font</label>
            <button
              onClick={() => setShowFontPicker(p => !p)}
              className="text-[10px] text-[#6b7280] hover:text-[#111111] flex items-center gap-1 transition-colors"
            >
              {showFontPicker ? "Close" : "Browse all"}
              <motion.svg animate={{ rotate: showFontPicker ? 180 : 0 }} transition={{ duration: 0.2 }}
                className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
          </div>

          {/* Quick popular row */}
          {!showFontPicker && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {FONT_CATALOGUE.filter(f => POPULAR_IDS.includes(f.id)).map(f => (
                <button key={f.id} onClick={() => setFontId(f.id)}
                  className={`px-3 py-2.5 border text-left transition-all ${
                    fontId === f.id ? "border-[#111111] bg-[#111111] text-white" : "border-[#e8e8e5] bg-white hover:border-[#111111]"
                  }`}>
                  <span style={{ fontFamily: f.family }} className="block text-[18px] leading-tight mb-0.5">Aa</span>
                  <span className={`text-[9px] tracking-wide ${fontId === f.id ? "text-white/60" : "text-[#9ca3af]"}`}>{f.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Full picker */}
          <AnimatePresence initial={false}>
            {showFontPicker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <FontPicker value={fontId} onChange={id => { setFontId(id); setShowFontPicker(false); }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Currently selected font display */}
          {!showFontPicker && (
            <p className="mt-1.5 text-[10px] text-[#9ca3af]">
              Selected: <span style={{ fontFamily: selectedFont.family }} className="text-[#111111] text-[13px]">{selectedFont.name}</span>
            </p>
          )}
        </div>

        {/* ── Font size ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280]">Font Size</label>
            <span className="text-[11px] font-medium text-[#111111] tabular-nums">{fontSize}px</span>
          </div>
          <input
            type="range"
            min={16}
            max={56}
            step={2}
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            className="w-full accent-[#111111]"
          />
          <div className="flex justify-between text-[9px] text-[#9ca3af] mt-0.5">
            <span>Small</span><span>Large</span>
          </div>
        </div>

        {/* ── Text colour ── */}
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] block mb-2">Text Colour</label>
          <div className="flex gap-2 flex-wrap">
            {TEXT_COLORS.map(c => (
              <button key={c.id} onClick={() => setColorId(c.id)} title={c.label}
                className={`flex flex-col items-center gap-1 group`}>
                <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                  colorId === c.id ? "border-[#111111] scale-110" : "border-[#e8e8e5] hover:border-[#999]"
                }`} style={{ background: c.swatch, boxShadow: colorId === c.id ? "0 0 0 2px white, 0 0 0 3px #111" : undefined }} />
                <span className={`text-[9px] tracking-wide ${colorId === c.id ? "text-[#111111] font-semibold" : "text-[#9ca3af]"}`}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Image upload ── */}
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] block mb-2">
            Reference Image <span className="normal-case tracking-normal font-normal text-[#9ca3af]">(optional)</span>
          </label>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => {
              const f = e.target.files?.[0] ?? null;
              setUploadedFile(f);
              setFileName(f?.name ?? "");
            }} />
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="border border-[#e8e8e5] bg-white px-3 py-2 text-xs text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-all">
              Choose File
            </button>
            {fileName
              ? <span className="text-xs text-[#111111] truncate max-w-[160px]">{fileName}</span>
              : <span className="text-xs text-[#9ca3af]">No file chosen</span>}
            {fileName && (
              <button onClick={() => { setUploadedFile(null); setFileName(""); }} className="text-[#ef4444] text-xs hover:underline">
                Remove
              </button>
            )}
          </div>
        </div>

        {/* ── Notes ── */}
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] block mb-2">
            Special Notes <span className="normal-case tracking-normal font-normal text-[#9ca3af]">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Any specific requests for our craftspeople…"
            className="w-full border border-[#e8e8e5] bg-white px-3 py-2 text-sm outline-none focus:border-[#111111] transition-colors resize-none"
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-2 pt-1">
          <button onClick={handleAdd}
            className="flex-1 bg-[#111111] text-white text-[11px] tracking-[0.15em] uppercase font-semibold py-3.5 hover:bg-[#222] transition-colors flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Add to Cart
          </button>
          <button onClick={downloadPreview} disabled={!text}
            title="Download preview"
            className="border border-[#e8e8e5] px-3.5 text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button onClick={onClose}
            className="border border-[#e8e8e5] px-4 text-[#6b7280] text-xs hover:border-[#111111] hover:text-[#111111] transition-colors">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
