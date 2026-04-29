"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function SearchBar({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("query", q.trim());
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="max-w-md mx-auto">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search Pokémon by name…"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
      />
    </div>
  );
}
