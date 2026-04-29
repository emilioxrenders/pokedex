# Next.js 16 — Step-by-Step Guide (via Pokédex)

> **Background**: You know Nuxt.js, so you're familiar with SSR, file-based routing, and composable components. This guide maps Next.js concepts to what you already know where helpful.

---

## 1. File-System Routing & the App Router

**Nuxt equivalent**: `pages/` directory with `*.vue` files.

In Next.js 16 the modern approach is the **App Router** (`src/app/`). Every `page.tsx` inside a folder becomes a route:

```
src/app/
  page.tsx          →  /
  about/page.tsx    →  /about
  pokemon/[id]/page.tsx  →  /pokemon/bulbasaur, /pokemon/25, etc.
```

- **Folders** define URL segments.
- **Files** (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) have special meanings — they're not just any component.

### Special files

| File          | Purpose                                                                            |
| ------------- | ---------------------------------------------------------------------------------- |
| `page.tsx`    | The UI for that route — publicly accessible                                        |
| `layout.tsx`  | Wraps all pages in its folder (and nested folders). Preserves state on navigation. |
| `loading.tsx` | Shown while the page's Server Component is loading (auto-wrapped in `<Suspense>`)  |
| `error.tsx`   | Shown when an error is thrown inside the segment                                   |

---

## 2. Server Components vs Client Components

**This is the biggest mental shift from Nuxt.js.**

In Next.js, **every component is a Server Component by default**. They run only on the server, can `await` data directly, and send zero JavaScript to the browser.

You opt into a Client Component by adding `"use client"` at the very top of the file:

```tsx
// This component runs on the browser
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### When to use each

| Use **Server Component** when…  | Use **Client Component** when…                          |
| ------------------------------- | ------------------------------------------------------- |
| Fetching data from an API or DB | You need `useState` or `useEffect`                      |
| Using API keys / secrets        | You need `onClick`, `onChange`, or other event handlers |
| Reducing JS bundle size         | You need browser APIs (`localStorage`, `window`, etc.)  |

### In this project

- `PokemonGrid`, `PokemonCard`, `Pagination` — Server Components (fetch data, no interactivity)
- `SearchBar` — Client Component (`useState` for the input value, `useRouter` for navigation)

The layout pattern: a Server Component layout can render a Client Component child — the Client Component only handles its own interactive piece, not the whole page.

---

## 3. Data Fetching in Server Components

Server Components can be `async` functions. You just `await` your data:

```tsx
// src/components/PokemonGrid.tsx
export default async function PokemonGrid({ query, page }) {
  const data = await getPokemonForPage(query, page); // direct async call
  return <div>...</div>;
}
```

Compare to Nuxt's `useFetch` / `useAsyncData` — in Next.js you don't need a composable; you just `async/await` inside the component function.

---

## 4. Caching with `use cache`

**Next.js 16 introduced a new caching model** called Cache Components (enabled via `cacheComponents: true` in `next.config.ts`).

You mark any `async` function as cacheable by placing `"use cache"` inside it:

```ts
// src/lib/pokemon.ts
import { cacheLife } from "next/cache";

export async function getPokemonDetails(name: string) {
  "use cache";
  cacheLife("days"); // cache this result for ~24 hours

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  return res.json();
}
```

**How the cache key works**: the function's arguments (`name` here) automatically become part of the cache key. So `getPokemonDetails("bulbasaur")` and `getPokemonDetails("pikachu")` are two separate cache entries.

### Why this matters

Without caching, every page load would hit the PokeAPI 20+ times. With `"use cache"`:

- First load: hits PokeAPI, stores result.
- Second load (same Pokémon): returns cached result instantly.

### `cacheLife` profiles

| Profile     | Duration         |
| ----------- | ---------------- |
| `"seconds"` | ~30s             |
| `"minutes"` | ~5m              |
| `"hours"`   | ~1h              |
| `"days"`    | ~24h             |
| `"weeks"`   | ~7d              |
| `"max"`     | Maximum duration |

---

## 5. URL Search Params — The Right Way to Handle State

For pagination and search, we use **URL search params** (`?query=pikachu&page=2`). This is the Next.js-idiomatic approach: state lives in the URL, not in component state.

### Reading search params in a Server Component (page.tsx)

```tsx
// src/app/page.tsx
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  // ⚠️ In Next.js 16, searchParams is a Promise — you must await it
  const { query = "", page = "1" } = await searchParams;
  // ...
}
```

> **Nuxt equivalent**: `useRoute().query` inside `setup()`. The difference is this runs on the server with no composable needed.

Accessing `searchParams` opts the page into **dynamic rendering** — it will re-render on every request with the current URL.

### Updating search params in a Client Component (SearchBar.tsx)

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function SearchBar({ defaultQuery }) {
  const router = useRouter();

  function handleChange(e) {
    const params = new URLSearchParams();
    if (e.target.value) params.set("query", e.target.value);
    params.set("page", "1");
    router.push(`?${params.toString()}`); // updates URL → Server Component re-renders
  }
  // ...
}
```

> **Nuxt equivalent**: `navigateTo({ query: { q: value } })`.

---

## 6. Streaming with Suspense

When a Server Component fetches data, the page would normally block until all data is ready. **Suspense** lets you stream parts of the page progressively.

```tsx
// src/app/page.tsx
import { Suspense } from "react";

export default async function HomePage({ searchParams }) {
  const { query, page } = await searchParams;

  return (
    <main>
      <SearchBar defaultQuery={query} />

      {/* Show skeleton immediately; swap in real content when ready */}
      <Suspense key={`${query}-${page}`} fallback={<PokemonGridSkeleton />}>
        <PokemonGrid query={query} page={page} />
      </Suspense>
    </main>
  );
}
```

The `key` prop on `<Suspense>` is a React trick: changing the key unmounts and remounts the boundary, which resets it and shows the skeleton again when the query/page changes.

### `loading.tsx` — the shorthand

Creating a `loading.tsx` file in any route folder automatically wraps the whole `page.tsx` in a `<Suspense>` boundary. It's shown during initial navigation to that route:

```tsx
// src/app/loading.tsx
export default function Loading() {
  return <MySkeleton />;
}
```

---

## 7. The `<Link>` Component

**Nuxt equivalent**: `<NuxtLink>`.

```tsx
import Link from "next/link";

// Prefetched when it enters the viewport
<Link href="?page=2">Next →</Link>

// Regular anchor — no prefetching
<a href="/external">External</a>
```

`<Link>` does several things:

- **Client-side navigation** — no full page reload.
- **Prefetching** — loads the route in the background when the link is visible.

In `Pagination.tsx`, we use `<Link href="?page=N">` — Next.js preserves the rest of the URL automatically through client-side routing.

---

## 8. The `next/image` Component

**Nuxt equivalent**: `<NuxtImg>` from `@nuxt/image`.

```tsx
import Image from "next/image";

<Image
  src="https://raw.githubusercontent.com/..."
  alt="Bulbasaur"
  fill // fills the parent container (parent must be position: relative)
  sizes="96px" // hints to the browser what size to expect
  className="object-contain"
/>;
```

Remote images need to be allowlisted in `next.config.ts`:

```ts
// next.config.ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "raw.githubusercontent.com" },
  ],
},
```

Without this allowlist, `<Image>` with a remote URL will throw an error.

---

## 9. TypeScript Helpers: `PageProps`

Next.js 16 generates global TypeScript helpers for route props. Instead of writing the type manually:

```tsx
// Manual typing (also valid):
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {}
```

You can use the generated helper (run `next typegen` or `next build` first):

```tsx
// Auto-generated helper:
export default async function Page(props: PageProps<"/pokemon/[id]">) {
  const { id } = await props.params;
}
```

---

## 10. Project File Map

```
src/
  app/
    page.tsx              Server Component — reads searchParams, renders layout
    loading.tsx           Skeleton shown during initial page load
    layout.tsx            Root layout — html/body, fonts, metadata
    globals.css           Tailwind v4 import + CSS variables
  components/
    SearchBar.tsx         "use client" — controlled input, debounced URL push
    PokemonGrid.tsx       Server Component — fetches list + details, renders cards
    PokemonCard.tsx       Server Component — single card with sprite + type badges
    PokemonGridSkeleton.tsx  Pure UI skeleton (no data, no async)
    Pagination.tsx        Server Component — prev/next <Link> buttons
  lib/
    pokemon.ts            Data fetching functions with "use cache"
    types.ts              TypeScript types for PokeAPI responses
next.config.ts            cacheComponents + image remote patterns
```

---

## 11. Key "Gotchas" from Nuxt → Next.js

| Nuxt                                   | Next.js                                        |
| -------------------------------------- | ---------------------------------------------- |
| `useFetch` / `useAsyncData`            | Just `await` inside a Server Component         |
| `useRoute().query`                     | `searchParams` prop (a Promise, must await)    |
| `<NuxtLink>`                           | `<Link>` from `next/link`                      |
| `definePageMeta({ layout: 'custom' })` | Nest a `layout.tsx` in the route folder        |
| `pages/_app.vue`                       | `app/layout.tsx` (root layout)                 |
| `pages/_error.vue`                     | `app/error.tsx`                                |
| `useState` composable (server-shared)  | `React.cache()` for request-scoped memoization |
| `nuxt.config.ts` plugins               | `next.config.ts` + built-in features           |
