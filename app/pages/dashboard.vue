<template>
  <div class="space-y-6">
    <!-- Page Header & Refresh -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('dashboard.title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('dashboard.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="fetchData"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <i :class="['pi pi-sync text-xs', loading ? 'pi-spin' : '']"></i>
          <span>{{ $t('common.refresh') }}</span>
        </button>
        <NuxtLink
          :to="localePath('/reports')"
          class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
        >
          <i class="pi pi-download text-xs"></i>
          <span>{{ $t('reports.title') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Global Filter Bar -->
    <GlobalFilterBar
      :options="filterOptions"
      v-model="filters"
      @change="handleFilterChange"
    />

    <!-- 14 Executive KPIs -->
    <KPICards :kpis="kpis" />

    <!-- Interactive Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Chart 1: Sold vs Available Inventory -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <h3 class="text-sm font-bold text-slate-800">{{ $t('dashboard.charts.sold_vs_available') }}</h3>
          </div>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Inventory Status</span>
        </div>
        <div class="flex-1">
          <BaseChart
            :options="soldVsAvailableChartOptions"
            :loading="loading"
            :height="320"
            @chartClick="handleStatusChartClick"
          />
        </div>
      </div>

      <!-- Chart 2: Sales Value by Property -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
            <h3 class="text-sm font-bold text-slate-800">{{ $t('dashboard.charts.sales_by_property') }}</h3>
          </div>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">{{ filters.currency || 'SAR' }}</span>
        </div>
        <div class="flex-1">
          <BaseChart
            :options="salesByPropertyChartOptions"
            :loading="loading"
            :height="320"
            @chartClick="handlePropertyChartClick"
          />
        </div>
      </div>

      <!-- Chart 3: Unit Count Distribution by Property -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            <h3 class="text-sm font-bold text-slate-800">{{ $t('dashboard.charts.units_by_property') }}</h3>
          </div>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Total & Sold</span>
        </div>
        <div class="flex-1">
          <BaseChart
            :options="unitsByPropertyChartOptions"
            :loading="loading"
            :height="320"
            @chartClick="handlePropertyChartClick"
          />
        </div>
      </div>

      <!-- Chart 4: Unit Distribution by Block (Top Blocks) -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <h3 class="text-sm font-bold text-slate-800">{{ $t('dashboard.charts.units_by_block') }}</h3>
          </div>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Top Blocks</span>
        </div>
        <div class="flex-1">
          <BaseChart
            :options="unitsByBlockChartOptions"
            :loading="loading"
            :height="320"
            @chartClick="handleBlockChartClick"
          />
        </div>
      </div>

      <!-- Chart 5: Area Distribution Bins -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
            <h3 class="text-sm font-bold text-slate-800">{{ $t('dashboard.charts.area_distribution') }}</h3>
          </div>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Square Meters</span>
        </div>
        <div class="flex-1">
          <BaseChart
            :options="areaDistributionChartOptions"
            :loading="loading"
            :height="320"
          />
        </div>
      </div>

      <!-- Chart 6: Property Financial Comparison -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
            <h3 class="text-sm font-bold text-slate-800">{{ $t('dashboard.charts.financial_comparison') }}</h3>
          </div>
          <span class="text-[10px] text-slate-400 font-semibold uppercase">Sales vs Area</span>
        </div>
        <div class="flex-1">
          <BaseChart
            :options="financialComparisonChartOptions"
            :loading="loading"
            :height="320"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseChart from '~/components/charts/BaseChart.vue';
import GlobalFilterBar from '~/components/filters/GlobalFilterBar.vue';
import KPICards from '~/components/dashboard/KPICards.vue';

const router = useRouter();
const localePath = useLocalePath();

const loading = ref(true);
const kpis = ref({});
const charts = ref({});
const filterOptions = ref({});

const filters = reactive({
  property: '',
  block: '',
  floor: '',
  unitType: '',
  salesStatus: '',
  revenueType: '',
  currency: 'SAR'
});

async function fetchData() {
  loading.value = true;
  try {
    const res = await $fetch('/api/dashboard/overview', {
      query: { ...filters }
    });
    kpis.value = res.kpis || {};
    charts.value = res.charts || {};
    filterOptions.value = res.filterOptions || {};
  } catch (err) {
    console.error('Failed to load dashboard overview', err);
  } finally {
    loading.value = false;
  }
}

function handleFilterChange() {
  fetchData();
}

onMounted(() => {
  fetchData();
});

// Chart 1: Sold vs Available Doughnut
const soldVsAvailableChartOptions = computed(() => {
  const statusData = charts.value?.salesStatus || [];
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} units ({d}%)' },
    legend: { bottom: '0', textStyle: { color: '#64748B', fontSize: 11 } },
    color: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
    series: [
      {
        name: 'Sales Status',
        type: 'pie',
        radius: ['45%', '72%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, fontWeight: 'bold' },
        emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
        data: statusData.map(s => ({ name: s.status, value: s.count }))
      }
    ]
  };
});

// Chart 2: Sales Value by Property
const salesByPropertyChartOptions = computed(() => {
  const propData = charts.value?.byProperty || [];
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = params[0];
        return `<b>${item.name}</b><br/>Recorded Sales: <b>${(item.value || 0).toLocaleString()} SAR</b>`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: propData.map(p => p.propertyId),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 25 },
      axisLine: { lineStyle: { color: '#CBD5E1' } }
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
        name: 'Recorded Sales',
        type: 'bar',
        barWidth: '45%',
        itemStyle: {
          color: '#0284C7',
          borderRadius: [6, 6, 0, 0]
        },
        data: propData.map(p => p.totalSaleAmount)
      }
    ]
  };
});

// Chart 3: Units by Property (Total vs Sold)
const unitsByPropertyChartOptions = computed(() => {
  const propData = charts.value?.byProperty || [];
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: '0', textStyle: { color: '#64748B', fontSize: 11 } },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: propData.map(p => p.propertyId),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 25 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'Total Units',
        type: 'bar',
        itemStyle: { color: '#94A3B8', borderRadius: [4, 4, 0, 0] },
        data: propData.map(p => p.unitCount)
      },
      {
        name: 'Sold Units',
        type: 'bar',
        itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
        data: propData.map(p => p.soldCount)
      }
    ]
  };
});

// Chart 4: Units by Block (Top Blocks)
const unitsByBlockChartOptions = computed(() => {
  const blockData = charts.value?.byBlock || [];
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: blockData.map(b => `Block ${b.blockId}`),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'Units',
        type: 'bar',
        itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] },
        data: blockData.map(b => b.unitCount)
      }
    ]
  };
});

// Chart 5: Area Distribution Bins
const areaDistributionChartOptions = computed(() => {
  const areaData = charts.value?.areaDistribution || [];
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: areaData.map(a => a.bin),
      axisLabel: { color: '#64748B', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'Unit Count',
        type: 'bar',
        barWidth: '40%',
        itemStyle: { color: '#8B5CF6', borderRadius: [6, 6, 0, 0] },
        data: areaData.map(a => a.count)
      }
    ]
  };
});

// Chart 6: Property Financial Comparison
const financialComparisonChartOptions = computed(() => {
  const compData = charts.value?.financialComparison || [];
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: '0', textStyle: { color: '#64748B', fontSize: 11 } },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: compData.map(c => c.propertyId),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 25 }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Sales (M SAR)',
        axisLabel: { formatter: (val) => (val / 1000000).toFixed(0) + 'M' },
        splitLine: { lineStyle: { color: '#F1F5F9' } }
      },
      {
        type: 'value',
        name: 'Area (m²)',
        axisLabel: { formatter: (val) => (val / 1000).toFixed(0) + 'k' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Sale Amount',
        type: 'bar',
        itemStyle: { color: '#059669', borderRadius: [4, 4, 0, 0] },
        data: compData.map(c => c.saleAmount)
      },
      {
        name: 'Total Area',
        type: 'line',
        yAxisIndex: 1,
        itemStyle: { color: '#0284C7' },
        data: compData.map(c => c.totalArea)
      }
    ]
  };
});

// Click handlers to navigate to filtered units
function handlePropertyChartClick(params) {
  if (params.name) {
    router.push({ path: localePath('/units'), query: { property: params.name } });
  }
}

function handleStatusChartClick(params) {
  if (params.name) {
    router.push({ path: localePath('/units'), query: { salesStatus: params.name } });
  }
}

function handleBlockChartClick(params) {
  const block = params.name.replace('Block ', '');
  if (block) {
    router.push({ path: localePath('/units'), query: { block } });
  }
}
</script>

