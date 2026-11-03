<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink :to="localePath('/units')" class="text-xs text-slate-400 hover:text-emerald-600 transition-colors">
            <i class="pi pi-arrow-left"></i> Back to Units Inventory
          </NuxtLink>
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Unit: {{ data?.unit?.unitId || id }}</span>
          <span
            v-if="data?.categorized?.status?.salesUnitStatus"
            :class="[
              'text-xs font-bold px-2.5 py-0.5 rounded-full',
              data.categorized.status.salesUnitStatus.toLowerCase() === 'sold' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            ]"
          >
            {{ data.categorized.status.salesUnitStatus }}
          </span>
        </h1>
        <p class="text-xs text-slate-400 mt-0.5">
          Property: {{ data?.unit?.propertyId }} • DB Record #{{ data?.unit?.id }} • Excel Row #{{ data?.unit?.sourceRowNumber }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          :to="localePath(`/properties/${data?.unit?.propertyId}`)"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
        >
          <i class="pi pi-building text-xs"></i>
          <span>View Property {{ data?.unit?.propertyId }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="h-96 bg-slate-200/60 animate-pulse rounded-2xl"></div>

    <div v-else-if="data?.categorized" class="space-y-6">
      <!-- 8 Categorized Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 1. General Information -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <i class="pi pi-info-circle text-emerald-600"></i>
            <span>{{ $t('units.cat_general') }}</span>
          </h3>
          <dl class="grid grid-cols-2 gap-3 text-xs">
            <div v-for="(val, key) in data.categorized.general" :key="key" class="p-2.5 bg-slate-50 rounded-xl">
              <dt class="text-[10px] font-bold text-slate-400 uppercase">{{ formatLabel(key) }}</dt>
              <dd class="font-bold text-slate-800 mt-0.5 truncate">{{ val != null && val !== '' ? val : '-' }}</dd>
            </div>
          </dl>
        </div>

        <!-- 2. Location & Structure -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <i class="pi pi-map-marker text-sky-600"></i>
            <span>{{ $t('units.cat_location') }}</span>
          </h3>
          <dl class="grid grid-cols-2 gap-3 text-xs">
            <div v-for="(val, key) in data.categorized.location" :key="key" class="p-2.5 bg-slate-50 rounded-xl">
              <dt class="text-[10px] font-bold text-slate-400 uppercase">{{ formatLabel(key) }}</dt>
              <dd class="font-bold text-slate-800 mt-0.5 truncate">{{ val != null && val !== '' ? val : '-' }}</dd>
            </div>
          </dl>
        </div>

        <!-- 3. Area Information -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <i class="pi pi-chart-pie text-indigo-600"></i>
            <span>{{ $t('units.cat_area') }}</span>
          </h3>
          <dl class="grid grid-cols-2 gap-3 text-xs">
            <div v-for="(val, key) in data.categorized.area" :key="key" class="p-2.5 bg-slate-50 rounded-xl">
              <dt class="text-[10px] font-bold text-slate-400 uppercase">{{ formatLabel(key) }}</dt>
              <dd class="font-bold text-slate-800 mt-0.5 truncate">{{ val != null && val !== '' ? val : '-' }}</dd>
            </div>
          </dl>
        </div>

        <!-- 4. Sales and Financials -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <i class="pi pi-dollar text-emerald-600"></i>
            <span>{{ $t('units.cat_financials') }}</span>
          </h3>
          <dl class="grid grid-cols-2 gap-3 text-xs">
            <div v-for="(val, key) in data.categorized.financials" :key="key" class="p-2.5 bg-slate-50 rounded-xl">
              <dt class="text-[10px] font-bold text-slate-400 uppercase">{{ formatLabel(key) }}</dt>
              <dd class="font-bold text-slate-900 mt-0.5 truncate">{{ val != null && val !== '' ? val : '-' }}</dd>
            </div>
          </dl>
        </div>

        <!-- 5. Status & Operational -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <i class="pi pi-check-square text-purple-600"></i>
            <span>{{ $t('units.cat_status') }}</span>
          </h3>
          <dl class="grid grid-cols-2 gap-3 text-xs">
            <div v-for="(val, key) in data.categorized.status" :key="key" class="p-2.5 bg-slate-50 rounded-xl">
              <dt class="text-[10px] font-bold text-slate-400 uppercase">{{ formatLabel(key) }}</dt>
              <dd class="font-bold mt-0.5 truncate" :class="val === 'Yes' ? 'text-emerald-600' : 'text-slate-800'">
                {{ val != null && val !== '' ? val : '-' }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- 6. Facilities & Features -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <i class="pi pi-home text-amber-600"></i>
            <span>{{ $t('units.cat_facilities') }}</span>
          </h3>
          <dl class="grid grid-cols-2 gap-3 text-xs">
            <div v-for="(val, key) in data.categorized.facilities" :key="key" class="p-2.5 bg-slate-50 rounded-xl">
              <dt class="text-[10px] font-bold text-slate-400 uppercase">{{ formatLabel(key) }}</dt>
              <dd class="font-bold text-slate-800 mt-0.5 truncate">{{ val != null && val !== '' ? val : '-' }}</dd>
            </div>
          </dl>
        </div>

        <!-- 7. Maintenance & Schedule -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <i class="pi pi-calendar text-teal-600"></i>
            <span>{{ $t('units.cat_maintenance') }}</span>
          </h3>
          <dl class="grid grid-cols-2 gap-3 text-xs">
            <div v-for="(val, key) in data.categorized.maintenance" :key="key" class="p-2.5 bg-slate-50 rounded-xl">
              <dt class="text-[10px] font-bold text-slate-400 uppercase">{{ formatLabel(key) }}</dt>
              <dd class="font-bold mt-0.5 truncate" :class="String(val).includes('1900-01-01') ? 'text-slate-400 italic' : 'text-slate-800'">
                {{ val != null && val !== '' ? (String(val).includes('1900-01-01') ? 'Default (1900-01-01)' : val) : '-' }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- 8. Additional & Technical Info -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <i class="pi pi-sliders-v text-slate-600"></i>
            <span>{{ $t('units.cat_additional') }}</span>
          </h3>
          <dl class="grid grid-cols-2 gap-3 text-xs max-h-80 overflow-y-auto">
            <div v-for="(val, key) in data.categorized.additional" :key="key" class="p-2.5 bg-slate-50 rounded-xl">
              <dt class="text-[10px] font-bold text-slate-400 uppercase">{{ formatLabel(key) }}</dt>
              <dd class="font-bold text-slate-800 mt-0.5 truncate" :title="String(val)">
                {{ val != null && val !== '' ? val : '-' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Raw JSON Inspection Accordion (Guarantees all 92 fields visible) -->
      <!-- <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <details class="group cursor-pointer">
          <summary class="flex items-center justify-between text-xs font-bold text-slate-800 select-none">
            <div class="flex items-center gap-2">
              <i class="pi pi-code text-emerald-600"></i>
              <span>Inspect Complete Raw Excel Record (All 92 Source Fields)</span>
            </div>
            <i class="pi pi-chevron-down text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <div class="mt-4 pt-3 border-t border-slate-100">
            <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96">{{ JSON.stringify(data.categorized.rawData, null, 2) }}</pre>
          </div>
        </details>
      </div> -->
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const localePath = useLocalePath();
const id = String(route.params.id || '');

const loading = ref(true);
const data = ref(null);

async function loadUnit() {
  loading.value = true;
  try {
    data.value = await $fetch(`/api/units/${id}`);
  } catch (err) {
    console.error('Failed to load unit details', err);
  } finally {
    loading.value = false;
  }
}

function formatLabel(camelStr) {
  return camelStr
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

onMounted(() => {
  loadUnit();
});
</script>

