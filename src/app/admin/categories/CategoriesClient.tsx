"use client";

import { useTransition, useState } from "react";
import { Category } from "@/lib/products";
import { addCategory, deleteCategory, updateCategory } from "./actions";

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleAdd(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await addCategory(fd);
      if (res?.error) setError(res.error);
    });
  }

  function handleDelete(fd: FormData) {
    startTransition(async () => { await deleteCategory(fd); });
  }

  function handleUpdate(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await updateCategory(fd);
      if (res?.error) setError(res.error);
      else setEditId(null);
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Add Category</h2>
        <form action={handleAdd} className="space-y-3">
          <input
            name="name"
            type="text"
            required
            placeholder="Category name (e.g. Clothing)"
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="bg-black text-white text-sm font-medium px-5 py-2.5 hover:bg-gray-900 disabled:opacity-50 transition-colors"
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
              <div key={cat.id} className="px-5 py-3 flex items-center gap-3">
                {editId === cat.id ? (
                  <form action={handleUpdate} className="flex gap-2 flex-1">
                    <input type="hidden" name="id" value={cat.id} />
                    <input
                      name="name"
                      defaultValue={editName}
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                      autoFocus
                    />
                    <button type="submit" disabled={isPending} className="text-xs font-medium text-black bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:text-gray-600">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>
                    <button
                      onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
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
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
