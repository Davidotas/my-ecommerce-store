"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const outOfStock = product.stock === 0;

  return (
    <button
      onClick={handleAdd}
      disabled={outOfStock}
      className="w-full bg-black text-white text-sm font-medium py-4 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {outOfStock ? "Out of Stock" : added ? "Added to cart ✓" : "Add to Cart"}
    </button>
  );
}
