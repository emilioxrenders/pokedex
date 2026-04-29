import Link from "next/link";

function buildUrl(page: number, query: string): string {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  query,
}: {
  currentPage: number;
  totalPages: number;
  query: string;
}) {
  if (totalPages <= 1) return null;

  const btnBase =
    "px-4 py-2 rounded-lg border text-sm font-medium transition-colors";
  const btnActive =
    "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";
  const btnDisabled =
    "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-3 mt-8"
    >
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1, query)}
          className={`${btnBase} ${btnActive}`}
        >
          ← Previous
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled}`}>← Previous</span>
      )}

      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1, query)}
          className={`${btnBase} ${btnActive}`}
        >
          Next →
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled}`}>Next →</span>
      )}
    </nav>
  );
}
