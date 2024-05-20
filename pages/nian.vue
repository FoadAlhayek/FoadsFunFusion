<script setup>
// The get word and scramble part need to be handled on the server-side!
const word = "microsoft".toUpperCase();

// This is a way to shuffle but it might have bias(?)
//const letters = word.split('').sort(() => Math.random() - 0.5);
const letters = Array.from(word);

// Fisher-Yates shuffle
for (let i = letters.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [letters[i], letters[j]] = [letters[j], letters[i]];
}
</script>

<template>
  <div
    class="size-80 mt-3 mx-auto text-4xl font-bold font-mono bg-white text-black grid grid-cols-3 gap-0 border-2 border-black rounded-md">
    <div v-for="(c, i) in letters" class="border border-black flex justify-center items-center"
      :class="{ 'bg-black text-white': i === 4 }">
      {{ c }}
    </div>
  </div>
</template>

<style lang="scss"></style>