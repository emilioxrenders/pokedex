import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: Props) {
  const pageNumbers: (number | string)[] = [];

  if (currentPage > 2) {
    pageNumbers.push(1, "...");
  }

  for (
    let i = Math.max(1, currentPage - 1);
    i <= Math.min(totalPages, currentPage + 1);
    i++
  ) {
    pageNumbers.push(i);
  }

  if (currentPage + 1 < totalPages) {
    pageNumbers.push("...", totalPages);
  }

  return (
    <div className="flex items-center gap-3 mt-4">
      {currentPage > 1 && (
        <Link href={`/?page=${currentPage - 1}`} className="underline">
          ← Prev
        </Link>
      )}

      {pageNumbers.map((page, idx) =>
        typeof page === "number" ? (
          page === currentPage ? (
            <span key={idx} className="font-bold text-blue-600">
              {page}
            </span>
          ) : (
            <Link key={idx} href={`/?page=${page}`} className="underline">
              {page}
            </Link>
          )
        ) : (
          <span key={idx}>…</span>
        )
      )}

      {currentPage < totalPages && (
        <Link href={`/?page=${currentPage + 1}`} className="underline">
          Next →
        </Link>
      )}
    </div>
  );
}
