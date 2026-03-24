"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "./actions";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-600",
};

export default function OrderStatusSelect({
  orderId,
  currentStatus,
  statusColor,
}: {
  orderId: string;
  currentStatus: string;
  statusColor: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setStatus(next);
    startTransition(async () => {
      await updateOrderStatus(orderId, next);
    });
  }

  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer capitalize outline-none appearance-none pr-6 bg-no-repeat ${color} disabled:opacity-60`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundPosition: "right 6px center",
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-white text-gray-900 capitalize">
          {s}
        </option>
      ))}
    </select>
  );
}
