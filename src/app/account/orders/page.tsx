import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase-server";
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

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export default async function OrdersPage() {
  const user = await getServerUser();
  if (!user) redirect("/account/login?redirect=/account/orders");

  // Use admin client to bypass RLS — we verify ownership via eq("user_id", user.id)
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-2">Your history</p>
        <h1 className="text-[clamp(24px,2.5vw,36px)] text-[#111111]">Orders</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="border border-[#f3f4f6] py-16 text-center">
          <p className="text-sm text-[#9ca3af] mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/"
            className="text-[10px] tracking-[0.22em] uppercase font-semibold bg-[#111111] text-white px-8 py-3 hover:bg-[#2a2a2a] transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
            const statusColor = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";
            const firstItem = items[0];

            return (
              <div key={order.id} className="border border-[#e8e8e5] p-5 hover:border-[#9ca3af] transition-colors">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-[#f3f4f6]">
                  <div>
                    <p className="text-xs font-mono text-[#9ca3af] mb-1">
                      {order.tracking_id
                        ? <span className="text-[#6b7280] font-semibold">{order.tracking_id}</span>
                        : `#${order.id.slice(0, 8).toUpperCase()}`
                      }
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-[#111111] mb-1">
                      {order.total_amount ? formatPrice(order.total_amount) : "—"}
                    </p>
                    <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items with images */}
                {items.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover flex-shrink-0 border border-[#e8e8e5]"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#f5f5f3] flex-shrink-0 border border-[#e8e8e5] flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#374151] truncate">
                            {item.name} <span className="text-[#9ca3af]">× {item.quantity}</span>
                          </p>
                          <p className="text-xs text-[#9ca3af]">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-xs text-[#9ca3af]">+{items.length - 3} more item{items.length - 3 > 1 ? "s" : ""}</p>
                    )}
                  </div>
                )}

                {/* Footer row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f3f4f6]">
                  {order.shipping_address && (
                    <p className="text-xs text-[#9ca3af]">
                      {order.shipping_address.line1}, {order.shipping_address.city},{" "}
                      {order.shipping_address.country}
                    </p>
                  )}
                  <div className="flex items-center gap-3 ml-auto">
                    {order.tracking_id && (
                      <Link
                        href={`/track?id=${order.tracking_id}&email=${encodeURIComponent(order.customer_email ?? "")}`}
                        className="text-[10px] tracking-[0.15em] uppercase text-[#6b7280] hover:text-[#111111] border-b border-[#6b7280]/30 hover:border-[#111111] pb-px transition-colors"
                      >
                        Track
                      </Link>
                    )}
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-[10px] tracking-[0.15em] uppercase font-semibold text-[#111111] border border-[#111111] px-3 py-1.5 hover:bg-[#111111] hover:text-white transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
