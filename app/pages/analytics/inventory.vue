<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('analytics.inventory_title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">Commercial availability vs operational occupancy, vacancy rates, and conflicting statuses</p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          :to="localePath('/reports')"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
        >
          <i class="pi pi-file-excel text-xs"></i>
          <span>Inventory Export</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="h-96 bg-slate-200/60 animate-pulse rounded-2xl"></div>

    <div v-else-if="data" class="space-y-6">
      <!-- 5 Inventory Distinct Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Total Units</span>
          <span class="text-xl font-black text-slate-900 mt-1 block">{{ data.counts.totalUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Commercial Sold</span>
          <span class="text-xl font-black text-emerald-600 mt-1 block">{{ data.counts.soldUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Commercial Available</span>
          <span class="text-xl font-black text-amber-600 mt-1 block">{{ data.counts.availableUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-blue-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Physically Occupied</span>
          <span class="text-xl font-black text-blue-600 mt-1 block">{{ data.counts.occupiedUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-teal-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Physically Vacant</span>
          <span class="text-xl font-black text-teal-600 mt-1 block">{{ data.counts.vacantUnits }}</span>
        </div>
      </div>

      <!-- Inventory by Property -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Inventory Status Breakdown by Property
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3">Property ID</th>
                <th class="p-3 text-right">Total Units</th>
                <th class="p-3 text-right">Sold Units</th>
                <th class="p-3 text-right">Available Units</th>
                <th class="p-3 text-right">Absorption Rate %</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr v-for="p in data.byProperty" :key="p.propertyId" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-slate-900">
                  <NuxtLink :to="localePath(`/properties/${p.propertyId}`)" class="hover:text-emerald-600">
                    {{ p.propertyId }}
                  </NuxtLink>
                </td>
                <td class="p-3 text-right font-bold">{{ p.total }}</td>
                <td class="p-3 text-right font-bold text-emerald-600">{{ p.sold }}</td>
                <td class="p-3 text-right font-bold text-amber-600">{{ p.available }}</td>
                <td class="p-3 text-right">
                  <span class="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800">
                    {{ p.total > 0 ? ((p.sold / p.total) * 100).toFixed(1) : 0 }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Conflicting Status Flags Audit -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h4 class="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <i class="pi pi-flag"></i>
            <span>Conflicting Operational Status Audit</span>
          </h4>
          <span class="text-[10px] text-slate-400">Records where ISOCCUPIED and ISVACCANT conflict</span>
        </div>
        <div v-if="data.conflicting.length === 0" class="p-6 text-center text-xs text-slate-500">
          <i class="pi pi-check-circle text-emerald-600 text-lg block mb-1"></i>
          <span>No conflicting occupancy flags detected. Commercial and physical statuses are aligned.</span>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-amber-50 text-amber-800 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-2">Unit ID</th>
                <th class="p-2">Property</th>
                <th class="p-2">Occupied Flag</th>
                <th class="p-2">Vacant Flag</th>
                <th class="p-2">Sales Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr v-for="c in data.conflicting" :key="c.id" class="hover:bg-slate-50">
                <td class="p-2 font-bold">{{ c.unitId }}</td>
                <td class="p-2">{{ c.propertyId }}</td>
                <td class="p-2 text-rose-600 font-bold">{{ c.occupied ? 'Yes' : 'No' }}</td>
                <td class="p-2 text-rose-600 font-bold">{{ c.vacant ? 'Yes' : 'No' }}</td>
                <td class="p-2">{{ c.salesUnitStatus }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath();
const loading = ref(true);
const data = ref(null);

async function loadInventory() {
  loading.value = true;
  try {
    data.value = await $fetch('/api/analytics/inventory');
  } catch (err) {
    console.error('Failed to load inventory analytics', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadInventory();
});
</script>

