"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/lib/products";

type Props = {
  categories: Category[];
  currentSlug?: string;
};

export default function CategoryFilter({ categories, currentSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => setCategory(null)}
        className={`px-4 py-1.5 text-xs tracking-[0.5px] uppercase font-medium border transition-colors ${
          !currentSlug
            ? "bg-[#111111] text-white border-[#111111]"
            : "text-[#6b7280] border-[#e5e7eb] hover:border-[#111111] hover:text-[#111111]"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(cat.slug)}
          className={`px-4 py-1.5 text-xs tracking-[0.5px] uppercase font-medium border transition-colors ${
            currentSlug === cat.slug
              ? "bg-[#111111] text-white border-[#111111]"
              : "text-[#6b7280] border-[#e5e7eb] hover:border-[#111111] hover:text-[#111111]"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
