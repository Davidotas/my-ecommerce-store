"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "./actions";
import {
  Squares2X2Icon,
  TagIcon,
  FolderIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Squares2X2Icon, exact: true },
  { href: "/admin/products", label: "Products", icon: TagIcon },
  { href: "/admin/categories", label: "Categories", icon: FolderIcon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBagIcon },
  { href: "/admin/pages", label: "Pages", icon: PaintBrushIcon },
  { href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin" onClick={onClose} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mykolo-logo.png"
            alt="Mykolo"
            style={{ height: "40px", width: "auto" }}
            className="brightness-0 invert"
          />
          <p className="text-white/30 text-xs mt-1">Admin</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-1"
          target="_blank"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Store
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-[#1a1a1a] flex-col z-50">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#1a1a1a] flex items-center justify-between px-4 z-50 border-b border-white/10">
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col gap-[5px] w-5 h-5 justify-center"
          aria-label="Open menu"
        >
          <span className="block h-px w-full bg-white/60" />
          <span className="block h-px w-full bg-white/60" />
          <span className="block h-px w-full bg-white/60" />
        </button>
        <Link href="/admin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mykolo-logo.png"
            alt="Mykolo"
            style={{ height: "32px", width: "auto" }}
            className="brightness-0 invert"
          />
        </Link>
        <div className="w-5" />
      </header>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed left-0 top-0 h-screen w-60 bg-[#1a1a1a] z-[70]"
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <SidebarContent pathname={pathname} onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
