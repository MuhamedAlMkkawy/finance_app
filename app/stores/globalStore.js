import { defineStore } from "pinia";
import { createCookieStorage } from "~/utils/piniaCookieStorage";

export const useGlobalStore = defineStore(
  "globalStore",
  () => {
    // HANDLE THE LOADING
    const loading = ref(false);
    const switchLoading = () => {
      loading.value = !loading.value;
    };

    // HANDLE THE LANGUAGE
    const lang = ref("en");
    const setLang = (newLang) => {
      lang.value = newLang;
    };

    return {
      loading,
      switchLoading,
      lang,
      setLang,
    };
  },
  {
    persist: {
      storage: createCookieStorage(60 * 60 * 24 * 2), // 2 days
    },
  },
);
