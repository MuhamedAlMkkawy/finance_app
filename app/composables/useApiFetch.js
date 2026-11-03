// Common options configuration function
const createFetchOptions = (authed, options = {}) => {
  const token =
    useAuthStore()?.userData?.token ||
    JSON.parse(window.sessionStorage.getItem("authStore"))?.token;

  const lang = useGlobalStore().lang;
  const config = useRuntimeConfig();

  return {
    baseURL: options.baseURL || config.public.apiBase,
    headers: {
      ...(authed ? { authorization: `Bearer ${token}` } : {}),
      lang,
      secretKey: config.public.secretKey,
      ...options.headers,
    },
    responseType: "json",
    ...options,
  };
};

// API function
export const apiRequest = async (
  url,
  authed,
  { method = "GET", body, ...options } = {},
) => {
  try {
    const response = await $fetch(url, {
      ...createFetchOptions(authed, options),
      method,
      body,
    });

    return { data: response, error: null };
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return { data: null, error };
  }
};
