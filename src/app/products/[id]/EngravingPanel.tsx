"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { type CustomizationData } from "@/context/CartContext";

// ─── Font catalogue ────────────────────────────────────────────────────────

export type FontDef = {
  id: string;
  name: string;
  family: string;
  google: string;
  category: "Serif" | "Sans-serif" | "Script" | "Decorative" | "Monospace";
};

const FONT_CATALOGUE: FontDef[] = [
  { id: "playfair",    name: "Playfair Display",   family: "'Playfair Display', Georgia, serif",    google: "Playfair+Display",   category: "Serif" },
  { id: "cormorant",   name: "Cormorant Garamond",  family: "'Cormorant Garamond', Georgia, serif",  google: "Cormorant+Garamond", category: "Serif" },
  { id: "eb-garamond", name: "EB Garamond",         family: "'EB Garamond', Georgia, serif",         google: "EB+Garamond",        category: "Serif" },
  { id: "libre-bask",  name: "Libre Baskerville",   family: "'Libre Baskerville', Georgia, serif",   google: "Libre+Baskerville",  category: "Serif" },
  { id: "inter",       name: "Inter",               family: "'Inter', Helvetica, sans-serif",        google: "Inter",              category: "Sans-serif" },
  { id: "montserrat",  name: "Montserrat",          family: "'Montserrat', Helvetica, sans-serif",   google: "Montserrat",         category: "Sans-serif" },
  { id: "raleway",     name: "Raleway",             family: "'Raleway', Helvetica, sans-serif",      google: "Raleway",            category: "Sans-serif" },
  { id: "josefin",     name: "Josefin Sans",        family: "'Josefin Sans', Helvetica, sans-serif", google: "Josefin+Sans",       category: "Sans-serif" },
  { id: "dancing",     name: "Dancing Script",      family: "'Dancing Script', cursive",             google: "Dancing+Script",     category: "Script" },
  { id: "great-vibes", name: "Great Vibes",         family: "'Great Vibes', cursive",                google: "Great+Vibes",        category: "Script" },
  { id: "pacifico",    name: "Pacifico",            family: "'Pacifico', cursive",                   google: "Pacifico",           category: "Script" },
  { id: "sacramento",  name: "Sacramento",          family: "'Sacramento', cursive",                 google: "Sacramento",         category: "Script" },
  { id: "cinzel",      name: "Cinzel",              family: "'Cinzel', serif",                       google: "Cinzel",             category: "Decorative" },
  { id: "bebas",       name: "Bebas Neue",          family: "'Bebas Neue', Impact, sans-serif",      google: "Bebas+Neue",         category: "Decorative" },
  { id: "abril",       name: "Abril Fatface",       family: "'Abril Fatface', serif",                google: "Abril+Fatface",      category: "Decorative" },
  { id: "courier-p",   name: "Courier Prime",       family: "'Courier Prime', 'Courier New', monospace", google: "Courier+Prime", category: "Monospace" },
  { id: "special-e",   name: "Special Elite",       family: "'Special Elite', cursive",              google: "Special+Elite",      category: "Monospace" },
];

const POPULAR_IDS = ["playfair", "dancing", "great-vibes", "cinzel", "montserrat"];
const CATEGORIES  = ["Serif", "Sans-serif", "Script", "Decorative", "Monospace"] as const;

// ─── Text colours ──────────────────────────────────────────────────────────

const TEXT_COLORS = [
  { id: "natural", label: "Natural",  fill: "#2c0f00", glow: "rgba(140,80,20,0.6)",  swatch: "linear-gradient(135deg,#9b6c45,#5c3318)" },
  { id: "black",   label: "Black",    fill: "#111111", glow: "rgba(0,0,0,0.8)",       swatch: "#111" },
  { id: "gold",    label: "Gold",     fill: "#d4a017", glow: "rgba(212,160,23,0.8)",  swatch: "linear-gradient(135deg,#f5d060,#c89b0a)" },
  { id: "silver",  label: "Silver",   fill: "#e0e0e0", glow: "rgba(220,220,220,0.7)", swatch: "linear-gradient(135deg,#f0f0f0,#9e9e9e)" },
  { id: "white",   label: "White",    fill: "#ffffff", glow: "rgba(255,255,255,0.6)", swatch: "#fff" },
];

// ─── Text position ─────────────────────────────────────────────────────────

type PositionId = "center" | "top" | "bottom" | "left" | "right";

const POSITIONS: { id: PositionId; label: string; icon: React.ReactNode }[] = [
  {
    id: "center", label: "Center",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "top", label: "Top",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "bottom", label: "Bottom",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="8" y1="16" x2="16" y2="16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "left", label: "Left",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="8" y1="8" x2="8" y2="16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "right", label: "Right",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="16" y1="8" x2="16" y2="16" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── Shape detection ───────────────────────────────────────────────────────

type ShapeId = "oval" | "circle" | "rect" | "tag";

function detectShape(product: Product): ShapeId {
  const t = `${product.name} ${product.category ?? ""}`.toLowerCase();
  if (t.includes("bowl")) return "oval";
  if (t.includes("plate") || t.includes("disc")) return "circle";
  if (t.includes("tag") || t.includes("label")) return "tag";
  return "rect";
}

/** Bowls & round shapes default to bottom rim engraving */
function getDefaultPosition(shape: ShapeId): PositionId {
  return shape === "oval" || shape === "circle" ? "bottom" : "center";
}

// ─── Canvas helpers ────────────────────────────────────────────────────────

function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = "#c49a6c";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 32; i++) {
    const yBase = (i / 32) * H;
    const amp   = 3 + Math.random() * 14;
    const freq  = 1.5 + Math.random() * 2.5;
    const phase = Math.random() * Math.PI * 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const y = yBase + Math.sin((x / W) * Math.PI * 2 * freq + phase) * amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i % 3 === 0 ? "#8b5e3c" : "#a87850";
    ctx.lineWidth   = 0.4 + Math.random() * 1.6;
    ctx.globalAlpha = 0.12 + Math.random() * 0.35;
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
    ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.41, 0, Math.PI * 2);
  } else if (shape === "tag") {
    const tw = W * 0.4, th = H * 0.76, r = 14;
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
    const pw = W * 0.86, ph = H * 0.78, r = 16;
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

/**
 * Draw text curved along the top or bottom arc of an ellipse/circle.
 * Characters are placed one by one around the arc so they follow the curve naturally.
 */
function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  rx: number,   // horizontal radius
  ry: number,   // vertical radius
  fill: string,
  glow: string,
  pos: "top" | "bottom" | "center",
  letterSpacingPx: number,
) {
  if (!text.trim()) return;

  // Measure each character width (use average for simplicity)
  const charWidths = text.split("").map(ch => ctx.measureText(ch).width + letterSpacingPx);
  const totalWidth = charWidths.reduce((a, b) => a + b, 0) - letterSpacingPx;

  // For bottom: arc centre is below shape centre, text reads left→right along bottom rim
  // For top / center: arc along top rim
  const isBottom = pos === "bottom";

  // Use a radius that sits ON the rim (just inside the edge)
  const useRx = rx * 0.88;
  const useRy = ry * 0.88;

  // Arc span in radians proportional to text width vs circumference at that radius
  const avgR = (useRx + useRy) / 2;
  const arcSpan = Math.min((totalWidth / avgR) * 1.05, Math.PI * 1.3);

  // Starting angle: for bottom, we go from left of the bottom arc to right
  // π/2 = straight down; for top, -π/2 = straight up
  const midAngle = isBottom ? Math.PI / 2 : -Math.PI / 2;
  let curAngle   = midAngle - arcSpan / 2;

  ctx.save();
  ctx.fillStyle   = fill;
  ctx.shadowColor = glow;
  ctx.shadowBlur  = 14;
  ctx.textAlign   = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < text.length; i++) {
    const charAngle = curAngle + (charWidths[i] - letterSpacingPx) / 2 / avgR;
    const x = cx + useRx * Math.cos(charAngle);
    const y = cy + useRy * Math.sin(charAngle);

    // Rotation: tangent to ellipse at this angle
    // For bottom arc, rotate so baseline faces away from centre (outward)
    const rotation = isBottom
      ? charAngle + Math.PI / 2   // baseline points outward (down)
      : charAngle - Math.PI / 2;  // baseline points outward (up)

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Stroke for contrast
    ctx.lineWidth   = 3;
    ctx.strokeStyle = isBottom ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.45)";
    ctx.strokeText(text[i], 0, 0);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();

    curAngle += charWidths[i] / avgR;
  }

  ctx.restore();
}

/**
 * Draw straight text (center / left / right positions, or flat products).
 * Uses a drop shadow + thin stroke for readability on any background.
 */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  glow: string,
  vertical: boolean,
) {
  if (!text.trim()) return;
  ctx.save();
  ctx.fillStyle    = fill;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor  = glow;
  ctx.shadowBlur   = 16;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  if (vertical) {
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);
    ctx.lineWidth   = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
  } else {
    ctx.lineWidth   = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

/** Straight-text position for non-round shapes or left/right positions */
function getTextXY(pos: PositionId, W: number, H: number, shape: ShapeId): { x: number; y: number; vertical: boolean } {
  const isRound = shape === "oval" || shape === "circle";
  switch (pos) {
    case "top":    return { x: W / 2, y: isRound ? H * 0.20 : H * 0.22, vertical: false };
    case "bottom": return { x: W / 2, y: isRound ? H * 0.80 : H * 0.78, vertical: false };
    case "left":   return { x: isRound ? W * 0.18 : W * 0.20, y: H / 2, vertical: true  };
    case "right":  return { x: isRound ? W * 0.82 : W * 0.80, y: H / 2, vertical: true  };
    default:       return { x: W / 2, y: H / 2, vertical: false };
  }
}

async function renderToCanvas(
  canvas: HTMLCanvasElement,
  opts: {
    text: string;
    fontFamily: string;
    fontSize: number;
    colorId: string;
    letterSpacingEm: number;
    position: PositionId;
    shape: ShapeId;
    productImageSrc: string | null;
  },
) {
  const { text, fontFamily, fontSize, colorId, letterSpacingEm, position, shape, productImageSrc } = opts;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const color = TEXT_COLORS.find(c => c.id === colorId) ?? TEXT_COLORS[0];
  const letterSpacingPx = Math.round(letterSpacingEm * fontSize);

  ctx.clearRect(0, 0, W, H);

  // Dark surround
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(0, 0, W, H);

  // Clip to shape, draw product image or wood grain
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
      const aspect = img.naturalWidth / img.naturalHeight;
      const ca = W / H;
      let sw = W, sh = H, sx = 0, sy = 0;
      if (aspect > ca) { sw = H * aspect; sx = -(sw - W) / 2; }
      else             { sh = W / aspect; sy = -(sh - H) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh);
      // Slight darkening so text always pops
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(0, 0, W, H);
    } catch {
      drawGrain(ctx, W, H);
    }
  } else {
    drawGrain(ctx, W, H);
  }
  ctx.restore();

  // Shape border
  ctx.save();
  tracePath(ctx, shape, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Draw text
  if (text.trim()) {
    try { await document.fonts.load(`bold ${fontSize}px ${fontFamily}`); } catch { /* fallback */ }

    // Apply letterSpacing via canvas API where available
    const c2 = canvas.getContext("2d")!;
    if ("letterSpacing" in c2) {
      (c2 as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacingPx}px`;
    }
    ctx.font = `${fontSize}px ${fontFamily}`;

    const isRound   = shape === "oval" || shape === "circle";
    const isCurved  = isRound && (position === "top" || position === "bottom" || position === "center");
    const curvedPos = (position === "left" || position === "right") ? "center" : position as "top" | "bottom" | "center";

    if (isCurved) {
      // Ellipse radii for the shape (same proportions as tracePath)
      const rx = shape === "oval"   ? W * 0.44 : Math.min(W, H) * 0.41;
      const ry = shape === "oval"   ? H * 0.41 : Math.min(W, H) * 0.41;
      drawCurvedText(ctx, text, W / 2, H / 2, rx, ry, color.fill, color.glow, curvedPos, letterSpacingPx);
    } else {
      const { x, y, vertical } = getTextXY(position, W, H, shape);
      drawText(ctx, text, x, y, color.fill, color.glow, vertical);
    }
  }
}

// ─── Font picker ───────────────────────────────────────────────────────────

function FontPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [query, setQuery]         = useState("");
  const [openGroup, setOpenGroup] = useState<string>("Popular");

  const popular  = FONT_CATALOGUE.filter(f => POPULAR_IDS.includes(f.id));
  const filtered = query.trim()
    ? FONT_CATALOGUE.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : null;

  return (
    <div>
      <div className="relative mb-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search fonts…"
          className="w-full h-10 border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-900 transition-colors pr-9 rounded"
        />
        {query && (
          <button onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="border border-gray-200 rounded bg-white max-h-[220px] overflow-y-auto text-sm">
        {filtered ? (
          filtered.length === 0
            ? <p className="text-gray-400 text-center py-5 text-xs">No fonts found</p>
            : filtered.map(f => <FontRow key={f.id} font={f} selected={f.id === value} onClick={() => { onChange(f.id); setQuery(""); }} />)
        ) : (
          <>
            <FontGroupSection label="Popular" open={openGroup === "Popular"}
              onToggle={() => setOpenGroup(g => g === "Popular" ? "" : "Popular")}>
              {popular.map(f => <FontRow key={f.id} font={f} selected={f.id === value} onClick={() => onChange(f.id)} />)}
            </FontGroupSection>
            {CATEGORIES.map(cat => (
              <FontGroupSection key={cat} label={cat} open={openGroup === cat}
                onToggle={() => setOpenGroup(g => g === cat ? "" : cat)}>
                {FONT_CATALOGUE.filter(f => f.category === cat).map(f =>
                  <FontRow key={f.id} font={f} selected={f.id === value} onClick={() => onChange(f.id)} />
                )}
              </FontGroupSection>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function FontGroupSection({ label, open, onToggle, children }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">{label}</span>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}
          className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FontRow({ font, selected, onClick }: { font: FontDef; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 border-b border-gray-50 last:border-0 text-left transition-colors ${
        selected ? "bg-gray-900" : "hover:bg-gray-50"
      }`}>
      <span style={{ fontFamily: font.family }} className={`text-[18px] leading-tight truncate ${selected ? "text-white" : "text-gray-900"}`}>
        {font.name}
      </span>
      <span className={`text-[10px] shrink-0 ml-2 tracking-wide ${selected ? "text-white/50" : "text-gray-400"}`}>
        {font.category}
      </span>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">
      {children}
    </p>
  );
}

// ─── Main modal component ──────────────────────────────────────────────────

export default function EngravingPanel({
  product,
  onAddToCart,
  onClose,
}: {
  product: Product;
  onAddToCart: (data: CustomizationData) => void;
  onClose: () => void;
}) {
  const shape = detectShape(product);

  const [text, setText]                   = useState("");
  const [fontId, setFontId]               = useState("playfair");
  const [fontSize, setFontSize]           = useState(38);
  const [colorId, setColorId]             = useState("natural");
  const [position, setPosition]           = useState<PositionId>(getDefaultPosition(shape));
  const [letterSpacingEm, setLetterSpacingEm] = useState(0.05);
  const [fileName, setFileName]           = useState("");
  const [notes, setNotes]                 = useState("");
  const [showFullFontPicker, setShowFFP]  = useState(false);
  const [fontsLoaded, setFontsLoaded]     = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const fileRef      = useRef<HTMLInputElement>(null);
  const selectedFont = FONT_CATALOGUE.find(f => f.id === fontId) ?? FONT_CATALOGUE[0];

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Load all Google Fonts once
  useEffect(() => {
    if (document.getElementById("engraving-gfonts")) {
      setFontsLoaded(true);
      return;
    }
    const params = FONT_CATALOGUE.map(f => `family=${f.google}:wght@400;700`).join("&");
    const link   = Object.assign(document.createElement("link"), {
      id: "engraving-gfonts", rel: "stylesheet",
      href: `https://fonts.googleapis.com/css2?${params}&display=swap`,
    });
    link.onload = () => setFontsLoaded(true);
    document.head.appendChild(link);
  }, []);

  // Redraw canvas on every dependency change
  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await renderToCanvas(canvas, {
      text, fontFamily: selectedFont.family, fontSize, colorId,
      letterSpacingEm, position, shape, productImageSrc: product.image || null,
    });
  }, [text, selectedFont, fontSize, colorId, letterSpacingEm, position, shape, product.image]);

  useEffect(() => { redraw(); }, [redraw]);
  useEffect(() => { if (fontsLoaded) redraw(); }, [fontsLoaded, redraw]);

  function downloadPreview() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = Object.assign(document.createElement("a"), {
      href: canvas.toDataURL("image/png"),
      download: `engraving-${product.id}.png`,
    });
    a.click();
  }

  function handleAdd() {
    const previewDataUrl = canvasRef.current?.toDataURL("image/png") ?? "";
    const col     = TEXT_COLORS.find(c => c.id === colorId);
    const summary = [
      text ? `"${text.slice(0, 28)}${text.length > 28 ? "…" : ""}"` : null,
      text ? selectedFont.name : null,
      col && colorId !== "natural" ? col.label : null,
      fileName ? "+ image" : null,
    ].filter(Boolean).join(" · ");

    onAddToCart({
      fabricJson: JSON.stringify({ text, fontId, fontFamily: selectedFont.family, fontSize, colorId, letterSpacingEm, position, fileName, notes }),
      previewDataUrl,
      summary: summary || "Custom engraving",
      productId: product.id,
    });
  }

  // Canvas internal resolution — close to display size so fonts feel right
  const CW = 560, CH = 380;

  const lsPercent = Math.round(((letterSpacingEm - (-0.05)) / (0.30 - (-0.05))) * 100);

  const modal = (
    <AnimatePresence>
      <motion.div
        key="engraving-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-white w-full max-w-[940px] max-h-[92vh] flex flex-col rounded-xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-0.5">
                Personalise
              </p>
              <h2 className="text-lg font-semibold text-gray-900 leading-none">Add Engraving</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Body (two columns) ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row min-h-0">

              {/* ── LEFT: Preview ── */}
              <div className="md:w-1/2 bg-gray-950 flex flex-col items-center justify-center p-6 gap-4 shrink-0">
                <div className="w-full">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3 text-center">
                    Your Engraving Preview
                  </p>
                  <div className="relative rounded-lg overflow-hidden bg-black w-full">
                    <canvas
                      ref={canvasRef}
                      width={CW}
                      height={CH}
                      className="w-full block"
                    />
                    {!text && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-[11px] text-white/30 tracking-widest uppercase text-center px-8">
                          Type your text on the right<br />to see your engraving
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    {shape === "oval" || shape === "circle"
                      ? "Text curves along the outer rim of your product"
                      : "Text will be engraved exactly as shown above"}
                  </p>
                </div>

                {/* Download button */}
                <button
                  onClick={downloadPreview}
                  disabled={!text}
                  className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/50 text-[11px] tracking-widest uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save Preview PNG
                </button>
              </div>

              {/* ── RIGHT: Controls ── */}
              <div className="md:w-1/2 overflow-y-auto p-6 space-y-6">

                {/* Engraving text */}
                <div>
                  <SectionLabel>Engraving Text</SectionLabel>
                  <div className="relative">
                    <input
                      type="text"
                      value={text}
                      onChange={e => setText(e.target.value.slice(0, 40))}
                      placeholder="Name, date, or short quote…"
                      autoFocus
                      className="w-full h-12 border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-900 transition-colors pr-14 rounded"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 tabular-nums">
                      {text.length}/40
                    </span>
                  </div>
                </div>

                {/* Font */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Font</SectionLabel>
                    <button
                      onClick={() => setShowFFP(p => !p)}
                      className="text-[10px] text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors -mt-3"
                    >
                      {showFullFontPicker ? "Close picker" : "Browse all fonts"}
                      <motion.svg animate={{ rotate: showFullFontPicker ? 180 : 0 }} transition={{ duration: 0.18 }}
                        className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </button>
                  </div>

                  {/* Popular grid */}
                  {!showFullFontPicker && (
                    <div className="grid grid-cols-3 gap-2">
                      {FONT_CATALOGUE.filter(f => POPULAR_IDS.includes(f.id)).map(f => (
                        <button key={f.id} onClick={() => setFontId(f.id)}
                          className={`min-h-[76px] px-3 py-3 border-2 text-left rounded transition-all flex flex-col justify-between ${
                            fontId === f.id
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 bg-white hover:border-gray-400"
                          }`}>
                          <span style={{ fontFamily: f.family }} className={`block text-[22px] leading-tight ${fontId === f.id ? "text-white" : "text-gray-900"}`}>
                            Aa
                          </span>
                          <span className={`text-[9px] tracking-wide leading-tight mt-1 ${fontId === f.id ? "text-white/60" : "text-gray-400"}`}>
                            {f.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Full picker (searchable) */}
                  <AnimatePresence initial={false}>
                    {showFullFontPicker && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                        <FontPicker value={fontId} onChange={id => { setFontId(id); setShowFFP(false); }} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!showFullFontPicker && (
                    <p className="mt-2 text-[11px] text-gray-400">
                      Selected: <span style={{ fontFamily: selectedFont.family }} className="text-gray-900 text-[14px]">{selectedFont.name}</span>
                    </p>
                  )}
                </div>

                {/* Font size */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Font Size</SectionLabel>
                    <span className="text-[11px] font-semibold text-gray-900 tabular-nums -mt-3">{fontSize}px</span>
                  </div>
                  <input type="range" min={24} max={72} step={2} value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-gray-900" />
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                    <span>Small</span><span>Large</span>
                  </div>
                </div>

                {/* Letter spacing */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Letter Spacing</SectionLabel>
                    <span className="text-[11px] font-semibold text-gray-900 tabular-nums -mt-3">
                      {letterSpacingEm === 0 ? "0" : letterSpacingEm > 0 ? `+${letterSpacingEm.toFixed(2)}` : letterSpacingEm.toFixed(2)}em
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-5}
                    max={30}
                    step={1}
                    value={lsPercent}
                    onChange={e => {
                      const pct = Number(e.target.value) / 100;
                      const val = -0.05 + pct * (0.30 - (-0.05));
                      setLetterSpacingEm(Math.round(val * 100) / 100);
                    }}
                    className="w-full accent-gray-900"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                    <span>Tight</span><span>Normal</span><span>Wide</span>
                  </div>
                </div>

                {/* Text colour */}
                <div>
                  <SectionLabel>Text Colour</SectionLabel>
                  <div className="flex gap-3 flex-wrap">
                    {TEXT_COLORS.map(c => (
                      <button key={c.id} onClick={() => setColorId(c.id)} title={c.label}
                        className="flex flex-col items-center gap-1.5 group">
                        <div
                          className={`w-9 h-9 rounded-full border-2 transition-all ${
                            colorId === c.id
                              ? "border-gray-900 scale-110 shadow-lg"
                              : "border-gray-200 group-hover:border-gray-400"
                          }`}
                          style={{
                            background: c.swatch,
                            outline: colorId === c.id ? "2px solid white" : "none",
                            outlineOffset: "-3px",
                          }}
                        />
                        <span className={`text-[9px] tracking-wide ${colorId === c.id ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text position */}
                <div>
                  <SectionLabel>Text Position</SectionLabel>
                  <div className="flex gap-2 flex-wrap">
                    {POSITIONS.map(p => (
                      <button key={p.id} onClick={() => setPosition(p.id)} title={p.label}
                        className={`flex flex-col items-center gap-1.5 px-3 py-2.5 border-2 rounded transition-all min-w-[52px] ${
                          position === p.id
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
                        }`}>
                        {p.icon}
                        <span className="text-[9px] tracking-wide">{p.label}</span>
                      </button>
                    ))}
                  </div>
                  {(shape === "oval" || shape === "circle") && (
                    <p className="mt-2 text-[10px] text-gray-400">
                      Top, Centre, and Bottom positions curve the text along the rim.
                    </p>
                  )}
                </div>

                {/* Image upload */}
                <div>
                  <SectionLabel>Reference Image <span className="normal-case tracking-normal font-normal text-gray-400">(optional)</span></SectionLabel>
                  <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0] ?? null;
                      setFileName(f?.name ?? "");
                    }} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="h-10 border border-gray-200 bg-white px-4 text-xs text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all rounded">
                      Choose File
                    </button>
                    {fileName
                      ? <span className="text-xs text-gray-900 truncate max-w-[180px]">{fileName}</span>
                      : <span className="text-xs text-gray-400">No file chosen</span>}
                    {fileName && (
                      <button onClick={() => setFileName("")}
                        className="text-red-400 text-xs hover:text-red-600 hover:underline">Remove</button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <SectionLabel>Special Notes <span className="normal-case tracking-normal font-normal text-gray-400">(optional)</span></SectionLabel>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Any specific requests for our craftspeople…"
                    className="w-full border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 transition-colors resize-none rounded"
                  />
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAdd}
                  className="w-full h-14 bg-gray-900 text-white text-[12px] tracking-[0.18em] uppercase font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart with Engraving
                </button>

                <p className="text-[10px] text-gray-400 text-center -mt-2 pb-2">
                  Our craftspeople will engrave exactly as shown in the preview above.
                </p>

              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
