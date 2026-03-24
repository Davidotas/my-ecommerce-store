"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/currency";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();
  const { currency } = useCurrency();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/account/login?redirect=/account/wishlist");
      else setChecked(true);
    });
  }, [router]);

  if (!checked) return <div className="py-16 text-center text-sm text-[#9ca3af]">Loading…</div>;

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Saved items</p>
        <h1 className="text-[clamp(24px,2.5vw,36px)] text-[#111111]">Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="border border-[#f3f4f6] py-16 text-center">
          <p className="text-sm text-[#9ca3af] mb-4">Your wishlist is empty.</p>
          <Link
            href="/"
            className="text-[10px] tracking-[0.22em] uppercase font-semibold bg-[#111111] text-white px-8 py-3 hover:bg-[#2a2a2a] transition-colors"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {items.map((product) => (
            <div key={product.id} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#fafaf8] mb-3">
                <Link href={`/products/${product.id}`} className="block absolute inset-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f5f5f3] flex items-center justify-center">
                      <span className="text-[#9ca3af] text-xs">No image</span>
                    </div>
                  )}
                </Link>
                {/* Remove from wishlist */}
                <button
                  onClick={() => toggle(product)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 flex items-center justify-center text-[#9ca3af] hover:text-[#ef4444] transition-colors text-xs"
                  aria-label="Remove from wishlist"
                >
                  ×
                </button>
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  {product.category && (
                    <p className="text-[9px] tracking-[0.15em] uppercase text-[#9ca3af] mb-0.5">{product.category}</p>
                  )}
                  <p className="text-sm text-[#111111] truncate">{product.name}</p>
                </div>
                <span className="text-sm font-medium text-[#111111] shrink-0">
                  {formatCurrency(product.price, currency)}
                </span>
              </div>

              <button
                onClick={() => { addItem(product); toggle(product); }}
                className="w-full border border-[#e8e8e5] text-[#111111] text-[10px] tracking-[0.18em] uppercase font-semibold py-2.5 hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-colors"
              >
                Move to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
