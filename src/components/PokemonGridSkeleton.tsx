export default function PokemonGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: PER_PAGE }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex flex-col items-center gap-3 animate-pulse"
        >
          <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded self-end" />
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-1">
            <div className="w-14 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

const PER_PAGE = 20;
