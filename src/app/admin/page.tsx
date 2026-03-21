import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase";
import { fromDb, DbProduct, formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [
    { count: productCount },
    { count: categoryCount },
    { count: orderCount },
    { data: lowStock },
    { data: recentProducts },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*").lt("stock", 5).order("stock").limit(5),
    supabase.from("products").select("*, categories(id, name, slug)").order("created_at", { ascending: false }).limit(5),
  ]);

  const recent = (recentProducts ?? []).map((p) => fromDb(p as DbProduct));

  const stats = [
    { label: "Products", value: productCount ?? 0, href: "/admin/products", color: "bg-blue-50 text-blue-600" },
    { label: "Categories", value: categoryCount ?? 0, href: "/admin/categories", color: "bg-purple-50 text-purple-600" },
    { label: "Orders", value: orderCount ?? 0, href: "/admin/orders", color: "bg-green-50 text-green-600" },
    { label: "Low Stock", value: lowStock?.length ?? 0, href: "/admin/products", color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Products</h2>
            <Link href="/admin/products/new" className="text-xs font-medium text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors">
              + Add
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">No products yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative w-10 h-10 shrink-0 bg-gray-100 rounded overflow-hidden">
                    {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category || "—"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-gray-900">{formatPrice(p.price)}</p>
                    <p className={`text-xs ${p.stock === 0 ? "text-red-500" : p.stock < 5 ? "text-orange-500" : "text-gray-400"}`}>
                      {p.stock} in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          {!lowStock || lowStock.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">All products are well stocked</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm text-gray-900 truncate">{p.name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
