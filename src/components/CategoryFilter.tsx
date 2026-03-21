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
            ? "bg-[#d2ff1f] text-[#030607] border-[#d2ff1f]"
            : "text-[#9c9381] border-[rgba(255,255,255,0.2)] hover:border-white hover:text-white"
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
              ? "bg-[#d2ff1f] text-[#030607] border-[#d2ff1f]"
              : "text-[#9c9381] border-[rgba(255,255,255,0.2)] hover:border-white hover:text-white"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
