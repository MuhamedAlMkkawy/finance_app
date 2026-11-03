<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 px-4 py-12">
    <div class="pointer-events-none fixed -top-32 -right-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl"></div>
    <div class="pointer-events-none fixed -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

    <div class="absolute top-4 inset-inline-end-4 z-20 flex items-center gap-2">
      <SwitchLanguage />
      <!-- <SwitchTheme /> -->
    </div>

    <div class="relative z-10 w-full max-w-md">
      <div class="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">

        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
            <i class="pi pi-file-excel text-2xl text-emerald-500 dark:text-emerald-400"></i>
          </div>
          <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ $t('auth.title') }}</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ $t('auth.subtitle') }}</p>
        </div>

        <div class="flex bg-gray-100 dark:bg-white/5 rounded-2xl p-1 mb-8 border border-gray-200 dark:border-white/10">
          <button
            @click="mode = 'login'"
            :class="[
              'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all',
              mode === 'login'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <i class="pi pi-sign-in mx-1.5 text-xs"></i>
            {{ $t('auth.tab_login') }}
          </button>
          <button
            @click="mode = 'register'"
            :class="[
              'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all',
              mode === 'register'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <i class="pi pi-user-plus mx-1.5 text-xs"></i>
            {{ $t('auth.tab_register') }}
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="space-y-1.5 w-full">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('auth.email') }}
            </label>
            <div
              class="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border rounded-xl px-4 py-3 transition-all"
              :class="errors.email ? 'border-red-500/60' : 'border-gray-200 dark:border-white/10 focus-within:border-emerald-500/60'"
            >
              <i class="pi pi-envelope text-gray-400 text-sm flex-shrink-0"></i>
              <input
                v-model="form.email"
                type="text"
                :placeholder="$t('auth.email_placeholder')"
                autocomplete="email"
                class="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm outline-none"
              />
            </div>
            <p v-if="errors.email" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div class="space-y-1.5 w-full">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('auth.password') }}
            </label>
            <div
              class="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border rounded-xl px-4 py-3 transition-all"
              :class="errors.password ? 'border-red-500/60' : 'border-gray-200 dark:border-white/10 focus-within:border-emerald-500/60'"
            >
              <i class="pi pi-lock text-gray-400 text-sm flex-shrink-0"></i>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="$t('auth.password_placeholder')"
                autocomplete="current-password"
                class="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm outline-none"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                :title="showPassword ? $t('auth.hide_password') : $t('auth.show_password')"
              >
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ errors.password }}</p>
          </div>

          <Transition name="fade">
            <div v-if="mode === 'register'" class="space-y-1.5 w-full">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ $t('auth.confirm_password') }}
              </label>
              <div
                class="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border rounded-xl px-4 py-3 transition-all"
                :class="errors.confirmPassword ? 'border-red-500/60' : 'border-gray-200 dark:border-white/10 focus-within:border-emerald-500/60'"
              >
                <i class="pi pi-lock text-gray-400 text-sm flex-shrink-0"></i>
                <input
                  v-model="form.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="$t('auth.password_placeholder')"
                  autocomplete="new-password"
                  class="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm outline-none"
                />
              </div>
              <p v-if="errors.confirmPassword" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ errors.confirmPassword }}</p>
            </div>
          </Transition>

          <Transition name="fade">
            <div
              v-if="serverError"
              class="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-500 dark:text-red-400 text-sm"
            >
              <i class="pi pi-exclamation-circle flex-shrink-0"></i>
              <span>{{ serverError }}</span>
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <i v-else-if="mode === 'login'" class="pi pi-sign-in"></i>
            <i v-else class="pi pi-user-plus"></i>
            <span>{{ loading ? $t('auth.btn_loading') : (mode === 'login' ? $t('auth.btn_login') : $t('auth.btn_register')) }}</span>
          </button>
        </form>

        <p class="text-center text-xs text-gray-500 dark:text-gray-600 mt-6">
          {{ mode === 'login' ? $t('auth.switch_to_register') : $t('auth.switch_to_login') }}
          <button
            type="button"
            @click="mode = mode === 'login' ? 'register' : 'login'"
            class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold mx-1 transition-colors"
          >
            {{ mode === 'login' ? $t('auth.register_link') : $t('auth.login_link') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const localePath = useLocalePath()

const mode = ref('login')
const loading = ref(false)
const showPassword = ref(false)
const serverError = ref('')

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

watch(() => [form.email, form.password, form.confirmPassword], () => {
  serverError.value = ''
})

watch(mode, () => {
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  serverError.value = ''
})

function validate() {
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  let valid = true

  if (!form.email.trim()) {
    errors.email = t('auth.errors.email_required')
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('auth.errors.email_invalid')
    valid = false
  }

  if (!form.password) {
    errors.password = t('auth.errors.password_required')
    valid = false
  } else if (form.password.length < 6) {
    errors.password = t('auth.errors.password_min')
    valid = false
  }

  if (mode.value === 'register') {
    if (!form.confirmPassword) {
      errors.confirmPassword = t('auth.errors.confirm_required')
      valid = false
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = t('auth.errors.confirm_mismatch')
      valid = false
    }
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  serverError.value = ''

  try {
    const endpoint = mode.value === 'login' ? '/api/auth/login' : '/api/auth/register'
    const res = await $fetch(endpoint, {
      method: 'POST',
      body: {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      },
    })

    authStore.handleUserData(res.user)
    await router.push(localePath('/'))
  } catch (err) {
    serverError.value = err?.data?.statusMessage || err?.statusMessage || t('auth.errors.generic')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
