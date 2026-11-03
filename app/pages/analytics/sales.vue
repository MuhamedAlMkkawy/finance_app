<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('analytics.sales_title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('analytics.sales_subtitle') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          :to="localePath('/reports')"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
        >
          <i class="pi pi-file-excel text-xs"></i>
          <span>{{ $t('analytics.export_sales') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="h-96 bg-slate-200/60 animate-pulse rounded-2xl"></div>

    <div v-else-if="data" class="space-y-6">
      <!-- High Level Sales KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.total_sales_value') }}</span>
          <span class="text-lg font-black text-emerald-700 mt-1 block">
            {{ formatCompact(data.totals.totalSaleValue) }} SAR
          </span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('dashboard.kpis.sold_units') }}</span>
          <span class="text-lg font-black text-slate-900 mt-1 block">{{ data.totals.soldUnitsCount }}</span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('dashboard.kpis.avg_sale_amount') }}</span>
          <span class="text-lg font-black text-sky-700 mt-1 block">
            {{ formatCompact(data.totals.avgSaleAmount) }} SAR
          </span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('dashboard.kpis.avg_price_sqm') }}</span>
          <span class="text-lg font-black text-teal-700 mt-1 block">
            {{ data.totals.avgPricePerSqm.toLocaleString() }} SAR/m²
          </span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('dashboard.kpis.total_sales_tax') }}</span>
          <span class="text-lg font-black text-slate-700 mt-1 block">
            {{ formatCompact(data.totals.totalSaleTax) }} SAR
          </span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.zero_sale_units') }}</span>
          <span class="text-lg font-black text-amber-600 mt-1 block">{{ data.totals.zeroSaleCount }}</span>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales by Property Chart -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 class="text-sm font-bold text-slate-900">
              {{ $t('dashboard.charts.sales_by_property') }}
            </h3>
            <span class="text-[10px] text-slate-400 font-bold uppercase">SAR</span>
          </div>
          <div class="flex-1">
            <BaseChart :options="byPropertyChartOptions" :loading="loading" :height="320" />
          </div>
        </div>

        <!-- Sales by Block Chart -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 class="text-sm font-bold text-slate-900">
              {{ $t('dashboard.charts.units_by_block') }}
            </h3>
            <span class="text-[10px] text-slate-400 font-bold uppercase">SAR</span>
          </div>
          <div class="flex-1">
            <BaseChart :options="byBlockChartOptions" :loading="loading" :height="320" />
          </div>
        </div>
      </div>

      <!-- Top 10 Highest vs Lowest Units Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top 10 Highest -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-emerald-700">
              <i class="pi pi-arrow-up-right"></i>
              <span>{{ $t('analytics.top_units') }}</span>
            </span>
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th class="p-2">{{ $t('analytics.unit_id') }}</th>
                  <th class="p-2">{{ $t('analytics.property') }}</th>
                  <th class="p-2">{{ $t('units.area') }}</th>
                  <th class="p-2 text-right">{{ $t('units.sale_amount') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr v-for="u in data.topUnits" :key="u.id" class="hover:bg-slate-50">
                  <td class="p-2 font-bold text-slate-900">
                    <NuxtLink :to="localePath(`/units/${u.id}`)" class="hover:text-emerald-600">
                      {{ u.unitId }}
                    </NuxtLink>
                  </td>
                  <td class="p-2 text-slate-600">{{ u.propertyId }}</td>
                  <td class="p-2">{{ u.unitArea?.toLocaleString() }}</td>
                  <td class="p-2 text-right font-black text-emerald-700">
                    {{ u.saleAmount?.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bottom 10 Lowest -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-amber-700">
              <i class="pi pi-arrow-down-right"></i>
              <span>{{ $t('analytics.lowest_units') }}</span>
            </span>
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th class="p-2">{{ $t('analytics.unit_id') }}</th>
                  <th class="p-2">{{ $t('analytics.property') }}</th>
                  <th class="p-2">{{ $t('units.area') }}</th>
                  <th class="p-2 text-right">{{ $t('units.sale_amount') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr v-for="u in data.lowestUnits" :key="u.id" class="hover:bg-slate-50">
                  <td class="p-2 font-bold text-slate-900">
                    <NuxtLink :to="localePath(`/units/${u.id}`)" class="hover:text-amber-600">
                      {{ u.unitId }}
                    </NuxtLink>
                  </td>
                  <td class="p-2 text-slate-600">{{ u.propertyId }}</td>
                  <td class="p-2">{{ u.unitArea?.toLocaleString() }}</td>
                  <td class="p-2 text-right font-black text-slate-800">
                    {{ u.saleAmount?.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

async function loadSales() {
  loading.value = true;
  try {
    data.value = await $fetch('/api/analytics/sales');
  } catch (err) {
    console.error('Failed to load sales analytics', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadSales();
});

const byPropertyChartOptions = computed(() => {
  const pList = data.value?.byProperty || [];
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: pList.map(p => p.propertyId),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 25 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (val) => (val / 1000000).toFixed(0) + 'M' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: t('analytics.total_sale_amount'),
        type: 'bar',
        barWidth: '45%',
        itemStyle: { color: '#059669', borderRadius: [6, 6, 0, 0] },
        data: pList.map(p => p.totalAmount)
      }
    ]
  };
});

const byBlockChartOptions = computed(() => {
  const bList = data.value?.byBlock || [];
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: bList.map(b => `Block ${b.blockId}`),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (val) => (val / 1000000).toFixed(0) + 'M' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: t('analytics.total_sale_amount'),
        type: 'bar',
        barWidth: '45%',
        itemStyle: { color: '#0284C7', borderRadius: [6, 6, 0, 0] },
        data: bList.map(b => b.totalAmount)
      }
    ]
  };
});

function formatCompact(val) {
  if (val >= 1000000000) return (val / 1000000000).toFixed(2) + ' B';
  if (val >= 1000000) return (val / 1000000).toFixed(2) + ' M';
  if (val >= 1000) return (val / 1000).toFixed(1) + ' K';
  return val?.toLocaleString() || '0';
}
</script>
