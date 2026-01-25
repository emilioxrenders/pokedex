export const usePokemonList = (page = 1, limit = 12) => {
  const { data, pending, error } = useFetch(
    `/api/pokemonList?page=${page}&limit=${limit}`,
  );

  return {
    pokemonList: data.value?.results,
    count: data.value?.count,
    pending,
    error,
  };
};
