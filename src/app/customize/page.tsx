import CustomizerClient from "./CustomizerClient";

export const metadata = {
  title: "Custom Order | Design Your Piece",
  description: "Create a bespoke handcrafted wood product tailored exactly to you.",
};

export default async function CustomizePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productId } = await searchParams;
  return <CustomizerClient productId={productId} />;
}
