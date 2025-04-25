import getPokemonList from "@/lib/getPokemonList";
import Link from "next/link";
import Image from "next/image";
import {
  offsetFromUrl,
  sanitizePageParam,
  extractQueryParam,
} from "@/lib/helpers";
import { notFound } from "next/navigation";
import type { PokemonListItem } from "@/types/pokemonList";
import Pagination from "@/components/Pagination";
import Header from "@/components/Header";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;

  const page = extractQueryParam(resolved.page);

  const currentPage = sanitizePageParam(page);

  if (!currentPage) {
    notFound();
  }

  const { pokemons, count } = await getPokemonList(currentPage ?? undefined);

  if (!pokemons || pokemons.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(count / 12);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Header level={1}>Pokédex</Header>
        <p>
          This is a Pokédex application using Next.js with the /app router
          structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pokemons.map((pokemon: PokemonListItem, index: number) => {
          const id = offsetFromUrl(pokemon.url);
          return (
            <Link
              key={index}
              className="p-2 border rounded flex items-center gap-3"
              href={`/pokemon/${pokemon.name}`}
            >
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                alt={pokemon.name}
                className="w-20 h-20"
                width={96}
                height={96}
              />
              <span className="capitalize">{pokemon.name}</span>
            </Link>
          );
        })}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
