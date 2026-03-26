import type { Metadata } from "next";
import "./globals.css";
import { supabase } from "@/lib/supabase";
import { Category, StoreSettings } from "@/lib/products";
import ClientWrapper from "@/components/ClientWrapper";

export const metadata: Metadata = {
  title: "MyKolo Mysibi Collection",
  description: "Handcrafted wood art and home pieces made from reclaimed materials. Wood spoons, plates, wall art, key holders, and more.",
  icons: {
    icon: "/mykolo-logo.png",
    apple: "/mykolo-logo.png",
  },
};

export const revalidate = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ data: categories }, { data: settings }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("store_settings").select("*").maybeSingle(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="bg-white text-[#111111] min-h-screen"
        suppressHydrationWarning
      >
        <ClientWrapper
          categories={(categories as Category[]) ?? []}
          settings={settings as StoreSettings | null}
        >
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
