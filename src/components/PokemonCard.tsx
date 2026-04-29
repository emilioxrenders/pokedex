import Image from "next/image";
import type { PokemonDetail } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-400",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-sky-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  dark: "bg-gray-700",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

export default function PokemonCard({ pokemon }: { pokemon: PokemonDetail }) {
  const sprite =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2">
      <span className="text-xs text-gray-400 dark:text-gray-500 self-end font-mono">
        #{String(pokemon.id).padStart(4, "0")}
      </span>
      <div className="relative w-24 h-24">
        {sprite ? (
          <Image
            src={sprite}
            alt={pokemon.name}
            fill
            sizes="96px"
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full" />
        )}
      </div>
      <h2 className="text-sm font-semibold capitalize text-gray-800 dark:text-white">
        {pokemon.name}
      </h2>
      <div className="flex gap-1 flex-wrap justify-center">
        {pokemon.types.map(({ type }) => (
          <span
            key={type.name}
            className={`px-2 py-0.5 text-xs font-medium text-white rounded-full capitalize ${TYPE_COLORS[type.name] ?? "bg-gray-500"}`}
          >
            {type.name}
          </span>
        ))}
      </div>
    </div>
  );
}
