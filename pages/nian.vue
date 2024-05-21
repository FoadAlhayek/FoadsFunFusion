<script setup lang="ts">
/**
 * A PRNG class that represents the Linear Congruential Generator (`LCG`).
 * The LCG generates sequences of random numbers with the help of a seed and the next() method
 * It follows the following formula:
 * X_{n+1} = (aX_n + c) % m
 *
 * @property {number} seed - The seed value for the LCG.
 * @property {number} a - The multiplier in the LCG formula.
 * @property {number} c - The increment in the LCG formula.
 * @property {number} m - The modulus in the LCG formula.
 * @method next() - Returns the next number in the generator
 */
class LCG {
  constructor(seed: number = 1, a: number = 16807, c: number = 0, m: number = Math.pow(2, 31) - 1) {
    this.seed = seed;
    this.a = a;
    this.c = c;
    this.m = m;
  }

  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 *
 * @param {array} array - The array to shuffle.
 * @param {number} seed - The array to shuffle.
 * @returns {array} The shuffled array.
 */
function shuffle(array: any[], seed: number = 0) {
  const lcg = new LCG(seed);  // Initialize with a seed
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(lcg.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// The get word, seed and scramble part need to be handled on the server-side!
const seed = 123;
const word = "microsoft".toUpperCase();
const letters = shuffle(Array.from(word), seed);
let usedLetters: { [key: String]: Number } = {};
let userInput = ref('');

// Init dict usedLetters - used later to prevent inputs
for (const letter of letters) {
  if (!usedLetters[letter]) {
    usedLetters[letter] = 1;
  } else {
    usedLetters[letter]++;
  }
}

// TEST BELOW

const handleKeydown = (event) => {
  // Re-add +1 on deleted letters
  if (event.key === 'Backspace') {
    // THIS IS NOT WORKING PROPERLY - error when event is empty!
    const lastInput = userInput.at(-1).toUpperCase();
    console.log(event)
    console.log(lastInput)
    if (usedLetters[lastInput] !== undefined) {
      usedLetters[lastInput]++;
    }
    return;
  }

  // Only allow original word's char
  const char = event.key.toUpperCase();

  if (usedLetters[char] && usedLetters[char] > 0) {
    usedLetters[char]--;
    userInput += char;
  } else {
    event.preventDefault();
  }
};

</script>

<template>
  <div
    class="size-80 mt-3 mx-auto text-4xl font-bold font-mono bg-white text-black grid grid-cols-3 gap-0 border-2 border-black rounded-md">
    <div v-for="(letter, index) in letters" class="border border-black flex justify-center items-center"
      :class="{ 'bg-black text-white': index === 4 }">
      {{ letter }}
    </div>
  </div>
  <div>
    <input v-model="userInput" @keydown="handleKeydown" maxlength="9" placeholder="Type here...">
  </div>
  <p>{{ usedLetters }}</p>
</template>

<style lang="scss"></style>