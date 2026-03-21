import type { Metadata } from "next";
import { Ojuju, Inter } from "next/font/google";
import "./globals.css";
import { supabase } from "@/lib/supabase";
import { Category, StoreSettings } from "@/lib/products";
import ClientWrapper from "@/components/ClientWrapper";

const ojuju = Ojuju({ variable: "--font-ojuju", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MYSTORE",
  description: "Curated pieces for the modern wardrobe.",
};

export const revalidate = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ data: categories }, { data: settings }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("store_settings").select("*").maybeSingle(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ojuju.variable} ${inter.variable} bg-[#030607] text-white min-h-screen`} suppressHydrationWarning>
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
