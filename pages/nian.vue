<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
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
  constructor(private seed: number = 1, private a: number = 16807, private c: number = 0, private m: number = Math.pow(2, 31) - 1) {
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
function shuffle(array: string[], seed: number = 0) {
  const lcg = new LCG(seed);  // Initialize with a seed
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(lcg.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


/**
 * Finds all indices of a value in an array.
 *
 * @param {array} array - The array to search.
 * @param {any} val - The value to find.
 * @returns {array} An array of indices at which the value is found.
 */
function indexOfAll(array: any[], val: any): number[] {
  let indices: number[] = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i] === val) {
      indices.push(i);
    }
  }
  return indices;
}


// The get word, seed and scramble part need to be handled on the server-side!
const seed = 123;
const word = "microsoft".toUpperCase();
const puzzleLetters = shuffle(Array.from(word), seed);
const btnStates: Ref<boolean[]> = ref(puzzleLetters.map(() => false))
const userInput: Ref<{ char: string; highlighted: boolean }[]> = ref([]);

// Init dict letterFreq - used later to prevent inputs
let letterFreq: { [key: string]: number } = {};

for (const letter of puzzleLetters) {
  if (!letterFreq[letter]) {
    letterFreq[letter] = 1;
  } else {
    letterFreq[letter]++;
  }
}

// Helper functions for the event handler handleKeydown -the logic is for keyboard event presses and displays through userInput variable
function handleLetterDeletion(letterToDel: string = "") {
  let removedLetter: string = "";

  // Mouse click logic - len 1 for safety
  if (letterToDel.length === 1) {
    const delIdx = userInput.value.findIndex(item => item.char === letterToDel);
    removedLetter = userInput.value.splice(delIdx, 1)[0].char;
  } // Backspace logic - Removes the latest letter if the list is not empty 
  else if (userInput.value.length > 0) {
    removedLetter = userInput.value.pop()?.char || "";
  }

  if (removedLetter) {
    changeBtnState(removedLetter, false)
    letterFreq[removedLetter]++;
  }
}

function handleLetterInput(keyInput: string) {
  // Prevents inputting a letter if it hits its limit
  if (letterFreq[keyInput] > 0) {
    changeBtnState(keyInput, true)
    userInput.value.push({ char: keyInput, highlighted: false });
    letterFreq[keyInput]--;
  } // Highlight repeated letters if they already exists and hit their limit
  else if (letterFreq[keyInput] === 0) {
    highlightRepeatedLetters(keyInput);
  }
}

function highlightRepeatedLetters(keyInput: string) {
  userInput.value.forEach(x => {
    if (x.char === keyInput && !x.highlighted) {
      x.highlighted = true;
      setTimeout(() => { x.highlighted = false; }, 1000);
    }
  });
}

// The main event handler for keyboard presses
let handleKeydown = (event: KeyboardEvent) => {
  const keyInput = event.key.toUpperCase();

  // Handle backspace by increasing the freq. limit for the letters
  if (keyInput === 'BACKSPACE') {
    handleLetterDeletion();
  } // Handles keys within the target word
  else if (keyInput.length === 1 && letterFreq.hasOwnProperty(keyInput)) {
    handleLetterInput(keyInput);
  } // Somewhat unnecessary, prevents for example arrow keys to scroll the page
  else {
    event.preventDefault();
  }
}

// Mount the listener
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

// Unmount to prevent memory leaks
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});


// Controls if the tiles are grayed out or not
function changeBtnState(letter: string, state: boolean) {
  const usedIdx: number | undefined = indexOfAll(puzzleLetters, letter).find(idx => btnStates.value[idx] === !state);

  if (usedIdx !== undefined) {
    btnStates.value[usedIdx] = state;
  }
}

// Code that displays used words based on the buttons clicked and is synchronized with keyboard inputs
// TODO: Fix so deleting with the keyboard also sets switches back the btnState!!!
function displayUsedWords(letter: string, idx: number) {
  if (btnStates.value[idx]) {
    handleLetterDeletion(letter)
  } else {
    handleLetterInput(letter)
  }
}

</script>

<template>
  <!-- Wraps puzzle and input to be able to center them -->
  <div class="max-w-4xl mt-3 mx-auto px-6 font-bold font-mono flex flex-col items-center">

    <!-- Displays the 9 word puzzle -->
    <div class="size-80 text-4xl bg-white text-black grid grid-cols-3 gap-0 border-2 border-black rounded-md">
      <button @click="displayUsedWords(displayLetter, letterBoxIdx)"
        v-for="(displayLetter, letterBoxIdx) in puzzleLetters" :key="letterBoxIdx"
        class="border border-black flex justify-center items-center"
        :class="{ 'bg-black text-white': letterBoxIdx === 4, 'bg-gray-300': btnStates[letterBoxIdx], 'bg-gray-600': letterBoxIdx === 4 && btnStates[letterBoxIdx] }">
        {{ displayLetter }}
      </button>
    </div>

    <!-- The user input, is displayed iteratively until 9 boxes  -->
    <div class="inline-flex flex-wrap mt-3">
      <div v-for="(inputLetter, inputIdx) in userInput" :key="inputIdx"
        class="p-2 size-10 border-dashed border border-black rounded-lg flex justify-center items-center"
        :class="{ 'bg-orange-300': inputLetter.highlighted, 'ml-1': inputIdx > 0 }">
        {{ inputLetter.char }}
      </div>
    </div>

  </div>
</template>

<style lang="scss"></style>