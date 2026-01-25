interface Pokemon {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiUrl = config.apiUrl;

  const { page = 1, limit = 12 } = getQuery(event);

  const pageNumber = page ? parseInt(page as string, 10) : 1;
  const limitNumber = limit ? parseInt(limit as string, 10) : 12;

  const offset = (pageNumber - 1) * limitNumber;

  const data: PokemonListResponse = await $fetch(
    `${apiUrl}/pokemon?limit=${limit}&offset=${offset}`,
  );

  if (!data) {
    throw new Error("Failed to fetch Pokémon");
  }

  return data;
});
