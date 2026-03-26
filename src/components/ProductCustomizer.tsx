"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Product } from "@/lib/products";
import type { CustomizationData } from "@/context/CartContext";

/* ─── Constants ────────────────────────────────────────────────────── */
const CW = 520; // canvas width
const CH = 520; // canvas height
const FONTS = ["Arial", "Georgia", "Impact", "Trebuchet MS", "Courier New", "Verdana"];
type Tool = "text" | "shape" | "upload" | "color";
type ShapeKind = "rect" | "circle" | "triangle" | "star" | "heart";

/* ─── Star / Heart path helpers ────────────────────────────────────── */
function starPoints(n: number, outer: number, inner: number) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push({ x: outer + r * Math.cos(a), y: outer + r * Math.sin(a) });
  }
  return pts;
}

const HEART_PATH =
  "M 272.70141,238.71731 " +
  "C 206.46141,238.71731 152.70146,292.4773 152.70146,358.71731 " +
  "C 152.70146,493.47282 288.63461,528.80461 381.26251,662.02535 " +
  "C 468.83815,528.17939 609.82371,492.66604 609.82371,358.71731 " +
  "C 609.82371,292.47731 556.06376,238.71731 489.82376,238.71731 " +
  "C 441.77341,238.71731 400.42481,267.08774 381.26251,307.90481 " +
  "C 362.10021,267.08774 320.75161,238.71731 272.70141,238.71731 z";

/* ─── Types ──────────────────────────────────────────────────────── */
type Props = {
  product: Product;
  onClose: () => void;
  onAddToCart: (customization: CustomizationData) => void;
};

/* ─── Component ─────────────────────────────────────────────────── */
export default function ProductCustomizer({ product, onClose, onAddToCart }: Props) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fc = useRef<any>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const suppressHistory = useRef(false);

  const [tool, setTool] = useState<Tool>("text");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [adding, setAdding] = useState(false);

  // Text tool state
  const [textVal, setTextVal] = useState("Your text");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#111111");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  // Shape tool state
  const [shapeKind, setShapeKind] = useState<ShapeKind>("rect");
  const [shapeColor, setShapeColor] = useState("#d2ff1f");
  const [shapeBorder, setShapeBorder] = useState("#111111");

  // Color tool state
  const [bgTint, setBgTint] = useState("#ffffff");
  const [bgOpacity, setBgOpacity] = useState(0);

  /* ── History ──────────────────────────────────────────────────── */
  const saveSnap = useCallback(() => {
    if (suppressHistory.current || !fc.current) return;
    const json = JSON.stringify(fc.current.toJSON(["selectable", "evented"]));
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(json);
    historyIdxRef.current = historyRef.current.length - 1;
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(false);
  }, []);

  function restoreSnap(idx: number) {
    if (!fc.current) return;
    suppressHistory.current = true;
    const json = JSON.parse(historyRef.current[idx]);
    fc.current.loadFromJSON(json, () => {
      fc.current.renderAll();
      suppressHistory.current = false;
      setCanUndo(idx > 0);
      setCanRedo(idx < historyRef.current.length - 1);
    });
  }

  function undo() { if (historyIdxRef.current > 0) { historyIdxRef.current--; restoreSnap(historyIdxRef.current); } }
  function redo() { if (historyIdxRef.current < historyRef.current.length - 1) { historyIdxRef.current++; restoreSnap(historyIdxRef.current); } }

  /* ── Init Fabric.js ──────────────────────────────────────────── */
  useEffect(() => {
    let canvas: typeof fc.current;
    (async () => {
      const { fabric } = await import("fabric");
      if (!canvasElRef.current) return;

      canvas = new fabric.Canvas(canvasElRef.current, {
        width: CW,
        height: CH,
        backgroundColor: "#f5f5f3",
        preserveObjectStacking: true,
      });
      fc.current = canvas;

      // Product image as non-interactive background
      if (product.image) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fabric.Image.fromURL(
          product.image,
          (img: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const i = img as any;
            const scale = Math.min(CW / (i.width || CW), CH / (i.height || CH));
            i.set({
              scaleX: scale, scaleY: scale,
              originX: "center", originY: "center",
              left: CW / 2, top: CH / 2,
              selectable: false, evented: false, hoverCursor: "default",
            });
            canvas.add(i);
            canvas.sendToBack(i);
            canvas.renderAll();
            // Initial snapshot
            historyRef.current = [JSON.stringify(canvas.toJSON(["selectable", "evented"]))];
            historyIdxRef.current = 0;
          },
          { crossOrigin: "anonymous" }
        );
      } else {
        historyRef.current = [JSON.stringify(canvas.toJSON())];
        historyIdxRef.current = 0;
      }

      canvas.on("object:added", saveSnap);
      canvas.on("object:modified", saveSnap);
      canvas.on("object:removed", saveSnap);
      canvas.on("selection:created", () => setHasSelection(true));
      canvas.on("selection:updated", () => setHasSelection(true));
      canvas.on("selection:cleared", () => setHasSelection(false));
    })();

    return () => { canvas?.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Keyboard shortcuts ──────────────────────────────────────── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") { e.preventDefault(); redo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Lock body scroll ────────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* ── Canvas actions ──────────────────────────────────────────── */
  function deleteSelected() {
    const obj = fc.current?.getActiveObject();
    if (obj && obj.selectable !== false) { fc.current.remove(obj); fc.current.discardActiveObject(); fc.current.renderAll(); }
  }

  async function addText() {
    const { fabric } = await import("fabric");
    if (!fc.current) return;
    const t = new fabric.IText(textVal || "Text", {
      left: CW / 2, top: CH / 2,
      originX: "center", originY: "center",
      fontSize, fontFamily,
      fill: textColor,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      textAlign: "center",
    });
    fc.current.add(t);
    fc.current.setActiveObject(t);
    fc.current.renderAll();
  }

  async function addShape() {
    const { fabric } = await import("fabric");
    if (!fc.current) return;
    const base = { left: CW / 2, top: CH / 2, originX: "center", originY: "center", fill: shapeColor, stroke: shapeBorder, strokeWidth: 2 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any;
    if (shapeKind === "rect") obj = new fabric.Rect({ ...base, width: 120, height: 120, rx: 8, ry: 8 });
    else if (shapeKind === "circle") obj = new fabric.Circle({ ...base, radius: 60 });
    else if (shapeKind === "triangle") obj = new fabric.Triangle({ ...base, width: 120, height: 105 });
    else if (shapeKind === "star") obj = new fabric.Polygon(starPoints(5, 60, 26), { ...base });
    else if (shapeKind === "heart") obj = new fabric.Path(HEART_PATH, { ...base, scaleX: 0.15, scaleY: 0.15 });
    if (obj) { fc.current.add(obj); fc.current.setActiveObject(obj); fc.current.renderAll(); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !fc.current) return;
    const { fabric } = await import("fabric");
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fabric.Image.fromURL(url, (img: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const i = img as any;
      const scale = Math.min(180 / (i.width || 180), 180 / (i.height || 180));
      i.set({ left: CW / 2, top: CH / 2, originX: "center", originY: "center", scaleX: scale, scaleY: scale });
      fc.current.add(i);
      fc.current.setActiveObject(i);
      fc.current.renderAll();
    });
    e.target.value = "";
  }

  /* ── Tint overlay ────────────────────────────────────────────── */
  useEffect(() => {
    if (!fc.current) return;
    (async () => {
      const { fabric } = await import("fabric");
      const existing = fc.current.getObjects().find((o: { data?: { role?: string } }) => o.data?.role === "tint");
      if (existing) fc.current.remove(existing);
      if (bgOpacity > 0) {
        const r = new fabric.Rect({
          left: 0, top: 0, width: CW, height: CH,
          fill: bgTint, opacity: bgOpacity / 100,
          selectable: false, evented: false, hoverCursor: "default",
          data: { role: "tint" },
        });
        fc.current.add(r);
        // Keep tint just above the product image
        const objs = fc.current.getObjects();
        const productImg = objs.find((o: { selectable?: boolean; data?: { role?: string } }) => o.selectable === false && o.data?.role !== "tint");
        if (productImg) fc.current.bringForward(r);
        fc.current.sendToBack(r);
        fc.current.bringForward(r);
        fc.current.renderAll();
      }
      suppressHistory.current = true;
      setTimeout(() => { suppressHistory.current = false; }, 50);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgTint, bgOpacity]);

  /* ── Export & Add to Cart ────────────────────────────────────── */
  async function handleAddToCart() {
    if (!fc.current || adding) return;
    setAdding(true);
    try {
      const fabricJson = JSON.stringify(fc.current.toJSON(["selectable", "evented", "data"]));
      let previewDataUrl = "";
      try { previewDataUrl = fc.current.toDataURL({ format: "png", quality: 0.7, multiplier: 0.5 }); } catch { /* CORS */ }

      const objs = fc.current.getObjects();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textCount = objs.filter((o: any) => ["i-text", "text"].includes(o.type)).length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shapeCount = objs.filter((o: any) => ["rect", "circle", "triangle", "polygon", "path"].includes(o.type) && o.selectable !== false).length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imgCount = objs.filter((o: any) => o.type === "image" && o.selectable !== false).length;

      const parts: string[] = [];
      if (textCount) parts.push(`${textCount} text`);
      if (shapeCount) parts.push(`${shapeCount} shape${shapeCount > 1 ? "s" : ""}`);
      if (imgCount) parts.push(`${imgCount} uploaded image${imgCount > 1 ? "s" : ""}`);
      const summary = parts.length ? parts.join(", ") : "No customization";

      onAddToCart({ fabricJson, previewDataUrl, summary, productId: product.id });
    } finally {
      setAdding(false);
    }
  }

  /* ── Shape icons ─────────────────────────────────────────────── */
  const shapes: { kind: ShapeKind; label: string; svg: React.ReactNode }[] = [
    { kind: "rect", label: "Square", svg: <rect x="4" y="4" width="16" height="16" rx="2" /> },
    { kind: "circle", label: "Circle", svg: <circle cx="12" cy="12" r="8" /> },
    { kind: "triangle", label: "Triangle", svg: <polygon points="12,3 21,20 3,20" /> },
    { kind: "star", label: "Star", svg: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /> },
    { kind: "heart", label: "Heart", svg: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
  ];

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-[200] bg-[#f0f0ee] flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mr-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-sm font-medium text-gray-900 flex-1 truncate">
          Customise: <span className="text-gray-500">{product.name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Undo */}
          <button onClick={undo} disabled={!canUndo} title="Undo (⌘Z)"
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors rounded hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6-6M3 10l6 6" />
            </svg>
          </button>
          {/* Redo */}
          <button onClick={redo} disabled={!canRedo} title="Redo (⌘Y)"
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors rounded hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6-6M21 10l-6 6" />
            </svg>
          </button>

          {/* Delete selected */}
          <AnimatePresence>
            {hasSelection && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={deleteSelected}
                className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </motion.button>
            )}
          </AnimatePresence>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="ml-2 bg-gray-900 text-white text-xs font-semibold tracking-wide px-4 h-8 rounded hover:bg-black disabled:opacity-50 transition-colors"
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left tools panel ─────────────────────────────────── */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0">
          {/* Tool tabs */}
          <div className="grid grid-cols-4 border-b border-gray-100">
            {(["text", "shape", "upload", "color"] as Tool[]).map((t) => {
              const icons: Record<Tool, React.ReactNode> = {
                text: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>,
                shape: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 13.5l-4.5 7.5h9L11 13.5zm8.5-2.5a3 3 0 100-6 3 3 0 000 6zM3.5 18.5a4 4 0 100-8 4 4 0 000 8z"/></svg>,
                upload: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
                color: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>,
              };
              const labels: Record<Tool, string> = { text: "Text", shape: "Shape", upload: "Image", color: "Tint" };
              return (
                <button
                  key={t}
                  onClick={() => setTool(t)}
                  className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                    tool === t ? "text-gray-900 bg-gray-50 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {icons[t]}
                  {labels[t]}
                </button>
              );
            })}
          </div>

          {/* ── Tool options ──────────────────────────────────── */}
          <div className="p-4 space-y-4 flex-1">

            {/* TEXT ──────────────────────────────────────────── */}
            {tool === "text" && (
              <>
                <div>
                  <label className="label">Text content</label>
                  <input
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    className="field"
                    placeholder="Your text here"
                  />
                </div>
                <div>
                  <label className="label">Font</label>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="field">
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Size — {fontSize}px</label>
                  <input type="range" min={10} max={120} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-gray-900" />
                </div>
                <div>
                  <label className="label">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-9 w-14 rounded cursor-pointer border border-gray-200" />
                    <span className="text-xs text-gray-500 font-mono">{textColor}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setBold((b) => !b)} className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${bold ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>B</button>
                  <button onClick={() => setItalic((i) => !i)} className={`flex-1 py-1.5 text-xs italic rounded border transition-colors ${italic ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>I</button>
                </div>
                <button onClick={addText} className="btn-primary w-full">Add Text</button>
              </>
            )}

            {/* SHAPE ─────────────────────────────────────────── */}
            {tool === "shape" && (
              <>
                <div>
                  <label className="label">Shape</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {shapes.map((s) => (
                      <button
                        key={s.kind}
                        onClick={() => setShapeKind(s.kind)}
                        title={s.label}
                        className={`aspect-square flex items-center justify-center rounded border transition-colors ${
                          shapeKind === s.kind ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" strokeWidth={0.5} viewBox="0 0 24 24">{s.svg}</svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Fill color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)} className="h-9 w-14 rounded cursor-pointer border border-gray-200" />
                    <span className="text-xs text-gray-500 font-mono">{shapeColor}</span>
                  </div>
                </div>
                <div>
                  <label className="label">Border color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={shapeBorder} onChange={(e) => setShapeBorder(e.target.value)} className="h-9 w-14 rounded cursor-pointer border border-gray-200" />
                    <span className="text-xs text-gray-500 font-mono">{shapeBorder}</span>
                  </div>
                </div>
                <button onClick={addShape} className="btn-primary w-full">Add Shape</button>
              </>
            )}

            {/* UPLOAD ────────────────────────────────────────── */}
            {tool === "upload" && (
              <>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Upload your logo, artwork, or image to place it on the product. Drag to reposition, drag corners to resize.
                </p>
                <label className="btn-primary w-full text-center cursor-pointer block">
                  Choose Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
                <p className="text-[10px] text-gray-400 text-center">JPG, PNG, GIF, WebP</p>
              </>
            )}

            {/* COLOR TINT ────────────────────────────────────── */}
            {tool === "color" && (
              <>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Add a color tint overlay to the product to preview different color finishes.
                </p>
                <div>
                  <label className="label">Tint color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgTint} onChange={(e) => setBgTint(e.target.value)} className="h-9 w-14 rounded cursor-pointer border border-gray-200" />
                    <span className="text-xs text-gray-500 font-mono">{bgTint}</span>
                  </div>
                </div>
                <div>
                  <label className="label">Opacity — {bgOpacity}%</label>
                  <input type="range" min={0} max={80} value={bgOpacity} onChange={(e) => setBgOpacity(+e.target.value)} className="w-full accent-gray-900" />
                </div>
                {bgOpacity === 0 && (
                  <p className="text-[10px] text-gray-400">Increase opacity to apply the tint.</p>
                )}
              </>
            )}
          </div>

          {/* Tip */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Click any element on the canvas to select it. Drag to move, drag corners to resize. Press Delete to remove selected.
            </p>
          </div>
        </div>

        {/* ── Canvas area ──────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-6 bg-[#e8e8e6]">
          <div className="shadow-2xl rounded overflow-hidden">
            <canvas ref={canvasElRef} />
          </div>
        </div>
      </div>

      {/* Tailwind utility classes defined via style tag */}
      <style>{`
        .label { display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.04em; }
        .field { width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 10px; font-size: 13px; color: #111827; outline: none; background: white; }
        .field:focus { border-color: #111827; }
        .btn-primary { display: inline-block; background: #111827; color: white; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 6px; transition: background 0.15s; }
        .btn-primary:hover { background: #000; }
      `}</style>
    </div>
  );
}
