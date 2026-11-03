import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const localePath = useLocalePath();

  const isAuthPage =
    to.name === 'auth' ||
    String(to.name ?? '').startsWith('auth___');

  if (!authStore.isLoggedIn && !isAuthPage) {
    return navigateTo(localePath('/auth'));
  }

  if (authStore.isLoggedIn && isAuthPage) {
    return navigateTo(localePath('/'));
  }
});
