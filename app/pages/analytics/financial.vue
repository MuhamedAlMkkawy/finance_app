<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('analytics.financial_title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('analytics.financial_subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          :to="localePath('/reports')"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
        >
          <i class="pi pi-file-excel text-xs"></i>
          <span>{{ $t('analytics.export_financial') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="h-96 bg-slate-200/60 animate-pulse rounded-2xl"></div>

    <div v-else-if="data" class="space-y-6">
      <!-- Financial Overview Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.total_sales_value') }}</span>
          <span class="text-xl font-black text-emerald-700 mt-1 block">
            {{ (data.totals.totalSale || 0).toLocaleString() }} SAR
          </span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.total_sales_tax') }}</span>
          <span class="text-xl font-black text-slate-800 mt-1 block">
            {{ (data.totals.totalTax || 0).toLocaleString() }} SAR
          </span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.total_overall_value') }}</span>
          <span class="text-xl font-black text-slate-900 mt-1 block">
            {{ (data.totals.totalOverall || 0).toLocaleString() }} SAR
          </span>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">{{ $t('analytics.avg_unit_price') }}</span>
          <span class="text-xl font-black text-sky-700 mt-1 block">
            {{ (data.totals.avgSale || 0).toLocaleString() }} SAR
          </span>
        </div>
      </div>

      <!-- Financial Comparison Chart -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
        <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span class="flex items-center gap-2">
            <i class="pi pi-chart-bar text-emerald-600"></i>
            <span>{{ $t('dashboard.charts.sales_by_property') }}</span>
          </span>
          <span class="text-[10px] text-slate-400 font-bold uppercase">SAR</span>
        </h3>
        <div class="flex-1">
          <BaseChart :options="rankingChartOptions" :loading="loading" :height="320" />
        </div>
      </div>

      <!-- Property Financial Ranking Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span class="flex items-center gap-2">
            <i class="pi pi-sort-amount-down text-emerald-600"></i>
            <span>{{ $t('analytics.ranking') }}</span>
          </span>
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3">{{ $t('analytics.rank') }}</th>
                <th class="p-3">{{ $t('analytics.property_id') }}</th>
                <th class="p-3 text-right">{{ $t('analytics.units_count') }}</th>
                <th class="p-3 text-right">{{ $t('analytics.total_sale_sar') }}</th>
                <th class="p-3 text-right">{{ $t('analytics.total_tax_sar') }}</th>
                <th class="p-3 text-right">{{ $t('analytics.total_combined_sar') }}</th>
                <th class="p-3 text-right">{{ $t('analytics.percent_portfolio') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr v-for="(p, idx) in data.propertyRanking" :key="p.propertyId" class="hover:bg-slate-50">
                <td class="p-3 font-mono font-bold text-slate-400">#{{ idx + 1 }}</td>
                <td class="p-3 font-bold text-slate-900">
                  <NuxtLink :to="localePath(`/properties/${p.propertyId}`)" class="hover:text-emerald-600">
                    {{ p.propertyId }}
                  </NuxtLink>
                </td>
                <td class="p-3 text-right font-bold">{{ p.unitCount }}</td>
                <td class="p-3 text-right font-bold text-emerald-700">{{ p.totalSale.toLocaleString() }}</td>
                <td class="p-3 text-right text-slate-600">{{ p.totalTax.toLocaleString() }}</td>
                <td class="p-3 text-right font-black text-slate-900">{{ p.totalOverall.toLocaleString() }}</td>
                <td class="p-3 text-right">
                  <span class="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800">
                    {{ data.totals.totalSale > 0 ? ((p.totalSale / data.totals.totalSale) * 100).toFixed(1) : '0' }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Currency & Revenue Breakdowns -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">{{ $t('analytics.currency_distribution') }}</h4>
          <div class="space-y-2">
            <div
              v-for="c in data.currencyBreakdown"
              :key="c.currency"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <div>
                <span class="font-bold text-slate-800">{{ c.currency }}</span>
                <span class="text-[10px] text-slate-400 block">{{ c.count }} {{ $t('analytics.units_registered') }}</span>
              </div>
              <span class="font-black text-emerald-700 text-sm">{{ c.totalSale.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">{{ $t('analytics.revenue_breakdown') }}</h4>
          <div class="space-y-2">
            <div
              v-for="r in data.revenueBreakdown"
              :key="r.revenueType"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <div>
                <span class="font-bold text-slate-800">{{ r.revenueType }}</span>
                <span class="text-[10px] text-slate-400 block">{{ r.count }} {{ $t('analytics.units_registered') }}</span>
              </div>
              <span class="font-black text-slate-900 text-sm">{{ r.totalSale.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Anomalies Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h4 class="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ $t('analytics.anomalies') }}</span>
          </h4>
          <span class="text-[10px] text-slate-400">{{ $t('analytics.anomalies_subtitle') }}</span>
        </div>
        <div v-if="data.anomalies.length === 0" class="p-6 text-center text-xs text-slate-400">
          {{ $t('analytics.no_anomalies') }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-rose-50 text-rose-800 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-2">{{ $t('analytics.unit_id') }}</th>
                <th class="p-2">{{ $t('analytics.property') }}</th>
                <th class="p-2">{{ $t('analytics.status') }}</th>
                <th class="p-2 text-right">{{ $t('analytics.sale_amount') }}</th>
                <th class="p-2">{{ $t('analytics.issue_detected') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr v-for="a in data.anomalies" :key="a.id" class="hover:bg-slate-50">
                <td class="p-2 font-bold text-slate-900">
                  <NuxtLink :to="localePath(`/units/${a.id}`)" class="hover:text-emerald-600">
                    {{ a.unitId }}
                  </NuxtLink>
                </td>
                <td class="p-2">{{ a.propertyId }}</td>
                <td class="p-2 font-bold text-rose-600">{{ a.salesUnitStatus }}</td>
                <td class="p-2 text-right font-mono">{{ a.saleAmount ?? 'NULL' }}</td>
                <td class="p-2 text-rose-600 font-semibold">{{ $t('analytics.anomaly_desc') }}</td>
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

async function loadFinancial() {
  loading.value = true;
  try {
    data.value = await $fetch('/api/analytics/financial');
  } catch (err) {
    console.error('Failed to load financial analytics', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadFinancial();
});

const rankingChartOptions = computed(() => {
  const ranking = data.value?.propertyRanking || [];
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = params[0];
        const val = (item.value || 0).toLocaleString();
        return `<b>${item.name}</b><br/>${t('analytics.recorded_sales')}: <b>${val} SAR</b>`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ranking.map(r => r.propertyId),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 20 }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        formatter: (val) => val >= 1000000 ? (val / 1000000).toFixed(0) + 'M' : val
      },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: t('analytics.total_sale_amount'),
        type: 'bar',
        barWidth: '40%',
        itemStyle: { color: '#059669', borderRadius: [6, 6, 0, 0] },
        data: ranking.map(r => r.totalSale)
      }
    ]
  };
});
</script>
