import getPokemonList from "@/lib/getPokemonList";
import Link from "next/link";
import { offsetFromUrl, sanitizePageParam } from "@/lib/helpers";
import { notFound } from "next/navigation";
import type { PokemonListItem } from "@/types/pokemonList";
import Pagination from "@/components/Pagination";

type Props = {
  searchParams: {
    page?: string;
  };
};

export default async function Home({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = sanitizePageParam(page);

  if (!currentPage) {
    notFound();
  }

  const { data, count } = await getPokemonList(currentPage);

  if (!data || data.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(count / 10);

  return (
    <div className="">
      {data.map((pokemon: PokemonListItem, index: number) => {
        const id = offsetFromUrl(pokemon.url);
        return (
          <li
            key={pokemon.name}
            className="p-2 border rounded flex items-center gap-4"
          >
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
              alt={pokemon.name}
              className="w-10 h-10"
            />
            <span className="capitalize">{pokemon.name}</span>
          </li>
        );
      })}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
