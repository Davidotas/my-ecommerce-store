"use client";

import { useState } from "react";
import { SECTION_LIBRARY, SECTION_CATEGORIES, SectionType } from "@/lib/builder-types";

interface Props {
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Layout: "⬛", Commerce: "🛍", Content: "📝", Media: "🎬", Marketing: "📣", Social: "👥",
};

export default function SectionLibraryModal({ onAdd, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = SECTION_LIBRARY.filter(s => {
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    const matchSearch = !search || s.label.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Add Section</h2>
            <p className="text-xs text-gray-400 mt-0.5">Choose a section type to add to your page</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-lg transition-colors">×</button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sections…"
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-400"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 px-6 py-3 border-b border-gray-100 overflow-x-auto flex-shrink-0">
          {["All", ...SECTION_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat !== "All" && CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No sections match your search.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(section => (
                <button
                  key={section.type}
                  onClick={() => onAdd(section.type)}
                  className="group text-left p-4 border-2 border-gray-100 rounded-xl hover:border-gray-900 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-2">{section.icon}</div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-900 mb-0.5">{section.label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{section.description}</p>
                  <span className="inline-block mt-2 text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {section.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
