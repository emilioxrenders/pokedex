# Next.js 15 — Pages Router vs What You Learned Here

> This guide maps every concept from the Pokédex app (App Router, Next.js 16) to its Pages Router equivalent in Next.js 15. Read each section side-by-side.

---

## 1. Folder Structure

**App Router (this project)**

```
src/app/
  page.tsx          → /
  layout.tsx        → wraps everything
  loading.tsx       → auto-Suspense skeleton
  pokemon/[id]/
    page.tsx        → /pokemon/bulbasaur
```

**Pages Router (your job)**

```
pages/
  index.tsx         → /
  _app.tsx          → wraps everything (like layout.tsx)
  _document.tsx     → controls the <html> shell (rarely touched)
  pokemon/
    [id].tsx        → /pokemon/bulbasaur
```

The `pages/` folder replaces `src/app/`. The filename itself is the route — there's no `page.tsx` convention, the file is the page.

---

## 2. Shared Layout: `_app.tsx` instead of `layout.tsx`

**App Router** — `layout.tsx` wraps child pages automatically:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Pages Router** — `_app.tsx` is the single global wrapper:

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css"; // global CSS lives here

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

- `Component` is whatever page the user navigated to.
- `pageProps` is the data returned by `getServerSideProps` or `getStaticProps` for that page.
- You add your navbar, footer, providers, etc. around `<Component />` here.
- There is no `layout.tsx` and no nested layout concept — only this one global wrapper.

> **Nuxt equivalent**: `layouts/default.vue` applied to all pages.

---

## 3. No Server Components — Everything Is a Client Component

This is the biggest conceptual difference.

**App Router** — components default to Server Components. You opt in to client-only with `"use client"`.

**Pages Router** — there are no Server Components at all. Every component runs in the browser after hydration. The only "server" execution is inside the special data fetching functions (`getServerSideProps`, `getStaticProps`).

In practice this means:

- You cannot `await` data directly inside a component.
- You cannot access `process.env.SECRET_KEY` inside a component (it'll be undefined or empty on the client).
- All your components are effectively `"use client"` by default — you don't write the directive, it's just how it works.

---

## 4. Data Fetching: `getServerSideProps` instead of `async` Server Components

**App Router** — you `await` inside the component itself:

```tsx
// src/components/PokemonGrid.tsx (Server Component)
export default async function PokemonGrid({ query, page }) {
  const data = await getPokemonForPage(query, page); // direct await
  return <div>...</div>;
}
```

**Pages Router** — you export a separate `getServerSideProps` function from the page file. It runs on the server, and its return value is passed to the page as props:

```tsx
// pages/index.tsx
import type { GetServerSideProps } from "next";

type Props = {
  pokemon: { name: string; id: number; sprite: string }[];
  total: number;
};

export default function HomePage({ pokemon, total }: Props) {
  // `pokemon` already exists here — no fetching needed in the component
  return <div>...</div>;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const query = (context.query.query as string) ?? "";
  const page = parseInt(context.query.page as string) || 1;

  const data = await getPokemonForPage(query, page);
  const details = await Promise.all(
    data.pokemon.map((p) => getPokemonDetails(p.name)),
  );

  return {
    props: {
      pokemon: details.map((p) => ({
        name: p.name,
        id: p.id,
        sprite: p.sprites.other["official-artwork"].front_default ?? "",
      })),
      total: data.total,
    },
  };
};
```

Key rules:

- `getServerSideProps` can only be exported from **page files** (`pages/*.tsx`), not from components.
- It receives a `context` object with `context.query` (the URL search params), `context.params` (dynamic route segments), `context.req`, `context.res`.
- It must return `{ props: { ... } }`.
- The returned props are serialized to JSON, so no class instances or functions.

> **Nuxt equivalent**: `useFetch` / `useAsyncData` in `setup()` — except `getServerSideProps` runs _only_ on the server, not on the client after navigation (Next.js calls it via an internal API route on client-side transitions).

---

## 5. Reading Search Params: `context.query` instead of `searchParams` prop

**App Router**:

```tsx
// searchParams is a Promise in Next.js 16
const { query = "", page = "1" } = await searchParams;
```

**Pages Router**:

```tsx
export const getServerSideProps = async (context) => {
  // context.query is a plain object — no await needed
  const query = (context.query.query as string) ?? "";
  const page = parseInt(context.query.page as string) || 1;
  // ...
};
```

If you need to read the query on the client (e.g. in the SearchBar), you use `useRouter` from `next/router` (note: different package from App Router's `next/navigation`):

```tsx
// Pages Router — useRouter from 'next/router'
import { useRouter } from "next/router";

export default function SearchBar() {
  const router = useRouter();
  const currentQuery = router.query.query ?? ""; // plain object, no await

  function handleChange(e) {
    router.push({ pathname: "/", query: { query: e.target.value, page: 1 } });
  }
}
```

> **Important import difference**:
>
> - App Router: `import { useRouter } from "next/navigation"`
> - Pages Router: `import { useRouter } from "next/router"`

---

## 6. Static Pre-rendering: `getStaticProps`

In addition to `getServerSideProps` (runs on every request), Pages Router has `getStaticProps` (runs once at build time):

```tsx
// pages/index.tsx
export async function getStaticProps() {
  const data = await getSomeStaticData();
  return {
    props: { data },
    revalidate: 3600, // re-build this page in the background every hour (ISR)
  };
}
```

|                       | `getServerSideProps`            | `getStaticProps`               |
| --------------------- | ------------------------------- | ------------------------------ |
| Runs                  | On every request                | Once at build time             |
| Has access to request | Yes (`context.req`)             | No                             |
| Can read query params | Yes (`context.query`)           | No                             |
| Good for              | Search, user-specific data      | Blog posts, product pages      |
| Caching               | Manual (`Cache-Control` header) | Automatic (CDN) + optional ISR |

For the Pokédex with search and pagination, you'd use `getServerSideProps` since the content changes based on the URL.

---

## 7. No `loading.tsx` — Skeleton Is Your Responsibility

**App Router** — create `loading.tsx` in a folder and Next.js wraps the page in `<Suspense>` automatically.

**Pages Router** — there is no `loading.tsx`. You manage loading state yourself, typically with a local state variable:

```tsx
// pages/index.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function HomePage({ pokemon }: Props) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleDone = () => setIsNavigating(false);
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleDone);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleDone);
    };
  }, [router]);

  if (isNavigating) return <PokemonGridSkeleton />;
  return <PokemonGrid pokemon={pokemon} />;
}
```

The `router.events` API is a Pages Router-only feature for listening to navigation lifecycle events.

---

## 8. No `use cache` — Caching Is Done via `fetch` Options or ISR

**App Router** — `"use cache"` + `cacheLife("days")` on any async function.

**Pages Router** — no such directive exists. Your options are:

1. **`getStaticProps` + `revalidate`** (ISR) — best for data that rarely changes:

   ```tsx
   export async function getStaticProps() {
     const data = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
     return { props: { data: await data.json() }, revalidate: 86400 }; // 24h
   }
   ```

2. **`fetch` with `next.revalidate`** — same as above but inline:

   ```ts
   const res = await fetch("https://pokeapi.co/...", {
     next: { revalidate: 86400 },
   });
   ```

3. **`Cache-Control` headers** — for `getServerSideProps` (CDN-level caching):

   ```ts
   export async function getServerSideProps({ res }) {
     res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
     return { props: { ... } };
   }
   ```

4. **In-memory / external cache** (Redis, etc.) — for caching between requests server-side.

---

## 9. `<Link>` — Same Component, Slightly Different Behavior

`<Link>` works the same way in both routers. One difference: in Pages Router, `<Link>` prefetches the `getStaticProps` data for statically generated pages, but does **not** prefetch `getServerSideProps` data — it waits until the user clicks.

```tsx
// Same in both routers
import Link from "next/link";
<Link href="/?query=pikachu&page=1">Search Pikachu</Link>;
```

---

## 10. `next/image` — Identical

No change. `<Image>`, remote patterns in `next.config.ts`, `fill`, `sizes` — all work the same way.

---

## Summary Cheatsheet

| Concept                   | App Router (this project)                  | Pages Router (your job)                                      |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Route files               | `app/page.tsx`                             | `pages/index.tsx`                                            |
| Global layout             | `app/layout.tsx`                           | `pages/_app.tsx`                                             |
| HTML shell                | built into `layout.tsx`                    | `pages/_document.tsx`                                        |
| Server data               | `async` component + `await`                | `getServerSideProps` → props                                 |
| Build-time data           | `"use cache"` on function                  | `getStaticProps` + `revalidate`                              |
| Read URL params (server)  | `await searchParams` prop                  | `context.query` (plain object)                               |
| Read URL params (client)  | `useSearchParams()` from `next/navigation` | `useRouter().query` from `next/router`                       |
| Navigate programmatically | `useRouter()` from `next/navigation`       | `useRouter()` from `next/router`                             |
| Loading skeleton          | `loading.tsx` (automatic)                  | Manual with `router.events`                                  |
| Server Components         | Default for all components                 | Do not exist                                                 |
| `"use client"` directive  | Needed for interactive components          | Not used — everything is client                              |
| Caching                   | `"use cache"` + `cacheLife()`              | `revalidate` in `getStaticProps`, or `Cache-Control` headers |
