import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  placed:     "bg-lime-100 text-lime-700",
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-600",
};

export default async function AccountDashboard() {
  const user = await getServerUser();
  if (!user) redirect("/account/login?redirect=/account");

  const supabase = await createSupabaseServerClient();

  const admin = createAdminClient();
  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    // Use admin client to bypass RLS — ownership verified via eq("user_id", user.id)
    admin
      .from("orders")
      .select("id,created_at,total_amount,status,items,tracking_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

  return (
    <div>
      {/* Welcome */}
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Welcome back</p>
        <h1 className="text-[clamp(28px,3vw,40px)] text-[#111111]">Hello, {name}</h1>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {[
          { label: "Order History", desc: `${orders?.length ?? 0} recent orders`, href: "/account/orders", icon: "📦" },
          { label: "My Profile",    desc: "Edit name & address",                  href: "/account/profile",  icon: "👤" },
          { label: "Wishlist",      desc: "Saved items",                          href: "/account/wishlist", icon: "♡"  },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-[#e8e8e5] p-5 hover:border-[#111111] transition-colors group"
          >
            <div className="text-2xl mb-3">{card.icon}</div>
            <p className="text-sm font-medium text-[#111111] group-hover:text-[#6b7280] transition-colors">{card.label}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[#111111]">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs text-[#6b7280] hover:text-[#111111] transition-colors">
            View all →
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="border border-[#f3f4f6] py-12 text-center">
            <p className="text-sm text-[#9ca3af]">No orders yet</p>
            <Link href="/" className="text-xs text-[#111111] underline underline-offset-2 mt-3 block">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {orders.map((order) => {
              const itemCount = Array.isArray(order.items) ? order.items.length : 0;
              const statusColor = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";
              return (
                <div key={order.id} className="flex items-center justify-between py-4 gap-4">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-mono mb-1">
                      {order.tracking_id ?? `#${order.id.slice(0, 8).toUpperCase()}`}
                    </p>
                    <p className="text-sm text-[#111111]">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-medium text-[#111111]">
                      {order.total_amount ? formatPrice(order.total_amount) : "—"}
                    </p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                      {order.status}
                    </span>
                    <Link href={`/account/orders/${order.id}`} className="text-[10px] text-[#111111] underline underline-offset-2 hover:no-underline mt-0.5">
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
