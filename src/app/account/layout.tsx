"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard",  href: "/account" },
  { label: "Orders",     href: "/account/orders" },
  { label: "Profile",    href: "/account/profile" },
  { label: "Wishlist",   href: "/account/wishlist" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-white min-h-screen pt-[68px]">
      {/* Mobile tab bar */}
      <div className="md:hidden border-b border-[#e8e8e5] overflow-x-auto">
        <div className="flex min-w-max px-4">
          {NAV.map((l) => {
            const active = l.href === "/account" ? pathname === "/account" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[11px] tracking-[0.15em] uppercase font-medium px-4 py-4 border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#111111] text-[#111111]"
                    : "border-transparent text-[#9ca3af] hover:text-[#6b7280]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12 items-start">
          {/* Sidebar — desktop */}
          <aside className="w-48 shrink-0 hidden md:block">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#9ca3af] mb-5">My Account</p>
            <nav className="space-y-1">
              {NAV.map((l) => {
                const active = l.href === "/account" ? pathname === "/account" : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block text-sm py-2 border-b transition-colors ${
                      active
                        ? "text-[#111111] font-semibold border-[#111111]"
                        : "text-[#6b7280] hover:text-[#111111] border-[#f3f4f6] hover:border-[#e5e7eb]"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
