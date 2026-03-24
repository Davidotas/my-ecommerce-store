"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function AccountMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return <div className="w-9 h-9" />; // placeholder while loading
  }

  if (!user) {
    return (
      <div ref={ref} className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setOpen((p) => !p)}
          className="flex items-center justify-center w-9 h-9 text-[#6b7280] hover:text-[#111111] transition-colors"
          aria-label="Account"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 bg-white border border-[#e8e8e5] shadow-xl w-44 z-50 py-2"
            >
              <Link href="/account/login"    onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#fafaf8] transition-colors">Sign in</Link>
              <Link href="/account/register" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#fafaf8] transition-colors">Create account</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Logged in
  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Account";

  const initials =
    (user.user_metadata?.full_name || user.email || "?")
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 text-[#6b7280] hover:text-[#111111] transition-colors"
        aria-label="My account"
      >
        {/* Avatar circle */}
        <span className="w-7 h-7 rounded-full bg-[#111111] text-white text-[10px] font-semibold flex items-center justify-center">
          {initials}
        </span>
        <span className="text-[11px] tracking-[0.1em] font-medium hidden sm:block">{displayName}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 bg-white border border-[#e8e8e5] shadow-xl w-48 z-50 py-2"
          >
            {/* Email */}
            <div className="px-4 py-2 border-b border-[#f3f4f6] mb-1">
              <p className="text-[10px] text-[#9ca3af] truncate">{user.email}</p>
            </div>

            {[
              { label: "My Account",  href: "/account" },
              { label: "Orders",      href: "/account/orders" },
              { label: "Profile",     href: "/account/profile" },
              { label: "Wishlist",    href: "/account/wishlist" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#fafaf8] transition-colors"
              >
                {l.label}
              </Link>
            ))}

            <div className="border-t border-[#f3f4f6] mt-1 pt-1">
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
