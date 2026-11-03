<template>
  <div class="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
    <!-- Dark Navy Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 start-0 z-50 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 shadow-2xl border-e border-slate-800',
        sidebarCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- Brand / Logo Area -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <NuxtLink :to="localePath('/dashboard')" class="flex items-center gap-3 overflow-hidden">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <i class="pi pi-building text-lg"></i>
          </div>
          <div v-if="!sidebarCollapsed" class="flex flex-col">
            <span class="text-sm font-bold text-white tracking-wide leading-tight">LAYLA PROPERTY</span>
            <span class="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">Executive Analytics</span>
          </div>
        </NuxtLink>
        <button
          v-if="!sidebarCollapsed"
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Collapse Sidebar"
        >
          <i class="pi pi-angle-left text-sm"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="localePath(item.to)"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
            isActive(item.to)
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          ]"
        >
          <i :class="[item.icon, 'text-base shrink-0']"></i>
          <span v-if="!sidebarCollapsed" class="truncate">{{ $t(item.label) }}</span>
          <span
            v-if="item.badge && !sidebarCollapsed"
            class="ms-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700"
          >
            {{ item.badge }}
          </span>
          <!-- Tooltip on collapsed -->
          <div
            v-if="sidebarCollapsed"
            class="absolute start-full ms-2 px-2.5 py-1 bg-slate-950 text-white text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-800"
          >
            {{ $t(item.label) }}
          </div>
        </NuxtLink>

        <!-- Analytics Group Header -->
        <div v-if="!sidebarCollapsed" class="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {{ $t('nav.analytics') }}
        </div>
        <div v-else class="my-2 border-t border-slate-800"></div>

        <NuxtLink
          v-for="item in analyticsItems"
          :key="item.to"
          :to="localePath(item.to)"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
            isActive(item.to)
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          ]"
        >
          <i :class="[item.icon, 'text-base shrink-0']"></i>
          <span v-if="!sidebarCollapsed" class="truncate">{{ $t(item.label) }}</span>
          <div
            v-if="sidebarCollapsed"
            class="absolute start-full ms-2 px-2.5 py-1 bg-slate-950 text-white text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-800"
          >
            {{ $t(item.label) }}
          </div>
        </NuxtLink>
      </div>

      <!-- Bottom User Profile Card -->
      <div class="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-800">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              AD
            </div>
            <div v-if="!sidebarCollapsed" class="flex flex-col truncate">
              <span class="text-xs font-semibold text-slate-200 truncate">Administrator</span>
              <span class="text-[10px] text-slate-400 truncate">admin@property.com</span>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            title="Sign Out"
          >
            <i class="pi pi-sign-out text-xs"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Workspace -->
    <div :class="['flex-1 flex flex-col min-h-screen transition-all duration-300', sidebarCollapsed ? 'ms-20' : 'ms-64']">
      <!-- Fixed Top Header -->
      <header class="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 shadow-sm px-6 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button
            @click="sidebarCollapsed = !sidebarCollapsed"
            class="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <i :class="sidebarCollapsed ? 'pi pi-bars' : 'pi pi-align-left'" class="text-base"></i>
          </button>

          <!-- Breadcrumb & Context -->
          <div class="flex items-center gap-2 text-xs">
            <NuxtLink :to="localePath('/dashboard')" class="text-slate-400 hover:text-emerald-600 transition-colors">
              <i class="pi pi-home"></i>
            </NuxtLink>
            <span class="text-slate-300">/</span>
            <span class="font-bold text-slate-800 capitalize">{{ currentSectionTitle }}</span>
          </div>
        </div>

        <!-- Right Tools -->
        <div class="flex items-center gap-3">
          <!-- Global Search Input -->
          <div class="relative hidden md:block w-64">
            <i class="pi pi-search absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              v-model="globalSearch"
              @keydown.enter="handleGlobalSearch"
              :placeholder="$t('common.search')"
              class="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          <!-- Language Switcher -->
          <SwitchLanguage />

          <!-- Quick Action: Executive PDF / Excel -->
          <NuxtLink
            :to="localePath('/reports')"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            <i class="pi pi-file-export text-xs"></i>
            <span>{{ $t('nav.reports') }}</span>
          </NuxtLink>
        </div>
      </header>

      <!-- Page Main Body -->
      <main class="flex-1 p-6 md:p-8 max-w-[1700px] w-full mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const globalSearch = ref('')

const navItems = [
  { to: '/dashboard', label: 'nav.dashboard', icon: 'pi pi-chart-pie' },
  { to: '/properties', label: 'nav.properties', icon: 'pi pi-building' },
  { to: '/units', label: 'nav.units', icon: 'pi pi-list', badge: '1,034' },
  { to: '/data-explorer', label: 'nav.data_explorer', icon: 'pi pi-database' },
  { to: '/imports', label: 'nav.imports', icon: 'pi pi-cloud-upload' },
  { to: '/reports', label: 'nav.reports', icon: 'pi pi-file-pdf' },
]

const analyticsItems = [
  { to: '/analytics/sales', label: 'nav.sales_analytics', icon: 'pi pi-dollar' },
  { to: '/analytics/financial', label: 'nav.financial_analytics', icon: 'pi pi-wallet' },
  { to: '/analytics/inventory', label: 'nav.inventory_analytics', icon: 'pi pi-box' },
]

function isActive(path) {
  const current = route.path
  return current.includes(path) || (path === '/dashboard' && current === '/')
}

const currentSectionTitle = computed(() => {
  const seg = route.path.split('/').filter(Boolean)
  if (!seg.length || seg[0] === 'dashboard' || (seg.length > 1 && seg[1] === 'dashboard')) return 'Executive Dashboard'
  return seg[seg.length - 1].replace(/-/g, ' ')
})

function handleGlobalSearch() {
  if (globalSearch.value.trim()) {
    router.push({ path: localePath('/units'), query: { search: globalSearch.value.trim() } })
  }
}

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  authStore.logout()
  router.push(localePath('/auth'))
}
</script>
