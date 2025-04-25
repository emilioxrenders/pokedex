import getPokemon from "@/lib/getPokemon";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidSlug } from "@/lib/helpers";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const { pokemon } = await getPokemon(slug);

  console.log(pokemon);

  return (
    <div>
      <Link href="/">Go back</Link>
      <Header level={1}>{pokemon.name}</Header>
    </div>
  );
}
