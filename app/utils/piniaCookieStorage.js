export const createCookieStorage = (maxAge) => ({
  getItem: (key) => useCookie(key, { maxAge }).value ?? null,

  setItem: (key, value) => {
    useCookie(key, { maxAge }).value = value;
  },

  removeItem: (key) => {
    useCookie(key).value = null;
  },
});
