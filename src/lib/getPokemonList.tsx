export default async function getPokemonList(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
    {
      next: { revalidate: 10 },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Pokémon");
  }

  const data = await res.json();

  return {
    data: data.results,
    count: data.count,
    fetchedAt: new Date().toISOString(),
  };
}
