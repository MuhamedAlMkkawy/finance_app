<template>
  <NuxtLink
    v-for="availableLocale in availableLocales"
    :key="availableLocale.code"
    class="app-control-btn"
    :to="switchLocalePath(availableLocale.code)"
    :title="$t('language.switch')"
    :aria-label="$t('language.switch')"
    @click="useGlobalStore().setLang(availableLocale.code)"
  >
    <span class="text-[11px] font-bold uppercase tracking-wide">
      {{ availableLocale.code === "ar" ? "ع" : "EN" }}
    </span>
    <i class="pi pi-globe"></i>
  </NuxtLink>
</template>

<script setup>
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
  return locales.value.filter((item) => item.code !== locale.value)
})
</script>
