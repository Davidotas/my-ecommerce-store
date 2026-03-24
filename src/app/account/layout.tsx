import Link from "next/link";

const NAV = [
  { label: "Dashboard",  href: "/account" },
  { label: "Orders",     href: "/account/orders" },
  { label: "Profile",    href: "/account/profile" },
  { label: "Wishlist",   href: "/account/wishlist" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12 items-start">
          {/* Sidebar */}
          <aside className="w-48 shrink-0 hidden md:block">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#9ca3af] mb-5">My Account</p>
            <nav className="space-y-1">
              {NAV.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block text-sm text-[#6b7280] hover:text-[#111111] py-2 border-b border-[#f3f4f6] hover:border-[#e5e7eb] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
