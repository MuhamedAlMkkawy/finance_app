<template>
  <div class="space-y-6">
    <!-- Header & Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('properties.title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('properties.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- View Toggle (Grid / Table) -->
        <div class="flex items-center bg-slate-200/80 p-1 rounded-xl">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <i class="pi pi-th-large text-xs"></i>
            <span>{{ $t('properties.grid_view') }}</span>
          </button>
          <button
            @click="viewMode = 'table'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <i class="pi pi-list text-xs"></i>
            <span>{{ $t('properties.table_view') }}</span>
          </button>
        </div>

        <!-- Compare Button -->
        <button
          v-if="selectedProperties.length > 1"
          @click="showCompareModal = true"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <i class="pi pi-sliders-h text-xs"></i>
          <span>{{ $t('properties.compare_btn') }} ({{ selectedProperties.length }})</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in 6" :key="i" class="h-64 bg-slate-200/60 animate-pulse rounded-2xl"></div>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="prop in properties"
        :key="prop.normalizedPropertyId"
        class="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group relative overflow-hidden"
      >
        <!-- Top selection & Title -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :value="prop.normalizedPropertyId"
                v-model="selectedProperties"
                class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span class="font-mono text-xs font-bold text-slate-400">#{{ prop.id }}</span>
            </div>
            <span
              :class="[
                'px-2.5 py-0.5 rounded-full text-xs font-bold',
                prop.salesPercentage >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              ]"
            >
              {{ prop.salesPercentage }}% {{ $t('properties.sold_percentage') }}
            </span>
          </div>

          <NuxtLink
            :to="localePath(`/properties/${prop.normalizedPropertyId}`)"
            class="block group-hover:text-emerald-600 transition-colors"
          >
            <h3 class="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <i class="pi pi-building text-emerald-600"></i>
              <span>{{ prop.normalizedPropertyId }}</span>
            </h3>
            <span v-if="prop.originalPropertyId !== prop.normalizedPropertyId" class="text-[10px] text-slate-400">
              Source ID: {{ prop.originalPropertyId }}
            </span>
          </NuxtLink>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-100 text-xs">
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Total Units</span>
              <span class="font-extrabold text-slate-800 text-sm">{{ prop.totalUnits }}</span>
              <span class="text-[10px] text-slate-400 block">({{ prop.uniqueUnits }} unique)</span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Inventory Status</span>
              <div class="flex items-center gap-2 mt-0.5 font-bold">
                <span class="text-emerald-600">{{ prop.soldUnits }} Sold</span>
                <span class="text-slate-300">•</span>
                <span class="text-amber-600">{{ prop.availableUnits }} Avail</span>
              </div>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Sales Value</span>
              <span class="font-extrabold text-emerald-700 text-sm">
                {{ formatNumber(prop.recordedSalesValue) }} SAR
              </span>
            </div>
            <div class="p-2 bg-slate-50 rounded-xl">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Total Area</span>
              <span class="font-extrabold text-slate-800 text-sm">
                {{ formatNumber(prop.totalArea) }} m²
              </span>
            </div>
          </div>
        </div>

        <!-- Footer Action -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <NuxtLink
            :to="localePath(`/properties/${prop.normalizedPropertyId}`)"
            class="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <i class="pi pi-eye text-xs"></i>
            <span>{{ $t('properties.overview') }} & {{ $t('common.details') }}</span>
          </NuxtLink>
          <NuxtLink
            :to="localePath(`/units?property=${prop.normalizedPropertyId}`)"
            class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs text-center transition-colors"
            title="View Units"
          >
            <i class="pi pi-list text-xs"></i>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
            <tr>
              <th class="p-3 w-8">
                <input
                  type="checkbox"
                  @change="toggleSelectAll"
                  :checked="selectedProperties.length === properties.length && properties.length > 0"
                  class="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
              </th>
              <th class="p-3">Property ID</th>
              <th class="p-3">Original ID</th>
              <th class="p-3 text-right">Total Units</th>
              <th class="p-3 text-right">Unique IDs</th>
              <th class="p-3 text-right">Sold</th>
              <th class="p-3 text-right">Available</th>
              <th class="p-3 text-right">Sales %</th>
              <th class="p-3 text-right">Sales Value (SAR)</th>
              <th class="p-3 text-right">Total Area (m²)</th>
              <th class="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <tr v-for="prop in properties" :key="prop.normalizedPropertyId" class="hover:bg-slate-50/80 transition-colors">
              <td class="p-3">
                <input
                  type="checkbox"
                  :value="prop.normalizedPropertyId"
                  v-model="selectedProperties"
                  class="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
              </td>
              <td class="p-3 font-bold text-slate-900">
                <NuxtLink :to="localePath(`/properties/${prop.normalizedPropertyId}`)" class="hover:text-emerald-600">
                  {{ prop.normalizedPropertyId }}
                </NuxtLink>
              </td>
              <td class="p-3 text-slate-500 font-mono">{{ prop.originalPropertyId }}</td>
              <td class="p-3 text-right font-bold">{{ prop.totalUnits }}</td>
              <td class="p-3 text-right text-slate-500">{{ prop.uniqueUnits }}</td>
              <td class="p-3 text-right text-emerald-600 font-bold">{{ prop.soldUnits }}</td>
              <td class="p-3 text-right text-amber-600 font-bold">{{ prop.availableUnits }}</td>
              <td class="p-3 text-right">
                <span class="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800">
                  {{ prop.salesPercentage }}%
                </span>
              </td>
              <td class="p-3 text-right font-bold text-slate-900">{{ prop.recordedSalesValue.toLocaleString() }}</td>
              <td class="p-3 text-right">{{ prop.totalArea.toLocaleString() }}</td>
              <td class="p-3 text-center">
                <NuxtLink
                  :to="localePath(`/properties/${prop.normalizedPropertyId}`)"
                  class="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold"
                >
                  <i class="pi pi-eye text-xs"></i>
                  <span>{{ $t('common.details') }}</span>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Comparison Modal -->
    <div
      v-if="showCompareModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 my-auto">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <i class="pi pi-sliders-h"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Property Side-by-Side Comparison</h3>
              <p class="text-xs text-slate-400">Comparing {{ comparedList.length }} selected properties</p>
            </div>
          </div>
          <button
            @click="showCompareModal = false"
            class="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border border-slate-200">
            <thead class="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th class="p-3 border-e border-slate-200">Metric</th>
                <th v-for="c in comparedList" :key="c.normalizedPropertyId" class="p-3 text-right border-e border-slate-200 font-black text-slate-900">
                  {{ c.normalizedPropertyId }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="p-3 font-bold text-slate-700 bg-slate-50/50 border-e border-slate-200">Total Unit Records</td>
                <td v-for="c in comparedList" :key="c.normalizedPropertyId" class="p-3 text-right border-e border-slate-200 font-bold">
                  {{ c.totalUnits }}
                </td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-slate-700 bg-slate-50/50 border-e border-slate-200">Unique Unit IDs</td>
                <td v-for="c in comparedList" :key="c.normalizedPropertyId" class="p-3 text-right border-e border-slate-200">
                  {{ c.uniqueUnits }}
                </td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-slate-700 bg-slate-50/50 border-e border-slate-200">Sold Units</td>
                <td v-for="c in comparedList" :key="c.normalizedPropertyId" class="p-3 text-right text-emerald-600 font-bold border-e border-slate-200">
                  {{ c.soldUnits }}
                </td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-slate-700 bg-slate-50/50 border-e border-slate-200">Available Units</td>
                <td v-for="c in comparedList" :key="c.normalizedPropertyId" class="p-3 text-right text-amber-600 font-bold border-e border-slate-200">
                  {{ c.availableUnits }}
                </td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-slate-700 bg-slate-50/50 border-e border-slate-200">Sales Rate</td>
                <td v-for="c in comparedList" :key="c.normalizedPropertyId" class="p-3 text-right font-black border-e border-slate-200">
                  {{ c.salesPercentage }}%
                </td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-slate-700 bg-slate-50/50 border-e border-slate-200">Total Recorded Sales</td>
                <td v-for="c in comparedList" :key="c.normalizedPropertyId" class="p-3 text-right text-emerald-700 font-black border-e border-slate-200">
                  {{ c.recordedSalesValue.toLocaleString() }} SAR
                </td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-slate-700 bg-slate-50/50 border-e border-slate-200">Total Area</td>
                <td v-for="c in comparedList" :key="c.normalizedPropertyId" class="p-3 text-right border-e border-slate-200">
                  {{ c.totalArea.toLocaleString() }} m²
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="showCompareModal = false"
            class="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath();

const loading = ref(true);
const properties = ref([]);
const viewMode = ref('grid');
const selectedProperties = ref([]);
const showCompareModal = ref(false);

async function loadProperties() {
  loading.value = true;
  try {
    properties.value = await $fetch('/api/properties');
  } catch (err) {
    console.error('Failed to load properties', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadProperties();
});

const comparedList = computed(() => {
  return properties.value.filter(p => selectedProperties.value.includes(p.normalizedPropertyId));
});

function toggleSelectAll(e) {
  if (e.target.checked) {
    selectedProperties.value = properties.value.map(p => p.normalizedPropertyId);
  } else {
    selectedProperties.value = [];
  }
}

function formatNumber(val) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return val?.toLocaleString() || '0';
}
</script>

