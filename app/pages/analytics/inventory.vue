<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('analytics.inventory_title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('analytics.inventory_subtitle') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          :to="localePath('/reports')"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
        >
          <i class="pi pi-file-excel text-xs"></i>
          <span>{{ $t('analytics.export_inventory') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="h-96 bg-slate-200/60 animate-pulse rounded-2xl"></div>

    <div v-else-if="data" class="space-y-6">
      <!-- 5 Inventory Distinct Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('dashboard.kpis.total_records') }}</span>
          <span class="text-xl font-black text-slate-900 mt-1 block">{{ data.counts.totalUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.commercial_sold') }}</span>
          <span class="text-xl font-black text-emerald-600 mt-1 block">{{ data.counts.soldUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.commercial_available') }}</span>
          <span class="text-xl font-black text-amber-600 mt-1 block">{{ data.counts.availableUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-blue-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.physically_occupied') }}</span>
          <span class="text-xl font-black text-blue-600 mt-1 block">{{ data.counts.occupiedUnits }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-teal-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.physically_vacant') }}</span>
          <span class="text-xl font-black text-teal-600 mt-1 block">{{ data.counts.vacantUnits }}</span>
        </div>
      </div>

      <!-- Inventory Distribution Chart -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
        <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span class="flex items-center gap-2">
            <i class="pi pi-chart-bar text-emerald-600"></i>
            <span>{{ $t('dashboard.charts.units_by_property') }}</span>
          </span>
          <span class="text-[10px] text-slate-400 font-bold uppercase">{{ $t('analytics.commercial_status') }}</span>
        </h3>
        <div class="flex-1">
          <BaseChart :options="inventoryChartOptions" :loading="loading" :height="320" />
        </div>
      </div>

      <!-- Inventory by Property -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          {{ $t('analytics.inventory_breakdown') }}
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3">{{ $t('analytics.property_id') }}</th>
                <th class="p-3 text-right">{{ $t('analytics.units_count') }}</th>
                <th class="p-3 text-right">{{ $t('dashboard.kpis.sold_units') }}</th>
                <th class="p-3 text-right">{{ $t('dashboard.kpis.available_units') }}</th>
                <th class="p-3 text-right">{{ $t('analytics.absorption_rate') }}</th>
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
            <span>{{ $t('analytics.conflicting_title') }}</span>
          </h4>
        </div>
        <div v-if="data.conflicting.length === 0" class="p-6 text-center text-xs text-slate-500">
          <i class="pi pi-check-circle text-emerald-600 text-lg block mb-1"></i>
          <span>{{ $t('analytics.no_conflicting') }}</span>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-amber-50 text-amber-800 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-2">{{ $t('analytics.unit_id') }}</th>
                <th class="p-2">{{ $t('analytics.property') }}</th>
                <th class="p-2">{{ $t('units.occupied') }}</th>
                <th class="p-2">{{ $t('units.vacant') }}</th>
                <th class="p-2">{{ $t('units.sales_status') }}</th>
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
import BaseChart from '~/components/charts/BaseChart.vue';

const localePath = useLocalePath();
const { t } = useI18n();

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

const inventoryChartOptions = computed(() => {
  const pList = data.value?.byProperty || [];
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: '0', textStyle: { color: '#64748B', fontSize: 11 } },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: pList.map(p => p.propertyId),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 20 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: t('dashboard.kpis.sold_units'),
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#10B981', borderRadius: [0, 0, 0, 0] },
        data: pList.map(p => p.sold)
      },
      {
        name: t('dashboard.kpis.available_units'),
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] },
        data: pList.map(p => p.available)
      }
    ]
  };
});
</script>
