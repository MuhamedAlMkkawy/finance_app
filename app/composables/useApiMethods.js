import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/globalStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastMsg } from "@/composables/useToastMsg";
import { apiRequest } from "@/composables/useApiFetch";
import { ref } from "vue";

export function useApiMethods() {
  // define global store
  const globalStore = useGlobalStore();

  // define auth store
  const authStore = useAuthStore();

  // define router
  const router = useRouter();

  // define local route
  const localeRoute = useLocaleRoute();

  // define useToastMsg
  const { showErrorToast, showSuccessToast, showInfoToast, showWarnToast } =
    useToastMsg();

  // define handle the next route
  const handleNextRoute = (nextRoute) => {
    setTimeout(() => {
      if (nextRoute == "reload_page") {
        router.go(0);
      } else {
        router.push(localeRoute(nextRoute));
      }
    }, 500);
  };

  // define handle the toast message and its type
  const handleToastMsg = (type, message) => {
    // to stop the loading while showing the message
    globalStore.switchLoading();
    if (type == "success" || type == "needActive") {
      showSuccessToast(message);
    } else if (type == "info") {
      showInfoToast(message);
    } else if (type == "warn") {
      showWarnToast(message);
    } else if (type == "error") {
      showErrorToast(message);
    }
  };

  // Fetch Data ex: getMethod('/api/users', { page: 2, status: 'active', role: 'admin' }, true, true);
  const getResult = ref(null);
  const getMethod = async (endPoint, params = {}, authed, showToast) => {
    globalStore.switchLoading();
    getResult.value = null;

    // Build query string dynamically
    const queryString = new URLSearchParams(params).toString();
    const finalUrl = params ? `${endPoint}?${queryString}` : endPoint;

    // const { data, error } = await fetchApiData(finalUrl, authed, showToast);
    const { data, error } = await apiRequest(finalUrl, authed, {
      method: "GET",
    });

    if (error) {
      handleToastMsg("error", error?.response?._data?.message);

      if (
        error?.response?._data?.key == "unauthenticated" ||
        error?.response?._data?.key == "unauthorized" ||
        error?.response?._data?.key == "not_approved" ||
        error?.response?._data?.key == "blocked"
      ) {
        setTimeout(() => {
          location.reload();
        }, 500);
        useCookie("authStore").value = "";
      } else if (error?.response?._data?.key == "needActive") {
        setTimeout(() => {
          handleNextRoute("/auth/activation_code");
        }, 500);
      }
    } else {
      getResult.value = data;
      if (
        data.key == "unauthenticated" ||
        data.key == "unauthorized" ||
        data.key == "not_approved" ||
        data.key == "blocked"
      ) {
        setTimeout(() => {
          location.reload();
        }, 500);
        useCookie("authStore").value = "";
      }

      if (showToast) {
        handleToastMsg(data?.key, data?.message);
      }

      globalStore.switchLoading();
      return data;
    }
  };

  // submit form function
  const submitResult = ref(null);
  const submitMethod = async (
    endPoint,
    authed,
    payload,
    method,
    nextRoute,
    refetchApi,
  ) => {
    globalStore.switchLoading();
    // const { data, error } = await submitApiForm(
    //   endPoint,
    //   authed,
    //   payload,
    //   method,
    // );

    const { data, error } = await apiRequest(endPoint, authed, {
      method,
      body: payload,
    });

    if (error) {
      handleToastMsg("error", error?.response?._data?.message);
      if (
        error?.response?._data?.key == "unauthenticated" ||
        error?.response?._data?.key == "unauthorized" ||
        error?.response?._data?.key == "not_approved" ||
        error?.response?._data?.key == "blocked"
      ) {
        useCookie("authStore").value = "";
        setTimeout(() => {
          handleNextRoute("/auth/login");
        }, 500);
      } else if (error?.response?._data?.key == "needActive") {
        setTimeout(() => {
          handleNextRoute("/auth/activation_code");
        }, 500);
      }
    } else {
      if (data.key == "success" || data.key == "needActive") {
        handleNextRoute(nextRoute);
        if (refetchApi) {
          getMethod(refetchApi, "", authStore ? true : false, false);
        }
        if (
          endPoint == "activate" ||
          endPoint == "signin" ||
          endPoint == "update-provider-profile"
        ) {
          useCookie("authStore").value = data?.data;
        }
      } else if (data.key == "unauthenticated" || data.key == "not_approved") {
        handleNextRoute("/");
        useCookie("authStore").value = "";
      } else if (data?.key == "needActive") {
        setTimeout(() => {
          handleNextRoute("/auth/activation_code");
        }, 500);
      }
      submitResult.value = { data, endPoint };
      handleToastMsg(data?.key, data?.message);
      globalStore.switchLoading();
    }
  };

  return {
    getMethod,
    getResult,
    submitMethod,
    submitResult,
    showErrorToast,
    handleNextRoute,
  };
}
