<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 dark:bg-[#000] dark:text-white relative text-center px-4">
    <div class="absolute top-4 inset-inline-end-4 z-20 flex items-center gap-2">
      <SwitchLanguage />
      <SwitchTheme />
    </div>

    <!-- Logo -->
    <div class="w-[400px] mb-[25px] mx-auto">
      <img
        src="~/assets/images/logo.png"
        alt="logo image"
        loading="lazy"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- 404 -->
    <h1 class="flex items-center gap-5 text-[150px] text-gray-900 dark:text-[#fff] leading-none">
      4
      <FeaturesNotFoundEyes />
      4
    </h1>

    <!-- Title -->
    <h3 class="text-[clamp(30px,5vw,60px)] mb-2">
      {{ $t("error_page.title") }}
    </h3>

    <!-- Button -->
    <NuxtLink
    :to="localeRoute('/')"
    class="main-btn max-w-[500px]"
  >
    {{ $t("error_page.go_home") }}
  </NuxtLink>
    
  </div>
</template>

<script setup>
const localeRoute = useLocaleRoute();
</script>
