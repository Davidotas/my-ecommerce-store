"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/products";
import { type CustomizationData } from "@/context/CartContext";

// ─── Canvas dimensions ─────────────────────────────────────────────────────

const CW = 560;
const CH = 380;
const SNAP_DIST = 10; // px — snap to center guide

// ─── Font catalogue ────────────────────────────────────────────────────────

export type FontDef = {
  id: string; name: string; family: string; google: string;
  category: "Serif" | "Sans-serif" | "Script" | "Decorative" | "Monospace";
};

const FONT_CATALOGUE: FontDef[] = [
  { id: "playfair",    name: "Playfair Display",   family: "'Playfair Display', Georgia, serif",        google: "Playfair+Display",   category: "Serif" },
  { id: "cormorant",   name: "Cormorant Garamond",  family: "'Cormorant Garamond', Georgia, serif",      google: "Cormorant+Garamond", category: "Serif" },
  { id: "eb-garamond", name: "EB Garamond",         family: "'EB Garamond', Georgia, serif",             google: "EB+Garamond",        category: "Serif" },
  { id: "libre-bask",  name: "Libre Baskerville",   family: "'Libre Baskerville', Georgia, serif",       google: "Libre+Baskerville",  category: "Serif" },
  { id: "inter",       name: "Inter",               family: "'Inter', Helvetica, sans-serif",            google: "Inter",              category: "Sans-serif" },
  { id: "montserrat",  name: "Montserrat",          family: "'Montserrat', Helvetica, sans-serif",       google: "Montserrat",         category: "Sans-serif" },
  { id: "raleway",     name: "Raleway",             family: "'Raleway', Helvetica, sans-serif",          google: "Raleway",            category: "Sans-serif" },
  { id: "josefin",     name: "Josefin Sans",        family: "'Josefin Sans', Helvetica, sans-serif",     google: "Josefin+Sans",       category: "Sans-serif" },
  { id: "dancing",     name: "Dancing Script",      family: "'Dancing Script', cursive",                 google: "Dancing+Script",     category: "Script" },
  { id: "great-vibes", name: "Great Vibes",         family: "'Great Vibes', cursive",                    google: "Great+Vibes",        category: "Script" },
  { id: "pacifico",    name: "Pacifico",            family: "'Pacifico', cursive",                       google: "Pacifico",           category: "Script" },
  { id: "sacramento",  name: "Sacramento",          family: "'Sacramento', cursive",                     google: "Sacramento",         category: "Script" },
  { id: "cinzel",      name: "Cinzel",              family: "'Cinzel', serif",                           google: "Cinzel",             category: "Decorative" },
  { id: "bebas",       name: "Bebas Neue",          family: "'Bebas Neue', Impact, sans-serif",          google: "Bebas+Neue",         category: "Decorative" },
  { id: "abril",       name: "Abril Fatface",       family: "'Abril Fatface', serif",                    google: "Abril+Fatface",      category: "Decorative" },
  { id: "courier-p",   name: "Courier Prime",       family: "'Courier Prime', 'Courier New', monospace", google: "Courier+Prime",      category: "Monospace" },
  { id: "special-e",   name: "Special Elite",       family: "'Special Elite', cursive",                  google: "Special+Elite",      category: "Monospace" },
];

const POPULAR_IDS = ["playfair", "dancing", "great-vibes", "cinzel", "montserrat"];
const CATEGORIES  = ["Serif", "Sans-serif", "Script", "Decorative", "Monospace"] as const;

// ─── Text colours ──────────────────────────────────────────────────────────

const TEXT_COLORS = [
  { id: "natural", label: "Natural", fill: "#2c0f00", glow: "rgba(140,80,20,0.6)",  swatch: "linear-gradient(135deg,#9b6c45,#5c3318)" },
  { id: "black",   label: "Black",   fill: "#111111", glow: "rgba(0,0,0,0.8)",       swatch: "#111" },
  { id: "gold",    label: "Gold",    fill: "#d4a017", glow: "rgba(212,160,23,0.8)",  swatch: "linear-gradient(135deg,#f5d060,#c89b0a)" },
  { id: "silver",  label: "Silver",  fill: "#e0e0e0", glow: "rgba(220,220,220,0.7)", swatch: "linear-gradient(135deg,#f0f0f0,#9e9e9e)" },
  { id: "white",   label: "White",   fill: "#ffffff", glow: "rgba(255,255,255,0.6)", swatch: "#fff" },
];

// ─── Position ──────────────────────────────────────────────────────────────

type PositionId = "center" | "top" | "bottom" | "left" | "right";

const POSITIONS: { id: PositionId; label: string; icon: React.ReactNode }[] = [
  { id: "center", label: "Center",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/></svg> },
  { id: "top",    label: "Top",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8" strokeLinecap="round"/></svg> },
  { id: "bottom", label: "Bottom",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="16" x2="16" y2="16" strokeLinecap="round"/></svg> },
  { id: "left",   label: "Left",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="8" y2="16" strokeLinecap="round"/></svg> },
  { id: "right",  label: "Right",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="16" y1="8" x2="16" y2="16" strokeLinecap="round"/></svg> },
];

// ─── Per-line state ────────────────────────────────────────────────────────

interface LineState {
  text: string;
  fontId: string;
  fontSize: number;
  colorId: string;
  letterSpacingEm: number;
  autoPos: PositionId;   // used when posX/posY is null
  posX: number | null;   // canvas-px center X; null = use autoPos
  posY: number | null;   // canvas-px center Y
}

// Bounding box in canvas pixels
interface BBox { cx: number; cy: number; x: number; y: number; w: number; h: number; }

// ─── Shape detection ───────────────────────────────────────────────────────

type ShapeId = "oval" | "circle" | "rect" | "tag";

function detectShape(product: Product): ShapeId {
  const t = `${product.name} ${product.category ?? ""}`.toLowerCase();
  if (t.includes("bowl")) return "oval";
  if (t.includes("plate") || t.includes("disc")) return "circle";
  if (t.includes("tag") || t.includes("label")) return "tag";
  return "rect";
}

function defaultAutoPos(shape: ShapeId, lineIdx: number): PositionId {
  if (shape === "oval" || shape === "circle") return lineIdx === 0 ? "bottom" : "top";
  return lineIdx === 0 ? "center" : "top";
}

// Auto position → canvas coordinates (center of text area)
function getAutoXY(pos: PositionId, shape: ShapeId): { cx: number; cy: number } {
  const isRound = shape === "oval" || shape === "circle";
  switch (pos) {
    case "top":    return { cx: CW / 2, cy: isRound ? CH * 0.16 : CH * 0.20 };
    case "bottom": return { cx: CW / 2, cy: isRound ? CH * 0.84 : CH * 0.80 };
    case "left":   return { cx: isRound ? CW * 0.18 : CW * 0.20, cy: CH / 2  };
    case "right":  return { cx: isRound ? CW * 0.82 : CW * 0.80, cy: CH / 2  };
    default:       return { cx: CW / 2, cy: CH / 2 };
  }
}

// ─── Canvas drawing helpers ────────────────────────────────────────────────

function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = "#c49a6c";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 32; i++) {
    const yBase = (i / 32) * H;
    const amp = 3 + Math.random() * 14, freq = 1.5 + Math.random() * 2.5, phase = Math.random() * Math.PI * 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const y = yBase + Math.sin((x / W) * Math.PI * 2 * freq + phase) * amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i % 3 === 0 ? "#8b5e3c" : "#a87850";
    ctx.lineWidth = 0.4 + Math.random() * 1.6;
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
    const tw = W * 0.4, th = H * 0.76, r = 14, tx = W/2 - tw/2, ty = H/2 - th/2;
    ctx.moveTo(tx+r,ty); ctx.lineTo(tx+tw-r,ty); ctx.quadraticCurveTo(tx+tw,ty,tx+tw,ty+r);
    ctx.lineTo(tx+tw,ty+th-r); ctx.quadraticCurveTo(tx+tw,ty+th,tx+tw-r,ty+th);
    ctx.lineTo(tx+r,ty+th); ctx.quadraticCurveTo(tx,ty+th,tx,ty+th-r);
    ctx.lineTo(tx,ty+r); ctx.quadraticCurveTo(tx,ty,tx+r,ty); ctx.closePath();
  } else {
    const pw = W*0.86, ph = H*0.78, r = 16, px = (W-pw)/2, py = (H-ph)/2;
    ctx.moveTo(px+r,py); ctx.lineTo(px+pw-r,py); ctx.quadraticCurveTo(px+pw,py,px+pw,py+r);
    ctx.lineTo(px+pw,py+ph-r); ctx.quadraticCurveTo(px+pw,py+ph,px+pw-r,py+ph);
    ctx.lineTo(px+r,py+ph); ctx.quadraticCurveTo(px,py+ph,px,py+ph-r);
    ctx.lineTo(px,py+r); ctx.quadraticCurveTo(px,py,px+r,py); ctx.closePath();
  }
}

/** Draw text curved along the top or bottom rim of the shape. */
function drawCurvedText(
  ctx: CanvasRenderingContext2D, text: string,
  cx: number, cy: number, rx: number, ry: number,
  fill: string, glow: string,
  pos: "top" | "bottom" | "center",
  lsPx: number,
): BBox {
  const charWidths = text.split("").map(ch => ctx.measureText(ch).width + lsPx);
  const totalW = Math.max(charWidths.reduce((a, b) => a + b, 0) - lsPx, 1);
  const isBottom = pos === "bottom";
  const useRx = rx * 0.88, useRy = ry * 0.88;
  const avgR  = (useRx + useRy) / 2;
  const arcSpan = Math.min((totalW / avgR) * 1.05, Math.PI * 1.3);
  const midA  = isBottom ? Math.PI / 2 : -Math.PI / 2;
  let curA    = midA - arcSpan / 2;

  ctx.save();
  ctx.fillStyle = fill;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 14;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < text.length; i++) {
    const charA = curA + (charWidths[i] - lsPx) / 2 / avgR;
    const x = cx + useRx * Math.cos(charA);
    const y = cy + useRy * Math.sin(charA);
    const rot = isBottom ? charA + Math.PI / 2 : charA - Math.PI / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.strokeText(text[i], 0, 0);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
    curA += charWidths[i] / avgR;
  }
  ctx.restore();

  // Approximate bbox center at the midpoint of the arc
  const bbCy = isBottom ? cy + useRy : cy - useRy;
  const bbW  = Math.min(totalW * 1.1, CW * 0.8);
  const bbH  = ctx.measureText("M").width * 1.6; // rough em height
  return { cx: cx, cy: bbCy, x: cx - bbW/2, y: bbCy - bbH/2, w: bbW, h: bbH };
}

/** Draw straight text (horizontal or vertical). */
function drawStraightText(
  ctx: CanvasRenderingContext2D, text: string,
  cx: number, cy: number,
  fill: string, glow: string,
  vertical: boolean,
): void {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = glow;
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 2;
  if (vertical) {
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
  } else {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeText(text, cx, cy);
    ctx.fillText(text, cx, cy);
  }
  ctx.restore();
}

/** Draw selection rectangle around active text. */
function drawSelectionBox(ctx: CanvasRenderingContext2D, bb: BBox) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(bb.x - 8, bb.y - 6, bb.w + 16, bb.h + 12);
  // Drag handle dot at center
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(bb.cx, bb.cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw centre snap guide lines. */
function drawSnapGuides(ctx: CanvasRenderingContext2D, W: number, H: number, guides: { x?: number; y?: number }) {
  ctx.save();
  ctx.strokeStyle = "rgba(80,200,255,0.75)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  if (guides.x !== undefined) {
    ctx.beginPath(); ctx.moveTo(guides.x, 0); ctx.lineTo(guides.x, H); ctx.stroke();
  }
  if (guides.y !== undefined) {
    ctx.beginPath(); ctx.moveTo(0, guides.y); ctx.lineTo(W, guides.y); ctx.stroke();
  }
  ctx.restore();
}

// ─── Main canvas render ────────────────────────────────────────────────────

async function renderToCanvas(
  canvas: HTMLCanvasElement,
  opts: {
    lines: LineState[];
    shape: ShapeId;
    productImageSrc: string | null;
    activeLineIdx: number;
    snapGuides: { x?: number; y?: number };
  },
): Promise<Array<BBox | null>> {
  const { lines, shape, productImageSrc, activeLineIdx, snapGuides } = opts;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(0, 0, W, H);

  // Shape fill: product image or grain
  ctx.save();
  tracePath(ctx, shape, W, H);
  ctx.clip();
  if (productImageSrc) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = productImageSrc; });
      const aspect = img.naturalWidth / img.naturalHeight, ca = W / H;
      let sw = W, sh = H, sx = 0, sy = 0;
      if (aspect > ca) { sw = H * aspect; sx = -(sw - W) / 2; }
      else             { sh = W / aspect; sy = -(sh - H) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(0, 0, W, H);
    } catch { drawGrain(ctx, W, H); }
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

  const bboxes: Array<BBox | null> = [null, null];

  // Draw each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.text.trim()) continue;

    const font  = FONT_CATALOGUE.find(f => f.id === line.fontId) ?? FONT_CATALOGUE[0];
    const color = TEXT_COLORS.find(c => c.id === line.colorId) ?? TEXT_COLORS[0];
    const lsPx  = Math.round(line.letterSpacingEm * line.fontSize);

    try { await document.fonts.load(`bold ${line.fontSize}px ${font.family}`); } catch { /* fallback */ }

    const c2 = canvas.getContext("2d")!;
    if ("letterSpacing" in c2) {
      (c2 as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${lsPx}px`;
    }
    ctx.font = `${line.fontSize}px ${font.family}`;

    const rawW = ctx.measureText(line.text).width;
    const lsAdj = lsPx * Math.max(line.text.length - 1, 0);
    const textW = rawW + lsAdj;
    const textH = line.fontSize * 1.35;

    const isRound    = shape === "oval" || shape === "circle";
    const isDragged  = line.posX !== null && line.posY !== null;
    const isCurved   = !isDragged && isRound &&
                       (line.autoPos === "top" || line.autoPos === "bottom" || line.autoPos === "center");
    const isVertical = !isDragged && (line.autoPos === "left" || line.autoPos === "right");

    let cx: number, cy: number;

    if (isDragged) {
      cx = line.posX!;
      cy = line.posY!;
      drawStraightText(ctx, line.text, cx, cy, color.fill, color.glow, false);
      bboxes[i] = { cx, cy, x: cx - textW/2, y: cy - textH/2, w: textW, h: textH };
    } else if (isCurved) {
      const rx = shape === "oval" ? W * 0.44 : Math.min(W, H) * 0.41;
      const ry = shape === "oval" ? H * 0.41 : Math.min(W, H) * 0.41;
      const bb = drawCurvedText(ctx, line.text, W/2, H/2, rx, ry, color.fill, color.glow, line.autoPos as "top"|"bottom"|"center", lsPx);
      cx = bb.cx; cy = bb.cy;
      bboxes[i] = bb;
    } else {
      const auto = getAutoXY(line.autoPos, shape);
      cx = auto.cx; cy = auto.cy;
      drawStraightText(ctx, line.text, cx, cy, color.fill, color.glow, isVertical);
      bboxes[i] = { cx, cy, x: cx - textW/2, y: cy - textH/2, w: textW, h: textH };
    }
  }

  // Selection boxes (draw after text so they're on top)
  for (let i = 0; i < lines.length; i++) {
    if (i === activeLineIdx && bboxes[i] && lines[i].text.trim()) {
      drawSelectionBox(ctx, bboxes[i]!);
    }
  }

  // Snap guides
  drawSnapGuides(ctx, W, H, snapGuides);

  return bboxes;
}

// ─── Font picker components ────────────────────────────────────────────────

function FontPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [query, setQuery]         = useState("");
  const [openGroup, setOpenGroup] = useState<string>("Popular");
  const popular  = FONT_CATALOGUE.filter(f => POPULAR_IDS.includes(f.id));
  const filtered = query.trim() ? FONT_CATALOGUE.filter(f => f.name.toLowerCase().includes(query.toLowerCase())) : null;
  return (
    <div>
      <div className="relative mb-2">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search fonts…"
          className="w-full h-10 border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-900 transition-colors pr-9 rounded" />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
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
            <FontGroupSection label="Popular" open={openGroup === "Popular"} onToggle={() => setOpenGroup(g => g === "Popular" ? "" : "Popular")}>
              {popular.map(f => <FontRow key={f.id} font={f} selected={f.id === value} onClick={() => onChange(f.id)} />)}
            </FontGroupSection>
            {CATEGORIES.map(cat => (
              <FontGroupSection key={cat} label={cat} open={openGroup === cat} onToggle={() => setOpenGroup(g => g === cat ? "" : cat)}>
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

function FontGroupSection({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">{label}</span>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
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
      className={`w-full flex items-center justify-between px-3 py-2.5 border-b border-gray-50 last:border-0 text-left transition-colors ${selected ? "bg-gray-900" : "hover:bg-gray-50"}`}>
      <span style={{ fontFamily: font.family }} className={`text-[18px] leading-tight truncate ${selected ? "text-white" : "text-gray-900"}`}>{font.name}</span>
      <span className={`text-[10px] shrink-0 ml-2 tracking-wide ${selected ? "text-white/50" : "text-gray-400"}`}>{font.category}</span>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">{children}</p>;
}

// ─── Line controls (reusable per-line settings panel) ─────────────────────

function LineControls({
  line, onChange, shape,
}: {
  line: LineState;
  onChange: (patch: Partial<LineState>) => void;
  shape: ShapeId;
}) {
  const [showFFP, setShowFFP] = useState(false);
  const font = FONT_CATALOGUE.find(f => f.id === line.fontId) ?? FONT_CATALOGUE[0];
  const lsPercent = Math.round(((line.letterSpacingEm - (-0.05)) / 0.35) * 100);
  const isRound = shape === "oval" || shape === "circle";

  return (
    <div className="space-y-5">
      {/* Font */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Font</SectionLabel>
          <button onClick={() => setShowFFP(p => !p)} className="text-[10px] text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors -mt-3">
            {showFFP ? "Close" : "Browse all"}
            <motion.svg animate={{ rotate: showFFP ? 180 : 0 }} transition={{ duration: 0.18 }} className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </motion.svg>
          </button>
        </div>
        {!showFFP && (
          <div className="grid grid-cols-3 gap-2">
            {FONT_CATALOGUE.filter(f => POPULAR_IDS.includes(f.id)).map(f => (
              <button key={f.id} onClick={() => onChange({ fontId: f.id })}
                className={`min-h-[68px] px-3 py-2.5 border-2 text-left rounded transition-all flex flex-col justify-between ${line.fontId === f.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white hover:border-gray-400"}`}>
                <span style={{ fontFamily: f.family }} className={`block text-[20px] leading-tight ${line.fontId === f.id ? "text-white" : "text-gray-900"}`}>Aa</span>
                <span className={`text-[9px] tracking-wide leading-tight mt-1 ${line.fontId === f.id ? "text-white/60" : "text-gray-400"}`}>{f.name}</span>
              </button>
            ))}
          </div>
        )}
        <AnimatePresence initial={false}>
          {showFFP && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
              <FontPicker value={line.fontId} onChange={id => { onChange({ fontId: id }); setShowFFP(false); }} />
            </motion.div>
          )}
        </AnimatePresence>
        {!showFFP && (
          <p className="mt-2 text-[11px] text-gray-400">
            Selected: <span style={{ fontFamily: font.family }} className="text-gray-900 text-[14px]">{font.name}</span>
          </p>
        )}
      </div>

      {/* Font size */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Font Size</SectionLabel>
          <span className="text-[11px] font-semibold text-gray-900 tabular-nums -mt-3">{line.fontSize}px</span>
        </div>
        <input type="range" min={24} max={72} step={2} value={line.fontSize}
          onChange={e => onChange({ fontSize: Number(e.target.value) })}
          className="w-full accent-gray-900" />
        <div className="flex justify-between text-[9px] text-gray-400 mt-1"><span>Small</span><span>Large</span></div>
      </div>

      {/* Letter spacing */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Letter Spacing</SectionLabel>
          <span className="text-[11px] font-semibold text-gray-900 tabular-nums -mt-3">
            {line.letterSpacingEm === 0 ? "0" : line.letterSpacingEm > 0 ? `+${line.letterSpacingEm.toFixed(2)}` : line.letterSpacingEm.toFixed(2)}em
          </span>
        </div>
        <input type="range" min={0} max={100} step={1} value={lsPercent}
          onChange={e => {
            const pct = Number(e.target.value) / 100;
            onChange({ letterSpacingEm: Math.round((-0.05 + pct * 0.35) * 100) / 100 });
          }}
          className="w-full accent-gray-900" />
        <div className="flex justify-between text-[9px] text-gray-400 mt-1"><span>Tight</span><span>Normal</span><span>Wide</span></div>
      </div>

      {/* Colour */}
      <div>
        <SectionLabel>Text Colour</SectionLabel>
        <div className="flex gap-3 flex-wrap">
          {TEXT_COLORS.map(c => (
            <button key={c.id} onClick={() => onChange({ colorId: c.id })} title={c.label} className="flex flex-col items-center gap-1.5 group">
              <div className={`w-9 h-9 rounded-full border-2 transition-all ${line.colorId === c.id ? "border-gray-900 scale-110 shadow-lg" : "border-gray-200 group-hover:border-gray-400"}`}
                style={{ background: c.swatch, outline: line.colorId === c.id ? "2px solid white" : "none", outlineOffset: "-3px" }} />
              <span className={`text-[9px] tracking-wide ${line.colorId === c.id ? "text-gray-900 font-semibold" : "text-gray-400"}`}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Position */}
      <div>
        <SectionLabel>Snap Position <span className="normal-case tracking-normal font-normal text-gray-400">(or drag on canvas)</span></SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {POSITIONS.map(p => (
            <button key={p.id} onClick={() => onChange({ autoPos: p.id, posX: null, posY: null })} title={p.label}
              className={`flex flex-col items-center gap-1.5 px-3 py-2.5 border-2 rounded transition-all min-w-[52px] ${
                line.autoPos === p.id && line.posX === null
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
              }`}>
              {p.icon}
              <span className="text-[9px] tracking-wide">{p.label}</span>
            </button>
          ))}
        </div>
        {isRound && (
          <p className="mt-2 text-[10px] text-gray-400">
            Top, Centre &amp; Bottom curve along the rim. Drag text on the preview to position freely.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────

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

  const makeDefaultLine = (idx: number): LineState => ({
    text: "",
    fontId: idx === 0 ? "playfair" : "dancing",
    fontSize: idx === 0 ? 38 : 30,
    colorId: "natural",
    letterSpacingEm: 0.05,
    autoPos: defaultAutoPos(shape, idx),
    posX: null,
    posY: null,
  });

  const [lines, setLines]         = useState<[LineState, LineState]>([makeDefaultLine(0), makeDefaultLine(1)]);
  const [activeLine, setActiveLine] = useState<0 | 1>(0);
  const [line2Enabled, setLine2Enabled] = useState(false);
  const [fontsLoaded, setFontsLoaded]   = useState(false);
  const [showDragHint, setShowDragHint] = useState(true);
  const [snapGuides, setSnapGuides]     = useState<{ x?: number; y?: number }>({});
  const [isDragging, setIsDragging]     = useState(false);

  const [showFFP, setShowFFP]   = useState(false);   // unused outer – kept for TS
  const [fileName, setFileName] = useState("");
  const [notes, setNotes]       = useState("");

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  // Refs for event handlers (avoid stale closures)
  const linesRef      = useRef(lines);
  const activeRef     = useRef(activeLine);
  const bboxesRef     = useRef<Array<BBox | null>>([null, null]);
  const draggingRef   = useRef<{ lineIdx: number; offsetX: number; offsetY: number } | null>(null);
  const pinchDistRef  = useRef<number>(0);
  const snapGuidesRef = useRef(snapGuides);

  linesRef.current      = lines;
  activeRef.current     = activeLine;
  snapGuidesRef.current = snapGuides;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Load Google Fonts once
  useEffect(() => {
    if (document.getElementById("engraving-gfonts")) { setFontsLoaded(true); return; }
    const params = FONT_CATALOGUE.map(f => `family=${f.google}:wght@400;700`).join("&");
    const link = Object.assign(document.createElement("link"), {
      id: "engraving-gfonts", rel: "stylesheet",
      href: `https://fonts.googleapis.com/css2?${params}&display=swap`,
    });
    link.onload = () => setFontsLoaded(true);
    document.head.appendChild(link);
  }, []);

  // Redraw
  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const visibleLines = line2Enabled ? lines : [lines[0], { ...lines[1], text: "" }] as [LineState, LineState];
    const bbs = await renderToCanvas(canvas, {
      lines: visibleLines,
      shape,
      productImageSrc: product.image || null,
      activeLineIdx: activeLine,
      snapGuides,
    });
    bboxesRef.current = bbs;
  }, [lines, shape, product.image, activeLine, snapGuides, line2Enabled]);

  useEffect(() => { redraw(); }, [redraw]);
  useEffect(() => { if (fontsLoaded) redraw(); }, [fontsLoaded, redraw]);

  // ── Canvas interaction ──────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (CW / rect.width),
        y: (clientY - rect.top)  * (CH / rect.height),
      };
    };

    const hitTest = (x: number, y: number): number | null => {
      // Check top line first (reverse order)
      const bbs = bboxesRef.current;
      for (let i = bbs.length - 1; i >= 0; i--) {
        const bb = bbs[i];
        if (!bb) continue;
        // Expand hit area by 12px for easier tapping
        if (x >= bb.x - 12 && x <= bb.x + bb.w + 12 && y >= bb.y - 12 && y <= bb.y + bb.h + 12) return i;
      }
      return null;
    };

    const applyDrag = (clientX: number, clientY: number) => {
      const drag = draggingRef.current;
      if (!drag) return;
      const pos = getCanvasPos(clientX, clientY);
      let newX = pos.x - drag.offsetX;
      let newY = pos.y - drag.offsetY;

      // Constrain inside canvas with padding
      newX = Math.max(50, Math.min(CW - 50, newX));
      newY = Math.max(24, Math.min(CH - 24, newY));

      // Snap to centre
      const guides: { x?: number; y?: number } = {};
      if (Math.abs(newX - CW / 2) < SNAP_DIST) { newX = CW / 2; guides.x = CW / 2; }
      if (Math.abs(newY - CH / 2) < SNAP_DIST) { newY = CH / 2; guides.y = CH / 2; }
      setSnapGuides(guides);

      setLines(prev => {
        const next = [...prev] as [LineState, LineState];
        next[drag.lineIdx] = { ...next[drag.lineIdx], posX: newX, posY: newY };
        return next;
      });
    };

    // ── Mouse ──────────────────────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      const pos = getCanvasPos(e.clientX, e.clientY);
      const hit = hitTest(pos.x, pos.y);
      if (hit === null) return;
      const bb = bboxesRef.current[hit];
      if (!bb) return;
      draggingRef.current = { lineIdx: hit, offsetX: pos.x - bb.cx, offsetY: pos.y - bb.cy };
      setActiveLine(hit as 0 | 1);
      setIsDragging(true);
      setShowDragHint(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) {
        applyDrag(e.clientX, e.clientY);
        canvas.style.cursor = "grabbing";
        return;
      }
      const pos = getCanvasPos(e.clientX, e.clientY);
      canvas.style.cursor = hitTest(pos.x, pos.y) !== null ? "grab" : "default";
    };

    const onMouseUp = () => {
      draggingRef.current = null;
      setIsDragging(false);
      setSnapGuides({});
      canvas.style.cursor = "default";
    };

    // ── Touch ──────────────────────────────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const pos = getCanvasPos(t.clientX, t.clientY);
        const hit = hitTest(pos.x, pos.y);
        if (hit === null) return;
        const bb = bboxesRef.current[hit];
        if (!bb) return;
        draggingRef.current = { lineIdx: hit, offsetX: pos.x - bb.cx, offsetY: pos.y - bb.cy };
        setActiveLine(hit as 0 | 1);
        setIsDragging(true);
        setShowDragHint(false);
      } else if (e.touches.length === 2) {
        draggingRef.current = null;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistRef.current = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && draggingRef.current) {
        applyDrag(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && pinchDistRef.current > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.hypot(dx, dy);
        const scale = newDist / pinchDistRef.current;
        pinchDistRef.current = newDist;
        const idx = activeRef.current;
        setLines(prev => {
          const next = [...prev] as [LineState, LineState];
          const newSize = Math.max(24, Math.min(72, Math.round(next[idx].fontSize * scale)));
          next[idx] = { ...next[idx], fontSize: newSize };
          return next;
        });
      }
    };

    const onTouchEnd = () => {
      draggingRef.current = null;
      setIsDragging(false);
      setSnapGuides({});
    };

    canvas.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, []); // refs handle mutable state — no deps needed

  // ── Helpers ──────────────────────────────────────────────────────────────

  function updateLine(idx: 0 | 1, patch: Partial<LineState>) {
    setLines(prev => {
      const next = [...prev] as [LineState, LineState];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function resetPosition(idx: 0 | 1) {
    updateLine(idx, { posX: null, posY: null });
  }

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
    const l1 = lines[0], l2 = line2Enabled ? lines[1] : null;
    const col1 = TEXT_COLORS.find(c => c.id === l1.colorId);
    const parts = [
      l1.text ? `"${l1.text.slice(0, 24)}"` : null,
      l1.text ? FONT_CATALOGUE.find(f => f.id === l1.fontId)?.name : null,
      col1 && l1.colorId !== "natural" ? col1.label : null,
      l2?.text ? `+ "${l2.text.slice(0, 20)}"` : null,
      fileName ? "+ image" : null,
    ].filter(Boolean).join(" · ");

    onAddToCart({
      fabricJson: JSON.stringify({
        lines: line2Enabled ? lines : [lines[0]],
        fileName,
        notes,
        posX1: lines[0].posX,
        posY1: lines[0].posY,
        posX2: lines[1].posX,
        posY2: lines[1].posY,
      }),
      previewDataUrl,
      summary: parts || "Custom engraving",
      productId: product.id,
    });
  }

  const hasAnyText = lines[0].text.trim() || (line2Enabled && lines[1].text.trim());
  const isDragged0 = lines[0].posX !== null;
  const isDragged1 = lines[1].posX !== null;

  // ── Render ────────────────────────────────────────────────────────────────

  const modal = (
    <AnimatePresence>
      <motion.div
        key="engraving-modal"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-white w-full max-w-[960px] max-h-[92vh] flex flex-col rounded-xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-0.5">Personalise</p>
              <h2 className="text-lg font-semibold text-gray-900 leading-none">Add Engraving</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row min-h-0">

              {/* ── LEFT: canvas ── */}
              <div className="md:w-1/2 bg-gray-950 flex flex-col items-center justify-center p-5 gap-3 shrink-0">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-center">
                  Your Engraving Preview
                </p>

                <div className="relative rounded-lg overflow-hidden bg-black w-full select-none">
                  <canvas ref={canvasRef} width={CW} height={CH} className="w-full block" />

                  {/* Drag hint overlay */}
                  {hasAnyText && showDragHint && !isDragging && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                      <div className="bg-black/60 text-white/80 text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3"/>
                        </svg>
                        Drag text to reposition
                      </div>
                    </div>
                  )}

                  {/* Dragging position indicator */}
                  {isDragging && (() => {
                    const l = lines[activeLine];
                    if (l.posX === null) return null;
                    const px = Math.round((l.posX / CW) * 100);
                    const py = Math.round((l.posY! / CH) * 100);
                    return (
                      <div className="absolute top-2 right-2 bg-black/70 text-white/70 text-[9px] font-mono px-2 py-1 rounded pointer-events-none">
                        {px}% · {py}%
                      </div>
                    );
                  })()}
                </div>

                {/* Reset + Download */}
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => { resetPosition(activeLine); setActiveLine(activeLine); }}
                    disabled={activeLine === 0 ? !isDragged0 : !isDragged1}
                    title="Reset text to default position"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-white/15 text-white/50 hover:text-white hover:border-white/40 text-[10px] tracking-widest uppercase transition-colors disabled:opacity-25 disabled:cursor-not-allowed rounded"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Reset Position
                  </button>
                  <button
                    onClick={downloadPreview}
                    disabled={!hasAnyText}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-white/15 text-white/50 hover:text-white hover:border-white/40 text-[10px] tracking-widest uppercase transition-colors disabled:opacity-25 disabled:cursor-not-allowed rounded"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Save PNG
                  </button>
                </div>

                {/* Pinch hint on touch devices */}
                <p className="text-[9px] text-gray-600 text-center tracking-wide">
                  Drag text to position · Pinch to resize on mobile
                </p>
              </div>

              {/* ── RIGHT: controls ── */}
              <div className="md:w-1/2 overflow-y-auto p-6 space-y-6">

                {/* Line tabs */}
                <div>
                  <div className="flex gap-1 border border-gray-200 p-1 rounded-lg mb-4">
                    <button
                      onClick={() => setActiveLine(0)}
                      className={`flex-1 py-2 text-[11px] font-semibold tracking-wide rounded-md transition-all ${activeLine === 0 ? "bg-gray-900 text-white shadow" : "text-gray-500 hover:text-gray-900"}`}
                    >
                      Line 1
                      {lines[0].text && <span className="ml-1 opacity-60">· {lines[0].text.slice(0, 10)}{lines[0].text.length > 10 ? "…" : ""}</span>}
                    </button>
                    <button
                      onClick={() => { setActiveLine(1); if (!line2Enabled) setLine2Enabled(true); }}
                      className={`flex-1 py-2 text-[11px] font-semibold tracking-wide rounded-md transition-all ${
                        activeLine === 1 ? "bg-gray-900 text-white shadow" : "text-gray-500 hover:text-gray-900"
                      } ${!line2Enabled ? "border-dashed border-2 border-gray-200" : ""}`}
                    >
                      {line2Enabled
                        ? <>Line 2{lines[1].text && <span className="ml-1 opacity-60">· {lines[1].text.slice(0, 10)}{lines[1].text.length > 10 ? "…" : ""}</span>}</>
                        : "+ Add 2nd Line"}
                    </button>
                  </div>

                  {/* Text input for active line */}
                  <SectionLabel>Engraving Text {activeLine === 1 ? "(Line 2)" : "(Line 1)"}</SectionLabel>
                  <div className="relative">
                    <input
                      type="text"
                      value={lines[activeLine].text}
                      onChange={e => updateLine(activeLine, { text: e.target.value.slice(0, 40) })}
                      placeholder={activeLine === 0 ? "Name, date, or short quote…" : "Add a second line…"}
                      autoFocus={activeLine === 0}
                      className="w-full h-12 border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-900 transition-colors pr-14 rounded"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 tabular-nums">
                      {lines[activeLine].text.length}/40
                    </span>
                  </div>

                  {/* Remove line 2 */}
                  {line2Enabled && activeLine === 1 && (
                    <button
                      onClick={() => { updateLine(1, { text: "", posX: null, posY: null }); setLine2Enabled(false); setActiveLine(0); }}
                      className="mt-2 text-[10px] text-red-400 hover:text-red-600 underline-offset-2 hover:underline"
                    >
                      Remove 2nd line
                    </button>
                  )}
                </div>

                {/* Per-line controls */}
                <LineControls
                  key={activeLine}
                  line={lines[activeLine]}
                  onChange={patch => updateLine(activeLine, patch)}
                  shape={shape}
                />

                {/* Image upload */}
                <div>
                  <SectionLabel>Reference Image <span className="normal-case tracking-normal font-normal text-gray-400">(optional)</span></SectionLabel>
                  <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => setFileName(e.target.files?.[0]?.name ?? "")} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="h-10 border border-gray-200 bg-white px-4 text-xs text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all rounded">
                      Choose File
                    </button>
                    {fileName
                      ? <span className="text-xs text-gray-900 truncate max-w-[180px]">{fileName}</span>
                      : <span className="text-xs text-gray-400">No file chosen</span>}
                    {fileName && <button onClick={() => setFileName("")} className="text-red-400 text-xs hover:text-red-600 hover:underline">Remove</button>}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <SectionLabel>Special Notes <span className="normal-case tracking-normal font-normal text-gray-400">(optional)</span></SectionLabel>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="Any specific requests for our craftspeople…"
                    className="w-full border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 transition-colors resize-none rounded" />
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAdd}
                  className="w-full h-14 bg-gray-900 text-white text-[12px] tracking-[0.18em] uppercase font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
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
