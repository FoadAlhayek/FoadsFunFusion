<script setup>
useHead({
  title: 'Foad.fun',
  link: [
    {
      hid: 'icon',
      rel: 'icon',
      type: 'image/x-icon',
      href: '/icons/favicon.ico',
    },
  ],
});
</script>

<template>
  <div class="max-w-4xl mt-3 mx-auto px-6 grid gap-4 grid-cols-1 sm:grid-cols-2 sm:max-w-7xl lg:grid-cols-3">
    <GameBtn to="nian" src="svg/nian.svg" />
    <GameBtn to="currency-converter" />
    <GameBtn to="playground" />
    <GameBtn to="testarea" />
    <GameBtn />
    <GameBtn />
    <GameBtn />
  </div>
</template>

<style lang="scss"></style>