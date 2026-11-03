<template>
  <button :class="['main-btn', { disabled: loading }]" @click="onClick">
    <span
      v-if="loading"
      class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
    ></span>
    <span>{{ label }}</span>
  </button>
</template>

<script setup>
  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      default: "",
    },
  });
  const router = useRouter();
  const localeRoute = useLocaleRoute();
  const emit = defineEmits(["click"]);

  // CHECK IF IS LOADING
  const { loading } = useApiMethods();

  // HANDLE THE CLICK FUNCTION OF THE BUTTON
  const onClick = () => {
    if (!props.loading) {
      if (props.path) {
        router.push(localeRoute(props.path));
      } else {
        emit("click");
      }
    }
  };
</script>
