import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import OrderStatusSelect from "./OrderStatusSelect";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-600",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (filterStatus && filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data: orders } = await query;

  // Aggregate counts per status
  const { data: allOrders } = await admin.from("orders").select("status");
  const counts: Record<string, number> = { all: allOrders?.length ?? 0 };
  allOrders?.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{counts.all} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {STATUSES.map((s) => (
          <a
            key={s}
            href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`px-4 py-2 text-sm capitalize transition-colors ${
              (filterStatus ?? "all") === s
                ? "border-b-2 border-gray-900 text-gray-900 font-medium -mb-px"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {s} {counts[s] ? <span className="text-xs text-gray-400">({counts[s]})</span> : null}
          </a>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No orders {filterStatus && filterStatus !== "all" ? `with status "${filterStatus}"` : "yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Order", "Date", "Customer", "Items", "Total", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const items: { name: string; quantity: number; price: number; customization?: { summary: string } }[] =
                    Array.isArray(order.items) ? order.items : [];
                  const statusColor = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 align-top">
                      <td className="px-5 py-4 text-xs text-gray-500 font-mono whitespace-nowrap">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{order.customer_name || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.customer_email || "—"}</p>
                        {order.shipping_address?.line1 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.shipping_address.line1}, {order.shipping_address.city}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-[220px]">
                        {items.map((item, i) => (
                          <div key={i} className="mb-1 last:mb-0">
                            <p className="text-xs text-gray-600 truncate">{item.name} × {item.quantity}</p>
                            {item.customization?.summary && (
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded">
                                ✏ {item.customization.summary}
                              </span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {order.total_amount ? formatPrice(order.total_amount) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <OrderStatusSelect
                          orderId={order.id}
                          currentStatus={order.status}
                          statusColor={statusColor}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
