"use client";

import { deleteProduct } from "../actions";

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
