<template>
  <div
    class="fixed inset-0 z-[99999] flex items-center justify-center bg-white/70 dark:bg-gray-950/70 backdrop-blur-[10px]"
  >
    <img
      src="/assets/images/logo.gif"
      alt="image"
      loading="lazy"
      class="w-[200px] h-[200px] object-contain animate-custom-spin"
    />
  </div>
</template>

<script setup>
// import Skeleton from 'primevue/skeleton';
</script>

<style lang="scss" scoped>
  @keyframes spin {
    0% {
      transform: rotate(0deg) scale(0.8);
    }
    100% {
      transform: rotate(-360deg) scale(1.2);
    }
  }
</style>

