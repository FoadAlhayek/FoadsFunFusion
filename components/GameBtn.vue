<script setup>
/**
 * @property {string} to - The 'to' prop is the destination URL for the NuxtLink
 */
const props = defineProps({
  to: String,
  src: {
    type: String,
    default: 'svg/internet-artifacts.svg'
  }
});

</script>

<template>
  <div class="rounded-xl w-1/3 hover:shadow-lg menu-hover">
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



.test {
  // Set the width of the button to 1/3 of the container width, subtracting margins and padding
  //width: calc(100%/3);
  //height: 100%;

  // Set the background image to an SVG (replace 'url-to-your-svg' with the actual URL)
  //background-image: url('assets/svg/printing-money.svg');
  background-color: red;
  background-repeat: no-repeat;
  background-position: center;

  // Set up the hover animation
  transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;

  &:hover {
    // Increase the size of the button when hovered
    transform: scale(1.1);

    // Change the background color when hovered
    background-color: #f0f0f0;
  }
}
</style>