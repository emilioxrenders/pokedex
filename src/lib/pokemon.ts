import { cacheLife } from "next/cache";
import type { PokemonDetail, PokemonListItem } from "./types";

export const PER_PAGE = 20;

export async function getPokemonForPage(
  query: string,
  page: number,
): Promise<{ pokemon: PokemonListItem[]; total: number }> {
  "use cache";
  cacheLife("days");

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    const res = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0",
    );
    if (!res.ok) throw new Error("Failed to fetch Pokémon list");
    const data = await res.json();
    const filtered: PokemonListItem[] = data.results.filter(
      (p: PokemonListItem) => p.name.includes(normalizedQuery),
    );
    const offset = (page - 1) * PER_PAGE;
    return {
      pokemon: filtered.slice(offset, offset + PER_PAGE),
      total: filtered.length,
    };
  }

  const offset = (page - 1) * PER_PAGE;
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${PER_PAGE}&offset=${offset}`,
  );
  if (!res.ok) throw new Error("Failed to fetch Pokémon list");
  const data = await res.json();
  return { pokemon: data.results, total: data.count };
}

export async function getPokemonDetails(name: string): Promise<PokemonDetail> {
  "use cache";
  cacheLife("days");

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon: ${name}`);
  return res.json();
}
