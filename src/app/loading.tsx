import PokemonGridSkeleton from "@/components/PokemonGridSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6 animate-pulse" />
          <div className="max-w-md mx-auto h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </header>
        <PokemonGridSkeleton />
      </div>
    </main>
  );
}
