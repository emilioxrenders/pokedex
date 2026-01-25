<script setup lang="ts">
import { usePokemonList } from "./composables/usePokemonList";

const { pokemonList, count, pending, error } = usePokemonList(1, 12);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold underline">Hello world!</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="pokemon in pokemonList" class="">
        <div class="">{{ pokemon }}</div>
      </div>
    </div>
  </div>
</template>
