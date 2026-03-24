import { redirect } from "next/navigation";
import { getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getServerUser();
  if (!user) redirect("/account/login?redirect=/checkout");

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,phone,address_line1,address_line2,city,state,postal_code,country")
    .eq("id", user.id)
    .single();

  return (
    <CheckoutClient
      userId={user.id}
      userEmail={user.email ?? ""}
      profile={profile ?? null}
    />
  );
}
