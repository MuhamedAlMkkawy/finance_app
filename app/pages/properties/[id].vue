<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink :to="localePath('/properties')" class="text-xs text-slate-400 hover:text-emerald-600 transition-colors">
            <i class="pi pi-arrow-left"></i> Back to Properties
          </NuxtLink>
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Property: {{ id }}</span>
          <span
            v-if="details?.overview"
            class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
          >
            {{ details.overview.salesPercentage }}% Sold
          </span>
        </h1>
        <p v-if="details?.property?.originalPropertyId !== id" class="text-xs text-slate-400 mt-0.5">
          Source identifier in Excel: {{ details?.property?.originalPropertyId }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          :to="localePath(`/units?property=${id}`)"
          class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <i class="pi pi-list text-xs"></i>
          <span>View All {{ details?.overview?.totalUnits || '' }} Units</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="h-96 bg-slate-200/60 animate-pulse rounded-2xl"></div>

    <div v-else-if="details" class="space-y-6">
      <!-- Section 1 & 2: Overview & Inventory KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Total Unit Records</span>
          <span class="text-xl font-black text-slate-900">{{ details.overview.totalUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Unique Units</span>
          <span class="text-xl font-black text-sky-600">{{ details.overview.uniqueUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Sold Units</span>
          <span class="text-xl font-black text-emerald-600">{{ details.overview.soldUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Available Units</span>
          <span class="text-xl font-black text-amber-600">{{ details.overview.availableUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Occupied</span>
          <span class="text-xl font-black text-blue-600">{{ details.overview.occupiedUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Vacant</span>
          <span class="text-xl font-black text-teal-600">{{ details.overview.vacantUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Reserved</span>
          <span class="text-xl font-black text-purple-600">{{ details.overview.reservedUnits }}</span>
        </div>
      </div>

      <!-- Section 3: Financials Summary -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <i class="pi pi-dollar text-emerald-600"></i>
          <span>Financial Performance & Pricing</span>
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span class="text-xs text-emerald-800 font-semibold block">Total Recorded Sales</span>
            <span class="text-lg font-black text-emerald-900 mt-1 block">
              {{ details.financials.totalSaleAmount.toLocaleString() }} {{ details.financials.currency }}
            </span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs text-slate-600 font-semibold block">Total Overall Amount</span>
            <span class="text-lg font-black text-slate-800 mt-1 block">
              {{ details.financials.totalOverallAmount.toLocaleString() }} {{ details.financials.currency }}
            </span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs text-slate-600 font-semibold block">Average Price / Unit</span>
            <span class="text-lg font-black text-slate-800 mt-1 block">
              {{ details.financials.avgSalePrice.toLocaleString() }} {{ details.financials.currency }}
            </span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs text-slate-600 font-semibold block">Average Price / m²</span>
            <span class="text-lg font-black text-slate-800 mt-1 block">
              {{ details.financials.avgPricePerSqm.toLocaleString() }} {{ details.financials.currency }}/m²
            </span>
          </div>
        </div>
      </div>

      <!-- Section 4 & 5: Blocks, Floors, Unit Types -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Blocks -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Blocks Distribution</h4>
          <div class="space-y-2 max-h-56 overflow-y-auto">
            <div
              v-for="b in details.blocks"
              :key="b.blockId"
              class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              <span class="font-bold text-slate-700">Block {{ b.blockId }}</span>
              <span class="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-900">
                {{ b.count }} units
              </span>
            </div>
          </div>
        </div>

        <!-- Floors -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Floors Distribution</h4>
          <div class="space-y-2 max-h-56 overflow-y-auto">
            <div
              v-for="f in details.floors"
              :key="f.floorId"
              class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              <span class="font-bold text-slate-700">{{ f.floorId }}</span>
              <span class="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-900">
                {{ f.count }} units
              </span>
            </div>
          </div>
        </div>

        <!-- Unit Types -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Unit Types</h4>
          <div class="space-y-2 max-h-56 overflow-y-auto">
            <div
              v-for="t in details.unitTypes"
              :key="t.unitType"
              class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              <span class="font-bold text-slate-700">{{ t.unitType }}</span>
              <span class="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-900">
                {{ t.count }} units
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 6 & 7: Facilities & Maintenance -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Facilities & Features</h4>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <span class="text-slate-600">Swimming Pool</span>
              <span class="font-bold text-slate-900">{{ details.facilities.swimmingPoolCount }} units</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <span class="text-slate-600">Balcony</span>
              <span class="font-bold text-slate-900">{{ details.facilities.balconyCount }} units</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <span class="text-slate-600">Basement Parking</span>
              <span class="font-bold text-slate-900">{{ details.facilities.basementParkingCount }} units</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <span class="text-slate-600">Outside Parking</span>
              <span class="font-bold text-slate-900">{{ details.facilities.outsideParkingCount }} units</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between col-span-2">
              <span class="text-slate-600">Maid Room</span>
              <span class="font-bold text-slate-900">{{ details.facilities.maidRoomCount }} units</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Maintenance Schedule</h4>
          <div class="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Units with Valid Recorded Maintenance:</span>
              <span class="font-bold text-emerald-700">{{ details.maintenance.validMaintenanceDatesCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Placeholder (1900-01-01) Excluded:</span>
              <span class="font-bold text-slate-600">
                {{ details.maintenance.totalRecords - details.maintenance.validMaintenanceDatesCount }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
              System correctly flags legacy system placeholder date 1900-01-01 to avoid skewing scheduling metrics.
            </p>
          </div>
        </div>
      </div>

      <!-- Section 8: Raw Source Sample Units -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Sample Units Registry (First 50)</h4>
          <NuxtLink :to="localePath(`/units?property=${id}`)" class="text-xs font-bold text-emerald-600 hover:text-emerald-800">
            View All in Units Table →
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-2.5">Unit ID</th>
                <th class="p-2.5">Unit Name</th>
                <th class="p-2.5">Block</th>
                <th class="p-2.5">Floor</th>
                <th class="p-2.5 text-right">Area (m²)</th>
                <th class="p-2.5 text-right">Sale Amount</th>
                <th class="p-2.5">Status</th>
                <th class="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr v-for="u in details.sampleUnits" :key="u.id" class="hover:bg-slate-50">
                <td class="p-2.5 font-bold text-slate-900">
                  <NuxtLink :to="localePath(`/units/${u.id}`)" class="hover:text-emerald-600">
                    {{ u.unitId }}
                  </NuxtLink>
                </td>
                <td class="p-2.5 text-slate-600">{{ u.unitName || '-' }}</td>
                <td class="p-2.5">{{ u.blockId || '-' }}</td>
                <td class="p-2.5">{{ u.floorId || '-' }}</td>
                <td class="p-2.5 text-right">{{ u.unitArea?.toLocaleString() || '-' }}</td>
                <td class="p-2.5 text-right font-bold text-slate-900">
                  {{ u.saleAmount ? u.saleAmount.toLocaleString() + ' ' + u.currencyCode : '-' }}
                </td>
                <td class="p-2.5">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      u.salesUnitStatus?.toLowerCase() === 'sold' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    ]"
                  >
                    {{ u.salesUnitStatus }}
                  </span>
                </td>
                <td class="p-2.5 text-center">
                  <NuxtLink :to="localePath(`/units/${u.id}`)" class="text-emerald-600 hover:text-emerald-800 font-bold">
                    View Full 92 Fields →
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const localePath = useLocalePath();
const id = String(route.params.id || '');

const loading = ref(true);
const details = ref(null);

async function loadDetails() {
  loading.value = true;
  try {
    details.value = await $fetch(`/api/properties/${id}`);
  } catch (err) {
    console.error('Failed to load property details', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadDetails();
});
</script>

