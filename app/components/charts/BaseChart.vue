<template>
  <div class="relative w-full" :style="{ height: `${height}px`, minHeight: `${height}px` }">
    <div
      ref="chartRef"
      class="w-full h-full"
      :style="{ height: `${height}px`, width: '100%' }"
    ></div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-emerald-600"></i>
    </div>

    <!-- Empty State Fallback -->
    <div
      v-if="!loading && isEmpty"
      class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50/50 rounded-xl"
    >
      <i class="pi pi-chart-bar text-2xl mb-1 text-slate-300"></i>
      <span>{{ $t('common.no_data') }}</span>
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
  if (series.length === 0) return true;
  return series.every(s => !s.data || s.data.length === 0);
});

function initChart() {
  if (typeof window === 'undefined' || !chartRef.value) return;

  const currentWidth = chartRef.value.clientWidth;
  if (currentWidth <= 0) {
    window.requestAnimationFrame(() => {
      if (chartRef.value && chartRef.value.clientWidth > 0) {
        initChart();
      }
    });
    return;
  }

  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }

  chartInstance = echarts.init(chartRef.value, null, {
    renderer: 'canvas'
  });

  if (props.options && Object.keys(props.options).length > 0) {
    chartInstance.setOption(props.options, true);
  }

  chartInstance.on('click', (params) => {
    emit('chartClick', params);
  });
}

function handleResize() {
  if (chartInstance && chartRef.value && chartRef.value.clientWidth > 0) {
    chartInstance.resize();
  }
}

watch(
  chartRef,
  (el) => {
    if (!el || typeof window === 'undefined') return;

    if (!resizeObserver && window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            if (!chartInstance) {
              initChart();
            } else {
              handleResize();
            }
          }
        }
      });
      resizeObserver.observe(el);
    }

    nextTick(() => {
      initChart();
    });
  },
  { immediate: true }
);

watch(
  () => props.options,
  (newOpt) => {
    nextTick(() => {
      if (!chartInstance && chartRef.value && chartRef.value.clientWidth > 0) {
        initChart();
      } else if (chartInstance && newOpt && Object.keys(newOpt).length > 0) {
        chartInstance.setOption(newOpt, true);
        handleResize();
      }
    });
  },
  { deep: true, immediate: true }
);

watch(
  () => props.height,
  () => {
    nextTick(() => {
      handleResize();
    });
  }
);

onMounted(() => {
  nextTick(() => {
    initChart();
    setTimeout(() => {
      if (!chartInstance && chartRef.value?.clientWidth > 0) {
        initChart();
      } else if (chartInstance) {
        handleResize();
      }
    }, 100);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
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
