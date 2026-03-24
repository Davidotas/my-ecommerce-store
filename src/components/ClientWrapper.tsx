"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.25, ease: "easeIn" as const } },
};

export default function ClientWrapper({ children, categories, settings }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <CurrencyProvider>
      <CartProvider>
        <WishlistProvider>
          {!isAdmin && <Navbar categories={categories} settings={settings} />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </WishlistProvider>
      </CartProvider>
    </CurrencyProvider>
  );
}
