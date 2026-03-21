import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { data: orders } = await createAdminClient()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{orders?.length ?? 0} total orders</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No orders yet</p>
            <p className="text-xs text-gray-300 mt-2">Orders placed via Stripe checkout will appear here</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">{order.id.slice(0, 8)}…</td>
                  <td className="px-5 py-4 text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {order.total_amount ? formatPrice(order.total_amount) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
