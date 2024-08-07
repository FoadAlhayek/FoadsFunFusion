<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import nineData from '~/assets/data/wordsSAOL.json';


useHead({
  title: 'NIAN',
  bodyAttrs: {
    class: 'bg-gradient-to-b from-amber-50 to-amber-100 min-h-screen'
  },
  link: [
    {
      hid: 'icon',
      rel: 'icon',
      type: 'image/x-icon',
      href: '/icons/favicon-nian.ico',
    },
  ],
});


/**
 * A PRNG class that represents the Linear Congruential Generator (`LCG`).
 * The LCG generates sequences of random numbers with the help of a seed and the next() method
 * It follows the following formula:
 * X_{n+1} = (aX_n + c) % m
 *
 * @param seed - The seed value for the LCG.
 * @param a - The multiplier in the LCG formula.
 * @param c - The increment in the LCG formula.
 * @param m - The modulus in the LCG formula.
 */
class LCG {
  constructor(private seed: number = 1, private a: number = 16807, private c: number = 0, private m: number = Math.pow(2, 31) - 1) {
    this.seed = seed;
    this.a = a;
    this.c = c;
    this.m = m;
  }
  /** Returns the next number in the generator */
  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 *
 * @param array - The array to shuffle.
 * @param seed - The array to shuffle.
 * @returns The shuffled array.
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
 * @param array - The array to search.
 * @param val - The value to find.
 * @returns An array of indices at which the value is found.
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

/**
 * Get amount of passed years starting from 2024 and amount of passed days from this year
 * 
 * @param currentDate - The date which calculations are based on 
 * @param delay - Time in ms to change when the day starts, where 0 keeps it at 00:00, pos increases (e.g. 01:00) and neg decreases (e.g. 11:00)
 * @returns Years passed since 2024 and days passed from current year
 */
function yearsDaysPassed(currentDate: Date, delay: number): number[] {
  // Compute amount of years passed
  const year = currentDate.getFullYear();
  const yearsPassed = year - 2024;

  // Compute amount of days passed this year
  const startOfYear = new Date(year, 5, 10);
  const msTimeDiff = currentDate.getTime() - startOfYear.getTime() - delay;
  const daysPassed = Math.floor(msTimeDiff / (1000 * 60 * 60 * 24));

  return [yearsPassed, daysPassed];
}

/**
 * Generates the puzzle letters
 * 
 * @param numSeed - An extra number to change up the seed 
 * @param nNext - Amount of next() calls to do
 * @returns Shuffled puzzle letters
 */
function generatePuzzle(numSeed: number, nNext: number): string[] {
  const seed = 123 + numSeed;
  const lcg = new LCG(seed);
  const nWords = nineData.words.length;

  let idx = 0;
  for (let _ = 0; _ < nNext; _++) {
    idx = Math.floor(lcg.next() * nWords);
  }

  return shuffle(Array.from(nineData.words[idx]), seed);
}

/**
 * Finds anagrams in nineData based on the given letters
 * 
 * @param letters - The anagram letters
 * @returns An array with the found anagram words
 */
function findAnagrams(letters: string[]): string[] {
  // Create a copy so it does not affect the variable in the outer scope
  const sortedLetters = [...letters].sort().join('');
  return nineData.words.filter(word => sortedLetters === word.split('').sort().join(''));
}

/**
 * Count the letter frequency of a word
 * 
 * @param letters - The letters to count
 * @returns A dict with keys as letters and values as frequencies
 */
function letterFrequency(letters: string[]): { [key: string]: number } {
  let letterFreq: { [key: string]: number } = {};
  for (const letter of puzzleLetters) {
    if (!letterFreq[letter]) {
      letterFreq[letter] = 1;
    } else {
      letterFreq[letter]++;
    }
  }
  return letterFreq;
}

///////////////
// Init core //
///////////////
let userInput: Ref<{ char: string; highlighted: boolean }[]> = ref([]);
let isGuessCorrect: Ref<boolean> = ref(false);
let usedHelp: Ref<boolean> = ref(false);

// Get current dates starting from 04:00
const currentDate = new Date();
const [yearsPassed, daysPassed] = yearsDaysPassed(currentDate, 1000 * 60 * 60 * 4);

// Generate the word and init button states
const puzzleLetters = generatePuzzle(yearsPassed, daysPassed);
let btnStates: Ref<boolean[]> = ref(puzzleLetters.map(() => false));

// Find anagrams incase there are more than one answer
const words = findAnagrams(puzzleLetters);
const nWords: Ref<number> = ref(words.length);

// Init dict that prevents wrong inputs
let letterFreq = letterFrequency(puzzleLetters);

////////////////
// Game logic //
////////////////

// Helper functions for the event handler handleKeydown -the logic is for keyboard event presses and displays through userInput variable
function handleLetterDeletion(letterToDel: string = "", tileIdx: number = -1) {
  let removedLetter: string = "";
  isGuessCorrect.value = false;

  // Mouse click logic - len 1 for safety
  if (letterToDel.length === 1) {
    const delIdx = userInput.value.findLastIndex(item => item.char === letterToDel);
    removedLetter = userInput.value.splice(delIdx, 1)[0].char;
  } // Backspace logic - Removes the latest letter if the list is not empty 
  else if (userInput.value.length > 0) {
    removedLetter = userInput.value.pop()?.char || "";
  }

  if (removedLetter) {
    changeBtnState(removedLetter, false, tileIdx)
    letterFreq[removedLetter]++;
  }
}

function handleLetterInput(keyInput: string, tileIdx: number = -1) {
  // Prevents inputting a letter if it hits its limit
  if (letterFreq[keyInput] > 0) {
    changeBtnState(keyInput, true, tileIdx)
    userInput.value.push({ char: keyInput, highlighted: false });
    letterFreq[keyInput]--;
  } // Highlight repeated letters if they already exists and hit their limit
  else if (letterFreq[keyInput] === 0) {
    highlightRepeatedLetters(keyInput);
  }

  // Check for a win
  if (userInput.value.length === puzzleLetters.length) {
    let guess = userInput.value.map(item => item.char).join('');
    isGuessCorrect.value = words.includes(guess);
  } else {
    isGuessCorrect.value = false;
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


/** Controls if the tiles are grayed out or not */
function changeBtnState(letter: string, state: boolean, usedIdx: number | undefined = -1) {
  if (usedIdx === -1) {
    usedIdx = indexOfAll(puzzleLetters, letter).find(idx => btnStates.value[idx] === !state);
  }

  if (usedIdx !== undefined) {
    btnStates.value[usedIdx] = state;
  }
}

/** Code that displays used words based on the buttons clicked and is synchronized with keyboard inputs */
function displayUsedWords(letter: string, idx: number) {
  if (btnStates.value[idx]) {
    handleLetterDeletion(letter, idx)
  } else {
    handleLetterInput(letter, idx)
  }
}

//////////////////
// Help buttons //
//////////////////

/** Resets the game state */
function resetGameState() {
  userInput.value = [];
  isGuessCorrect.value = false;
  btnStates.value = puzzleLetters.map(() => false);
  letterFreq = letterFrequency(puzzleLetters);
}

/** Marks the first letter of the word */
function markFirstLetter() {
  if (isGuessCorrect.value) {
    return;
  }

  // Change winning test to highlight help was used
  usedHelp.value = true;

  const firstInput = userInput.value[0];
  const firstLetter = words[0][0];

  // If no input, add the first letter
  if (!firstInput) {
    handleLetterInput(firstLetter);
  } // If first input is correct, highlight it
  else if (firstInput.char === firstLetter) {
    firstInput.highlighted = true;
    setTimeout(() => { firstInput.highlighted = false; }, 1000);
  } // If first input is incorrect, reset and add the first letter
  else {
    resetGameState()
    handleLetterInput(firstLetter);
  }
}

</script>

<template>
  <!-- Title and subtitle -->
  <div class="mt-3 font-mono flex flex-col items-center">
    <h1 class="text-5xl tracking-widest">NIAN</h1>
    <h2 class="text-base leading-none">{{ nWords > 1 ? $t("nian.subtitlePlural") : $t("nian.subtitle") }}</h2>
  </div>

  <!-- Wraps puzzle and input to be able to center them -->
  <div class="mt-5 px-3 font-bold font-mono flex flex-col items-center">
    <div class="relative inline-block">
      <!-- Displays the 9 word puzzle -->
      <div class="size-60 text-4xl bg-neutral-50 text-black grid grid-cols-3 gap-0 border-2 border-black rounded-md">
        <button @click="displayUsedWords(displayLetter, letterBoxIdx)"
          v-for="(displayLetter, letterBoxIdx) in puzzleLetters" :key="letterBoxIdx"
          class="border border-black flex justify-center items-center"
          :class="{ 'bg-black text-neutral-50': letterBoxIdx === 4, 'bg-gray-300': btnStates[letterBoxIdx], 'bg-gray-600': letterBoxIdx === 4 && btnStates[letterBoxIdx] }">
          {{ displayLetter }}
        </button>
      </div>

      <!-- Display x words -->
      <div v-if="nWords > 1"
        class="font-mono text-4xl text-red-700 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] absolute top-0 -right-0 transform translate-x-3/4 -translate-y-1/2">
        &times;{{ nWords }}
      </div>

      <!-- Help buttons -->
      <div class="absolute top-6 -right-12 flex flex-col space-y-4">
        <button @click="resetGameState()">
          <IconsCleaningBroomAnim class="h-12" />
        </button>
        <button @click="markFirstLetter()">
          <IconsMagnifyingGlass
            class="h-12 transition-transform duration-100 ease-out hover:scale-110 hover:-rotate-12" />
        </button>
      </div>

      <!-- Display lätt/easy text -->
      <div v-if="isGuessCorrect"
        class="font-FairProsper text-2xl text-orange-400 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] absolute bottom-0 -right-0 transform translate-x-3/4 translate-y-2/3 rotate-12 sm:text-3xl md:text-4xl">
        <p>{{ usedHelp ? $t("nian.hard") : $t('nian.easy') }}</p>
      </div>
    </div>

    <!-- The user input, is displayed iteratively until 9 boxes  -->
    <div class="inline-flex flex-wrap mt-6 space-x-1">
      <div v-for="(inputLetter, inputIdx) in userInput" :key="inputIdx"
        class="size-8 mx-auto bg-neutral-50 border-dashed border border-black rounded-lg flex justify-center items-center sm:size-9 md:size-11"
        :class="{ 'bg-orange-300': inputLetter.highlighted, 'border-emerald-500 animate-bounce-y': isGuessCorrect, 'animate-shake-x': userInput.length === 9 && !isGuessCorrect }"
        :style="{ 'animation-delay': `${(inputIdx * 0.05 + 0.3) * isGuessCorrect}s` }">
        {{ inputLetter.char }}
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>