import { notFound } from "next/navigation";

export default async function getPokemon(name: string) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    // throw new Error("Failed to fetch Pokémon");
    notFound();
  }

  const data = await res.json();

  return {
    pokemon: data,
  };
}
