<template>
  <div class="relative w-full" :style="{ height: `${height}px`, minHeight: `${height}px` }">
    <div
      ref="chartRef"
      class="w-full"
      :style="{ height: `${height}px`, width: '100%' }"
    ></div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-emerald-600"></i>
    </div>

    <!-- Empty State Fallback -->
    <div
      v-if="!loading && isEmpty"
      class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50/50 rounded-xl"
    >
      <i class="pi pi-chart-bar text-2xl mb-1 text-slate-300"></i>
      <span>No data available for this chart</span>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';

const props = defineProps({
  options: {
    type: Object,
    required: true,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  height: {
    type: [Number, String],
    default: 320
  }
});

const emit = defineEmits(['chartClick']);

const chartRef = ref(null);
let chartInstance = null;
let resizeObserver = null;

const isEmpty = computed(() => {
  if (!props.options || !props.options.series) return true;
  const series = Array.isArray(props.options.series) ? props.options.series : [props.options.series];
  return series.every(s => !s.data || s.data.length === 0);
});

function initChart() {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }

  // Ensure DOM element has width and height
  const width = chartRef.value.clientWidth || chartRef.value.parentElement?.clientWidth || 300;
  const height = Number(props.height) || 320;

  chartInstance = echarts.init(chartRef.value, null, {
    width,
    height,
    renderer: 'canvas'
  });

  if (props.options && Object.keys(props.options).length > 0) {
    chartInstance.setOption(props.options, true);
  }

  chartInstance.on('click', (params) => {
    emit('chartClick', params);
  });

  if (window.ResizeObserver && !resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (chartInstance && chartRef.value) {
        chartInstance.resize({
          width: chartRef.value.clientWidth,
          height: Number(props.height) || 320
        });
      }
    });
    resizeObserver.observe(chartRef.value);
  }
}

watch(
  () => props.options,
  (newOpt) => {
    nextTick(() => {
      if (!chartInstance && chartRef.value) {
        initChart();
      } else if (chartInstance && newOpt) {
        chartInstance.setOption(newOpt, true);
        chartInstance.resize();
      }
    });
  },
  { deep: true }
);

watch(
  () => props.height,
  (newH) => {
    if (chartInstance && chartRef.value) {
      chartInstance.resize({
        width: chartRef.value.clientWidth,
        height: Number(newH) || 320
      });
    }
  }
);

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      initChart();
    }, 50);
  });
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>
