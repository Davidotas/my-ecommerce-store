"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "./Navbar";
import { Category, StoreSettings } from "@/lib/products";

type Props = {
  children: React.ReactNode;
  categories: Category[];
  settings: StoreSettings | null;
};

export default function ClientWrapper({ children, categories, settings }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <CurrencyProvider>
      <CartProvider>
        <WishlistProvider>
          {!isAdmin && <Navbar categories={categories} settings={settings} />}
          {children}
        </WishlistProvider>
      </CartProvider>
    </CurrencyProvider>
  );
}
