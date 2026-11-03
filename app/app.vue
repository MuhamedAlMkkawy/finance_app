<template>
  <NuxtLayout>
    <NuxtPage />
    <Toast />
  </NuxtLayout>
</template>

<script setup>
import Toast from "primevue/toast";

const { locale } = useI18n();
const currentDir = computed(() => (locale.value === "ar" ? "rtl" : "ltr"));
const globalStore = useGlobalStore();
const { initTheme } = useTheme();

watch(
  locale,
  (value) => {
    globalStore.setLang(value);
  },
  { immediate: true }
);

onMounted(() => {
  initTheme();
});

useHead({
  htmlAttrs: {
    lang: locale,
    dir: currentDir,
  },
});
</script>
