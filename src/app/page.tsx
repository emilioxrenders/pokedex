import { Suspense } from "react";
import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";
import PokemonGrid from "@/components/PokemonGrid";
import PokemonGridSkeleton from "@/components/PokemonGridSkeleton";

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Browse all Pokémon with search and pagination",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const { query = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
            Pokédex
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {query ? `Showing results for "${query}"` : "Explore all Pokémon"}
          </p>
          <SearchBar defaultQuery={query} />
        </header>

        {/*
          The `key` prop resets the Suspense boundary whenever the query or
          page changes, so the skeleton re-appears while fresh data loads.
        */}
        <Suspense
          key={`${query}-${currentPage}`}
          fallback={<PokemonGridSkeleton />}
        >
          <PokemonGrid query={query} page={currentPage} />
        </Suspense>
      </div>
    </main>
  );
}
