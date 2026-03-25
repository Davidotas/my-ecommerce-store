"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Section, BuilderPage, createSection, SECTION_LIBRARY, SectionType } from "@/lib/builder-types";
import { savePage } from "../actions";
import SectionLibraryModal from "./SectionLibraryModal";
import SettingsPanel from "./SettingsPanel";
import type { Product, Category } from "@/lib/products";

interface Props {
  page: BuilderPage;
  products: Product[];
  categories: Category[];
}

export default function PageBuilder({ page, products, categories }: Props) {
  const [sections, setSections] = useState<Section[]>(page.sections ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [pageTitle, setPageTitle] = useState(page.title);
  const [pageSlug, setPageSlug] = useState(page.slug);
  const [seoDesc, setSeoDesc] = useState(page.seo_description ?? "");
  const [status, setStatus] = useState(page.status);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Undo/redo via refs to avoid stale closure issues
  const historyRef = useRef<Section[][]>([page.sections ?? []]);
  const historyIdxRef = useRef(0);
  const settingsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHistoryRef = useRef<Section[] | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  function pushHistory(newSections: Section[]) {
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push([...newSections]);
    historyIdxRef.current = historyRef.current.length - 1;
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(false);
  }

  function undo() {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    const prev = historyRef.current[historyIdxRef.current];
    setSections(prev);
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(true);
    setIsDirty(true);
  }

  function redo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const next = historyRef.current[historyIdxRef.current];
    setSections(next);
    setCanUndo(true);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
    setIsDirty(true);
  }

  function updateSections(newSections: Section[]) {
    setSections(newSections);
    pushHistory(newSections);
    setIsDirty(true);
  }

  function addSection(type: SectionType) {
    const newSection = createSection(type);
    const updated = [...sections, newSection];
    updateSections(updated);
    setSelectedId(newSection.id);
    setShowLibrary(false);
  }

  function deleteSection(id: string) {
    updateSections(sections.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function duplicateSection(id: string) {
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1) return;
    const dup = { ...sections[idx], id: crypto.randomUUID() };
    const next = [...sections];
    next.splice(idx + 1, 0, dup);
    updateSections(next);
  }

  function moveSection(id: string, dir: "up" | "down") {
    const idx = sections.findIndex(s => s.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === sections.length - 1) return;
    const next = [...sections];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    updateSections(next);
  }

  function toggleVisibility(id: string) {
    updateSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  }

  function updateSectionSettings(id: string, newSettings: Record<string, unknown>) {
    setSections(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, settings: { ...s.settings, ...newSettings } } : s
      );
      pendingHistoryRef.current = updated;
      return updated;
    });
    setIsDirty(true);
    if (settingsDebounceRef.current) clearTimeout(settingsDebounceRef.current);
    settingsDebounceRef.current = setTimeout(() => {
      if (pendingHistoryRef.current) {
        pushHistory(pendingHistoryRef.current);
        pendingHistoryRef.current = null;
      }
    }, 800);
  }

  // Drag & drop
  function handleDragStart(id: string) {
    return (e: React.DragEvent) => {
      e.dataTransfer.setData("sectionId", id);
      e.dataTransfer.effectAllowed = "move";
    };
  }
  function handleDragOver(id: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(id);
    };
  }
  function handleDrop(targetId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("sectionId");
      if (draggedId === targetId) { setDragOver(null); return; }
      const from = sections.findIndex(s => s.id === draggedId);
      const to = sections.findIndex(s => s.id === targetId);
      if (from === -1 || to === -1) { setDragOver(null); return; }
      const next = [...sections];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      updateSections(next);
      setDragOver(null);
    };
  }

  async function handleSave() {
    setIsSaving(true);
    await savePage(page.id, sections, status, pageTitle, pageSlug, seoDesc);
    setIsSaving(false);
    setIsDirty(false);
    showToast("Saved ✓");
  }

  async function handlePublish() {
    setIsSaving(true);
    await savePage(page.id, sections, "published", pageTitle, pageSlug, seoDesc);
    setStatus("published");
    setIsSaving(false);
    setIsDirty(false);
    showToast("Published ✓");
  }

  // Auto-save every 30s when dirty
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(async () => {
      await savePage(page.id, sections, status, pageTitle, pageSlug, seoDesc);
      setIsDirty(false);
    }, 30000);
    return () => clearTimeout(t);
  }, [isDirty, sections, status, pageTitle, pageSlug, seoDesc, page.id]);

  const selectedSection = sections.find(s => s.id === selectedId) ?? null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f5] flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 h-[52px] bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <a href="/admin/pages"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 pr-3 border-r border-gray-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Pages
        </a>
        <input
          value={pageTitle}
          onChange={e => { setPageTitle(e.target.value); setIsDirty(true); }}
          className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-100 rounded px-2 py-1"
        />
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
          status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {status}
        </span>
        <div className="flex-1" />
        {isDirty && <span className="text-xs text-gray-400 hidden sm:block">Unsaved changes</span>}
        <button onClick={undo} disabled={!canUndo}
          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors text-base" title="Undo (Ctrl+Z)">↩</button>
        <button onClick={redo} disabled={!canRedo}
          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors text-base" title="Redo">↪</button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button onClick={handleSave} disabled={isSaving}
          className="px-4 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button onClick={handlePublish} disabled={isSaving}
          className="px-4 py-1.5 text-sm bg-[#111] text-white rounded hover:bg-[#333] disabled:opacity-50 transition-colors">
          Publish
        </button>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left panel: section list ── */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Sections · {sections.length}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-1.5">
            {sections.length === 0 && (
              <p className="px-4 py-8 text-xs text-gray-400 text-center leading-relaxed">
                No sections yet.<br />Click &ldquo;+ Add Section&rdquo; below.
              </p>
            )}
            {sections.map((section) => {
              const meta = SECTION_LIBRARY.find(l => l.type === section.type);
              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={handleDragStart(section.id)}
                  onDragOver={handleDragOver(section.id)}
                  onDrop={handleDrop(section.id)}
                  onDragLeave={() => setDragOver(null)}
                  onClick={() => setSelectedId(section.id === selectedId ? null : section.id)}
                  className={`group flex items-center gap-2 mx-2 px-2 py-2.5 rounded cursor-pointer transition-colors select-none
                    ${selectedId === section.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"}
                    ${dragOver === section.id ? "border-t-2 !border-t-blue-400" : ""}
                  `}
                >
                  <span className="text-gray-300 cursor-grab text-sm flex-shrink-0">⠿</span>
                  <button
                    onClick={e => { e.stopPropagation(); toggleVisibility(section.id); }}
                    className={`flex-shrink-0 text-sm transition-opacity ${section.visible ? "opacity-60 hover:opacity-100" : "opacity-20 hover:opacity-60"}`}
                    title={section.visible ? "Hide" : "Show"}
                  >
                    {section.visible ? "👁" : "🚫"}
                  </button>
                  <span className={`text-xs flex-1 truncate font-medium ${
                    selectedId === section.id ? "text-blue-700" : section.visible ? "text-gray-700" : "text-gray-400"
                  }`}>
                    {meta?.icon} {meta?.label ?? section.type}
                  </span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button onClick={e => { e.stopPropagation(); moveSection(section.id, "up"); }}
                      className="p-1 text-gray-300 hover:text-gray-600 text-xs" title="Move up">↑</button>
                    <button onClick={e => { e.stopPropagation(); moveSection(section.id, "down"); }}
                      className="p-1 text-gray-300 hover:text-gray-600 text-xs" title="Move down">↓</button>
                    <button onClick={e => { e.stopPropagation(); duplicateSection(section.id); }}
                      className="p-1 text-gray-300 hover:text-gray-600 text-xs" title="Duplicate">⊕</button>
                    <button onClick={e => { e.stopPropagation(); deleteSection(section.id); }}
                      className="p-1 text-gray-300 hover:text-red-500 text-xs" title="Delete">🗑</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-100">
            <button onClick={() => setShowLibrary(true)}
              className="w-full py-2.5 text-sm font-medium text-gray-700 border-2 border-dashed border-gray-300 rounded hover:border-gray-500 hover:text-gray-900 transition-colors">
              + Add Section
            </button>
          </div>

          {/* Page meta */}
          <div className="p-3 border-t border-gray-100 space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Page Settings</p>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Slug</label>
              <input value={pageSlug} onChange={e => { setPageSlug(e.target.value); setIsDirty(true); }}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-gray-400 font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">SEO Description</label>
              <textarea value={seoDesc} onChange={e => { setSeoDesc(e.target.value); setIsDirty(true); }}
                rows={2} placeholder="For search engines…"
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-gray-400 resize-none" />
            </div>
          </div>
        </div>

        {/* ── Right panel: settings or empty state ── */}
        <div className="flex-1 overflow-y-auto bg-[#f5f5f5]">
          {selectedSection ? (
            <SettingsPanel
              section={selectedSection}
              onChange={newSettings => updateSectionSettings(selectedSection.id, newSettings)}
              products={products}
              categories={categories}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-white rounded-2xl shadow flex items-center justify-center text-3xl mb-5">🏗</div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Build your page</h3>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
                Add sections from the library, then click any section in the left panel to edit its content and settings.
              </p>
              <button onClick={() => setShowLibrary(true)}
                className="px-6 py-3 bg-[#111] text-white text-sm font-medium rounded hover:bg-[#333] transition-colors">
                + Add First Section
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals & overlays */}
      {showLibrary && (
        <SectionLibraryModal onAdd={addSection} onClose={() => setShowLibrary(false)} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111] text-white text-sm px-4 py-2.5 rounded-lg shadow-xl z-[60] animate-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
