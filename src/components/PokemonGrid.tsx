import { getPokemonDetails, getPokemonForPage, PER_PAGE } from "@/lib/pokemon";
import PokemonCard from "./PokemonCard";
import Pagination from "./Pagination";

export default async function PokemonGrid({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  const { pokemon, total } = await getPokemonForPage(query, page);
  const totalPages = Math.ceil(total / PER_PAGE);

  const details = await Promise.all(
    pokemon.map((p) => getPokemonDetails(p.name)),
  );

  if (details.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-24 text-lg">
        No Pokémon found matching &quot;{query}&quot;
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
        {details.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} query={query} />
    </div>
  );
}
