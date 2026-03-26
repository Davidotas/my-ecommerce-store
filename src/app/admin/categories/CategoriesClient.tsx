"use client";

import { useTransition, useState, useRef } from "react";
import Image from "next/image";
import { Category } from "@/lib/products";
import { addCategory, deleteCategory, updateCategory } from "./actions";

function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">Category image</label>
      <div className="flex items-center gap-3">
        {/* Thumbnail preview */}
        <div className="w-14 h-14 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            <Image src={value} alt="Category" width={56} height={56} unoptimized className="object-cover w-full h-full" />
          ) : (
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs font-medium text-gray-700 border border-gray-300 px-3 py-1.5 rounded hover:border-gray-900 transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading…" : value ? "Change image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </div>
  );
}

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Add form state
  const [addImageUrl, setAddImageUrl] = useState("");

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  function handleAdd(fd: FormData) {
    fd.set("image_url", addImageUrl);
    setError("");
    startTransition(async () => {
      const res = await addCategory(fd);
      if (res?.error) setError(res.error);
      else setAddImageUrl("");
    });
  }

  function handleDelete(fd: FormData) {
    startTransition(async () => { await deleteCategory(fd); });
  }

  function handleUpdate(fd: FormData) {
    fd.set("image_url", editImageUrl);
    setError("");
    startTransition(async () => {
      const res = await updateCategory(fd);
      if (res?.error) setError(res.error);
      else setEditId(null);
    });
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditImageUrl(cat.image_url ?? "");
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Add Category</h2>
        <form action={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Clothing"
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <ImageUploadField value={addImageUrl} onChange={setAddImageUrl} />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Adding…" : "Add Category"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Categories ({categories.length})</h2>
        </div>

        {categories.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10">No categories yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div key={cat.id} className="px-5 py-3">
                {editId === cat.id ? (
                  /* Edit form */
                  <form action={handleUpdate} className="space-y-3 py-1">
                    <input type="hidden" name="id" value={cat.id} />
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                      <input
                        name="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20"
                        autoFocus
                      />
                    </div>
                    <ImageUploadField value={editImageUrl} onChange={setEditImageUrl} />
                    <div className="flex gap-2">
                      <button type="submit" disabled={isPending} className="text-xs font-medium text-white bg-black px-3 py-1.5 rounded hover:bg-gray-900 disabled:opacity-50">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Display row */
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      {cat.image_url ? (
                        <Image src={cat.image_url} alt={cat.name} width={40} height={40} unoptimized className="object-cover w-full h-full" />
                      ) : (
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>

                    <button
                      onClick={() => startEdit(cat)}
                      className="text-xs text-gray-500 hover:text-black transition-colors"
                    >
                      Edit
                    </button>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        disabled={isPending}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
