<script setup>
/**
 * @property {string} to - The 'to' prop is the destination URL for the NuxtLink
 */
const props = defineProps({
  to: String,
  src: {
    type: String,
    default: 'svg/menu/nian.svg'
  }
});

</script>

<template>
  <div class="rounded-3xl hover:shadow-lg menu-hover">
    <NuxtLink :to>
      <img :src class=" object-cover" />
    </NuxtLink>
  </div>
</template>

<style lang="scss">
.menu-hover {
  // Set up the hover animation
  transition: transform 0.1s ease-out;

  &:hover {
    // Increase the size of the button when hovered
    transform: scale(1.03);
  }
}
</style>