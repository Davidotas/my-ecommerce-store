"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath("/admin/orders");
}

export async function updateOrderTracking(
  orderId: string,
  data: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
  }
) {
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({
      tracking_number: data.trackingNumber || null,
      carrier: data.carrier || null,
      estimated_delivery: data.estimatedDelivery || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
