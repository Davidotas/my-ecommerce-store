import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-600",
};

export default async function OrdersPage() {
  const user = await getServerUser();
  if (!user) redirect("/account/login?redirect=/account/orders");

  const supabase = await createSupabaseServerClient();
  const { data: orders } = await supabase
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
            const items: { name: string; quantity: number; price: number }[] =
              Array.isArray(order.items) ? order.items : [];
            const statusColor = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";

            return (
              <div key={order.id} className="border border-[#e8e8e5] p-5">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-[#f3f4f6]">
                  <div>
                    <p className="text-xs font-mono text-[#9ca3af] mb-1">
                      #{order.id.slice(0, 8).toUpperCase()}
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

                {/* Items */}
                {items.length > 0 && (
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-[#6b7280]">
                        <span>{item.name} <span className="text-[#9ca3af]">× {item.quantity}</span></span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Shipping address */}
                {order.shipping_address && (
                  <div className="mt-4 pt-4 border-t border-[#f3f4f6] text-xs text-[#9ca3af]">
                    Shipped to: {order.shipping_address.line1}, {order.shipping_address.city},{" "}
                    {order.shipping_address.country}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
