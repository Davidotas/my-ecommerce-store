"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ViewerSelections = {
  productType: string;
  wood:         string;
  finish:       string;
  colour:       string;
  engravingText:string;
  uploadedFile: File | null;
};

// ─── Finish material params ───────────────────────────────────────────────────

const FINISH_PARAMS: Record<string, { roughness: number; metalness: number }> = {
  "Smooth Polished": { roughness: 0.18, metalness: 0.06 },
  "Matte":           { roughness: 0.80, metalness: 0.00 },
  "Rough/Raw":       { roughness: 0.95, metalness: 0.00 },
  "Burnt Finish":    { roughness: 0.88, metalness: 0.00 },
  "Glossy":          { roughness: 0.04, metalness: 0.12 },
};

// ─── Wood colour palettes ─────────────────────────────────────────────────────

const WOOD_PALETTES: Record<string, { base: string; grain1: string; grain2: string }> = {
  "Oak":                  { base: "#d4a96a", grain1: "#b88040", grain2: "#9a6428" },
  "Walnut":               { base: "#6b4423", grain1: "#4d2f12", grain2: "#311808" },
  "Mahogany":             { base: "#8b3820", grain1: "#6a2614", grain2: "#4a1808" },
  "Reclaimed Mixed Wood": { base: "#9b7a5a", grain1: "#7a5a3a", grain2: "#5a3a20" },
};

const STAIN_OVERLAY: Record<string, string> = {
  "Natural":     "rgba(0,0,0,0)",
  "Dark Stain":  "rgba(12,6,2,0.42)",
  "Light Stain": "rgba(255,228,185,0.32)",
  "Ebony":       "rgba(4,2,1,0.72)",
  "Custom":      "rgba(0,0,0,0)",
};

// ─── Texture generator ────────────────────────────────────────────────────────

function generateWoodTexture(
  wood: string,
  colour: string,
  engravingText: string,
  uploadedImg: HTMLImageElement | null,
): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  const p = WOOD_PALETTES[wood] ?? WOOD_PALETTES["Oak"];

  // Base colour
  ctx.fillStyle = p.base;
  ctx.fillRect(0, 0, S, S);

  // Wood grain rings
  for (let i = 0; i < 45; i++) {
    const yBase   = (i / 45) * S;
    const amp     = 8 + Math.random() * 28;
    const waves   = 1.5 + Math.random() * 3;
    const phase   = Math.random() * Math.PI * 2;
    const phase2  = Math.random() * Math.PI * 2;

    ctx.beginPath();
    for (let x = 0; x <= S; x += 2) {
      const y =
        yBase +
        Math.sin((x / S) * Math.PI * 2 * waves + phase) * amp +
        Math.sin((x / S) * Math.PI * 4 + phase2) * (amp * 0.35);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i % 4 === 0 ? p.grain2 : p.grain1;
    ctx.lineWidth   = 0.4 + Math.random() * 2.8;
    ctx.globalAlpha = 0.18 + Math.random() * 0.45;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Subtle radial highlight (centre of piece)
  const grad = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.6);
  grad.addColorStop(0, "rgba(255,255,255,0.12)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // Colour/stain overlay
  ctx.fillStyle = STAIN_OVERLAY[colour] ?? "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, S, S);

  // Uploaded image composited in centre
  if (uploadedImg && uploadedImg.complete) {
    const scale  = Math.min((S * 0.55) / uploadedImg.width, (S * 0.55) / uploadedImg.height);
    const dw     = uploadedImg.width  * scale;
    const dh     = uploadedImg.height * scale;
    const dx     = (S - dw) / 2;
    const dy     = (S - dh) / 2;
    ctx.globalAlpha = 0.82;
    ctx.drawImage(uploadedImg, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }

  // Engraving text
  if (engravingText.trim()) {
    const fontSize = engravingText.length > 22 ? 26 : engravingText.length > 12 ? 34 : 42;
    ctx.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    // Depth shadow
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillText(engravingText, S / 2 + 1.5, S / 2 + 1.5);
    // Engraved text
    ctx.fillStyle = "rgba(18,7,2,0.68)";
    ctx.fillText(engravingText, S / 2, S / 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Geometry factory ─────────────────────────────────────────────────────────

function createGeometry(productType: string): THREE.BufferGeometry {
  switch (productType) {
    case "Bowl": {
      const pts: THREE.Vector2[] = [];
      // Wide shallow salad bowl: centre-bottom sweeps outward and upward to rim
      pts.push(new THREE.Vector2(0.0,  -0.48)); // bottom centre
      pts.push(new THREE.Vector2(0.12, -0.48)); // small flat base
      for (let i = 1; i <= 22; i++) {
        const t  = i / 22;
        const a  = t * Math.PI * 0.5;           // 0 → 90°
        const r  = 0.12 + Math.sin(a) * 1.38;  // 0.12 → 1.50
        const y  = -0.48 + (1 - Math.cos(a)) * 0.68; // -0.48 → 0.20
        pts.push(new THREE.Vector2(r, y));
      }
      // Rim lip
      pts.push(new THREE.Vector2(1.52, 0.22));
      pts.push(new THREE.Vector2(1.50, 0.24));
      return new THREE.LatheGeometry(pts, 64);
    }
    case "Plate": {
      const geo = new THREE.CylinderGeometry(1.45, 1.35, 0.14, 56);
      return geo;
    }
    case "Spoon": {
      // Lathe spoon bowl + thin cylinder handle — built as single LatheGeometry for simplicity
      const pts: THREE.Vector2[] = [];
      // Handle taper (slim at bottom)
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        pts.push(new THREE.Vector2(0.07 + t * 0.02, -1.1 + t * 0.9));
      }
      // Transition to bowl
      pts.push(new THREE.Vector2(0.15,  -0.22));
      pts.push(new THREE.Vector2(0.35,   0.02));
      pts.push(new THREE.Vector2(0.54,   0.16));
      pts.push(new THREE.Vector2(0.62,   0.28));
      // Bowl rim & inside
      pts.push(new THREE.Vector2(0.60,   0.30));
      pts.push(new THREE.Vector2(0.50,   0.26));
      pts.push(new THREE.Vector2(0.30,   0.16));
      pts.push(new THREE.Vector2(0.10,   0.04));
      return new THREE.LatheGeometry(pts, 40);
    }
    case "Wall Art": {
      return new THREE.BoxGeometry(1.75, 2.35, 0.1);
    }
    case "Tag": {
      const shape = new THREE.Shape();
      const w = 0.68, h = 1.08, r = 0.16;
      shape.moveTo(-w + r, -h);
      shape.lineTo( w - r, -h);
      shape.quadraticCurveTo( w, -h,  w, -h + r);
      shape.lineTo( w,  h - r);
      shape.quadraticCurveTo( w,  h,  w - r,  h);
      // Small hole at top for string
      const hole = new THREE.Path();
      hole.absarc(0, h - 0.22, 0.1, 0, Math.PI * 2, false);
      shape.holes.push(hole);
      shape.lineTo(-w + r,  h);
      shape.quadraticCurveTo(-w,  h, -w,  h - r);
      shape.lineTo(-w, -h + r);
      shape.quadraticCurveTo(-w, -h, -w + r, -h);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.12, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 4,
      });
      geo.center();
      return geo;
    }
    case "Key Holder": {
      const shape = new THREE.Shape();
      const w = 1.85, h = 0.52, r = 0.15;
      shape.moveTo(-w + r, -h);
      shape.lineTo( w - r, -h);
      shape.quadraticCurveTo( w, -h,  w, -h + r);
      shape.lineTo( w,  h - r);
      shape.quadraticCurveTo( w,  h,  w - r,  h);
      shape.lineTo(-w + r,  h);
      shape.quadraticCurveTo(-w,  h, -w,  h - r);
      shape.lineTo(-w, -h + r);
      shape.quadraticCurveTo(-w, -h, -w + r, -h);
      // Key hook holes
      for (const cx of [-1.1, -0.4, 0.3, 1.0]) {
        const hole = new THREE.Path();
        hole.absarc(cx, 0.08, 0.12, 0, Math.PI * 2, false);
        shape.holes.push(hole);
      }
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false });
      geo.center();
      return geo;
    }
    case "Sculpture": {
      return new THREE.DodecahedronGeometry(0.92, 0);
    }
    case "Frame": {
      const shape = new THREE.Shape();
      shape.moveTo(-1.15, -1.5);
      shape.lineTo( 1.15, -1.5);
      shape.lineTo( 1.15,  1.5);
      shape.lineTo(-1.15,  1.5);
      shape.lineTo(-1.15, -1.5);
      const inner = new THREE.Path();
      inner.moveTo(-0.75, -1.1);
      inner.lineTo( 0.75, -1.1);
      inner.lineTo( 0.75,  1.1);
      inner.lineTo(-0.75,  1.1);
      inner.lineTo(-0.75, -1.1);
      shape.holes.push(inner);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false });
      geo.center();
      return geo;
    }
    default: {
      // Generic block
      return new THREE.BoxGeometry(1.5, 1.5, 0.2);
    }
  }
}

// ─── Scene refs bag ───────────────────────────────────────────────────────────

interface SceneRefs {
  renderer:  THREE.WebGLRenderer;
  scene:     THREE.Scene;
  camera:    THREE.PerspectiveCamera;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controls:  any;
  mesh:      THREE.Mesh;
  material:  THREE.MeshStandardMaterial;
  texture:   THREE.CanvasTexture | null;
  rafId:     number;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductViewer3D({
  productType,
  wood,
  finish,
  colour,
  engravingText,
  uploadedFile,
}: ViewerSelections) {
  const mountRef     = useRef<HTMLDivElement>(null);
  const sceneRef     = useRef<SceneRefs | null>(null);
  const uploadImgRef = useRef<HTMLImageElement | null>(null);
  const cleanupRef   = useRef<(() => void) | null>(null);

  const [showHint, setShowHint] = useState(true);
  const [ready, setReady]       = useState(false);

  // ── Dismiss hint on first interaction ──────────────────────────────────────
  const dismissHint = useCallback(() => setShowHint(false), []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 2800);
    return () => clearTimeout(t);
  }, []);

  // ── Load uploaded file into an <img> for texture ───────────────────────────
  useEffect(() => {
    if (!uploadedFile) {
      uploadImgRef.current = null;
      return;
    }
    const url = URL.createObjectURL(uploadedFile);
    const img = new Image();
    img.onload = () => {
      uploadImgRef.current = img;
      // Re-generate texture if scene is ready
      if (sceneRef.current) refreshTexture(sceneRef.current);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile]);

  // ── Scene initialisation (once) ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const el = mountRef.current;
    if (!el) return;

    (async () => {
    const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
    if (cancelled || !mountRef.current) return;

    const w = el.clientWidth  || 400;
    const h = el.clientHeight || 400;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Subtle fog for depth
    scene.fog = new THREE.Fog(0x111111, 8, 20);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0.6, 3.8);

    // Lights ── warm studio setup
    const ambient = new THREE.AmbientLight(0xfff0d8, 0.35);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xffe8c0, 0x6b4423, 0.55);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffe0a0, 2.2);
    key.position.set(3, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far  = 20;
    key.shadow.camera.left = key.shadow.camera.bottom = -4;
    key.shadow.camera.right = key.shadow.camera.top  =  4;
    key.shadow.bias = -0.001;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xc8d8ff, 0.5);
    fill.position.set(-3, 1, -2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, 3, -3);
    scene.add(rim);

    // Ground shadow plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.25;
    ground.receiveShadow = true;
    scene.add(ground);

    // Initial mesh
    const geo  = createGeometry("");
    const mat  = new THREE.MeshStandardMaterial({
      color:     new THREE.Color(0xd4a96a),
      roughness: 0.7,
      metalness: 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.06;
    controls.enablePan      = false;
    controls.autoRotate     = true;
    controls.autoRotateSpeed = 1.4;
    controls.minDistance    = 1.8;
    controls.maxDistance    = 7;
    controls.maxPolarAngle  = Math.PI * 0.72;
    controls.minPolarAngle  = Math.PI * 0.1;

    // Stop auto-rotate on user interaction
    const stopAuto = () => { controls.autoRotate = false; };
    renderer.domElement.addEventListener("pointerdown", stopAuto);
    renderer.domElement.addEventListener("touchstart",  stopAuto, { passive: true });

    // Animate
    let rafId = 0;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    // Resize handler
    const onResize = () => {
      const { clientWidth: nw, clientHeight: nh } = el;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    sceneRef.current = { renderer, scene, camera, controls, mesh, material: mat, texture: null, rafId };
    setReady(true);

    cleanupRef.current = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", stopAuto);
      renderer.domElement.removeEventListener("touchstart",  stopAuto);
      controls.dispose();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Swap geometry when product type changes ────────────────────────────────
  useEffect(() => {
    if (!ready || !sceneRef.current) return;
    const s = sceneRef.current;

    const oldGeo = s.mesh.geometry;
    const newGeo = createGeometry(productType);
    s.mesh.geometry = newGeo;
    oldGeo.dispose();

    // Re-centre camera distance for each product
    const box    = new THREE.Box3().setFromObject(s.mesh);
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    s.camera.position.set(0, maxDim * 0.35, maxDim * 1.85 + 0.8);
    s.controls.minDistance = maxDim * 0.8;
    s.controls.maxDistance = maxDim * 4;
    s.controls.autoRotate  = true;
  }, [ready, productType]);

  // ── Update material when appearance changes ────────────────────────────────
  useEffect(() => {
    if (!ready || !sceneRef.current) return;
    refreshTexture(sceneRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, wood, colour, engravingText]);

  useEffect(() => {
    if (!ready || !sceneRef.current) return;
    const s = sceneRef.current;
    const fp = FINISH_PARAMS[finish] ?? { roughness: 0.7, metalness: 0 };
    s.material.roughness = fp.roughness;
    s.material.metalness = fp.metalness;
    s.material.needsUpdate = true;
  }, [ready, finish]);

  function refreshTexture(s: SceneRefs) {
    const oldTex = s.texture;
    const newTex = generateWoodTexture(wood, colour, engravingText, uploadImgRef.current);
    s.material.map    = newTex;
    s.material.color  = new THREE.Color(0xffffff); // let texture handle colour
    s.material.needsUpdate = true;
    s.texture = newTex;
    if (oldTex) oldTex.dispose();
  }

  // ── Screenshot ──────────────────────────────────────────────────────────────
  function takeScreenshot() {
    const s = sceneRef.current;
    if (!s) return;
    s.renderer.render(s.scene, s.camera);
    const url = s.renderer.domElement.toDataURL("image/png");
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `custom-${productType || "product"}.png`;
    a.click();
  }

  // ── Reset camera ──────────────────────────────────────────────────────────
  function resetView() {
    const s = sceneRef.current;
    if (!s) return;
    s.camera.position.set(0, 0.6, 3.8);
    s.controls.target.set(0, 0, 0);
    s.controls.autoRotate = true;
  }

  return (
    <div className="relative w-full h-full bg-[#111111]"
      onPointerDown={dismissHint}
      onTouchStart={dismissHint}
    >
      {/* Three.js canvas mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Rotate hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-end justify-center pb-10 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 35, -35, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-white/50 text-2xl select-none"
              >
                ↺
              </motion.div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-white/30">Drag to rotate</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No product selected overlay */}
      <AnimatePresence>
        {!productType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <p className="text-[11px] tracking-[0.35em] uppercase text-white/20 text-center px-8">
              Select a product type<br />to see your 3D preview
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls bar */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={resetView}
          title="Reset view"
          className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={takeScreenshot}
          title="Save preview image"
          className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
      </div>

      {/* Live badge */}
      {productType && ready && (
        <div className="absolute top-3 left-3">
          <span className="text-[9px] tracking-[0.25em] uppercase text-white/30 border border-white/10 px-2 py-0.5">
            Live Preview
          </span>
        </div>
      )}
    </div>
  );
}
