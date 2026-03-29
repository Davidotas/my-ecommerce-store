import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const keyInfo = {
    present: !!serviceKey,
    format: serviceKey.startsWith("eyJ") ? "JWT" : serviceKey.startsWith("sb_") ? "sb_secret" : "unknown",
    length: serviceKey.length,
  };

  const admin = createAdminClient();

  // 1. Try a read — confirms connectivity and RLS bypass
  const { data: readData, error: readError } = await admin
    .from("orders")
    .select("id, user_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // 2. Try a test insert then immediately delete it
  const testPayload = {
    customer_email: "test@test.com",
    items: [{ id: "test", name: "Test Item", price: 100, quantity: 1 }],
    total_amount: 100,
    status: "placed",
    tracking_id: "MYK-TEST-00000",
    payment_method: "card",
  };

  const { data: insertData, error: insertError } = await admin
    .from("orders")
    .insert(testPayload)
    .select("id")
    .single();

  // Clean up the test row if insert succeeded
  if (insertData?.id) {
    await admin.from("orders").delete().eq("id", insertData.id);
  }

  return NextResponse.json({
    serviceKey: keyInfo,
    read: {
      ok: !readError,
      count: readData?.length ?? 0,
      error: readError ? { message: readError.message, code: readError.code } : null,
      rows: readData ?? [],
    },
    insert: {
      ok: !insertError,
      id: insertData?.id ?? null,
      error: insertError ? { message: insertError.message, code: insertError.code, details: insertError.details, hint: insertError.hint } : null,
    },
  });
}
