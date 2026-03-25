"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createPage, deletePage } from "./actions";
import PagesClient from "./PagesClient";

type PageRow = { id: string; title: string; slug: string; status: string; updated_at: string };

// Re-export all old PagesClient props
type PagesClientProps = React.ComponentProps<typeof PagesClient>;
type Props = PagesClientProps & { pages: PageRow[] };

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft:     "bg-yellow-100 text-yellow-700",
};

export default function PagesAdminClient({ pages: initPages, ...siteSettingsProps }: Props) {
  const [tab, setTab] = useState<"builder" | "settings">("builder");
  const [pages, setPages] = useState<PageRow[]>(initPages);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleTitleChange(v: string) {
    setNewTitle(v);
    setNewSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  function handleCreate() {
    if (!newTitle.trim() || !newSlug.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await createPage(newTitle.trim(), newSlug.trim());
      if ("error" in result) { setError(result.error as string); return; }
      setPages(prev => [...prev, result as PageRow]);
      setNewTitle(""); setNewSlug(""); setShowNew(false);
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deletePage(id);
      setPages(prev => prev.filter(p => p.id !== id));
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Page Builder</h1>
          <p className="text-white/40 text-sm mt-1">Build pages with drag-and-drop sections</p>
        </div>
        <button onClick={() => window.open("/", "_blank")}
          className="flex items-center gap-2 border border-white/20 text-white/60 text-sm px-4 py-2 hover:border-white/50 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Site
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-lg w-fit">
        <button onClick={() => setTab("builder")}
          className={`px-5 py-2 text-sm rounded-md transition-colors ${tab === "builder" ? "bg-white text-[#111] font-semibold" : "text-white/50 hover:text-white"}`}>
          🏗 Pages
        </button>
        <button onClick={() => setTab("settings")}
          className={`px-5 py-2 text-sm rounded-md transition-colors ${tab === "settings" ? "bg-white text-[#111] font-semibold" : "text-white/50 hover:text-white"}`}>
          ⚙️ Site Settings
        </button>
      </div>

      {/* Builder tab: pages list */}
      {tab === "builder" && (
        <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold">All Pages</h2>
              <p className="text-white/30 text-xs mt-0.5">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => setShowNew(true)}
              className="bg-white text-[#111] text-sm font-semibold px-4 py-2 hover:bg-[#d2ff1f] transition-colors">
              + New Page
            </button>
          </div>

          {/* New page form */}
          {showNew && (
            <div className="mb-6 p-5 border border-white/20 bg-white/5 rounded-lg">
              <h3 className="text-white text-sm font-semibold mb-4">Create New Page</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-white/40 block mb-1">Page Title</label>
                  <input value={newTitle} onChange={e => handleTitleChange(e.target.value)}
                    placeholder="e.g. About Us"
                    className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-white/40 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Slug (URL)</label>
                  <input value={newSlug} onChange={e => setNewSlug(e.target.value)}
                    placeholder="e.g. about-us"
                    className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-white/40 placeholder-white/20 font-mono" />
                </div>
              </div>
              {newSlug && <p className="text-white/30 text-xs mb-3">URL: /p/{newSlug}</p>}
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={isPending || !newTitle.trim()}
                  className="bg-white text-[#111] text-sm font-semibold px-5 py-2 hover:bg-[#d2ff1f] transition-colors disabled:opacity-40">
                  {isPending ? "Creating…" : "Create Page"}
                </button>
                <button onClick={() => { setShowNew(false); setNewTitle(""); setNewSlug(""); setError(""); }}
                  className="text-white/30 hover:text-white text-sm transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {/* Pages table */}
          {pages.length === 0 ? (
            <div className="text-center py-16 text-white/20 text-sm">
              No pages yet. Create your first page above.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {pages.map(page => (
                <div key={page.id} className="flex items-center gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{page.title}</p>
                    <p className="text-white/30 text-xs font-mono mt-0.5">
                      {["home"].includes(page.slug) ? "/" : `/p/${page.slug}`}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[page.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {page.status}
                  </span>
                  <span className="text-white/20 text-xs whitespace-nowrap">
                    {new Date(page.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  <div className="flex gap-3">
                    <Link href={`/admin/pages/${page.id}`}
                      className="text-sm text-white/50 hover:text-white transition-colors font-medium">
                      Edit →
                    </Link>
                    {!["home", "about", "contact", "faq"].includes(page.slug) && (
                      <button onClick={() => handleDelete(page.id, page.title)}
                        className="text-sm text-white/20 hover:text-red-400 transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Site Settings tab: legacy PagesClient */}
      {tab === "settings" && (
        <div>
          <PagesClient {...siteSettingsProps} />
        </div>
      )}
    </div>
  );
}
