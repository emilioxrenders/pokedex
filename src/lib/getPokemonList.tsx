export default async function getPokemonList(page = 1, limit = 12) {
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
    pokemons: data.results,
    count: data.count,
  };
}
