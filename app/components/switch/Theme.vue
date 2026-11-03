<template>
  <button
    type="button"
    class="app-control-btn"
    :title="isDark ? $t('theme.to_light') : $t('theme.to_dark')"
    :aria-label="isDark ? $t('theme.to_light') : $t('theme.to_dark')"
    @click="toggleTheme"
  >
    <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
  </button>
</template>

<script setup>
const { isDark, toggleTheme } = useTheme()
</script>
