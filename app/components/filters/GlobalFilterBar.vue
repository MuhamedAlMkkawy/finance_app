<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6">
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
          <i class="pi pi-filter"></i>
        </div>
        <span class="text-xs font-bold text-slate-800 tracking-wide uppercase">{{ $t('common.filter') }}</span>
        <span
          v-if="activeFilterCount > 0"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"
        >
          {{ activeFilterCount }} {{ $t('common.active_filters') }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="activeFilterCount > 0"
          @click="resetFilters"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
        >
          <i class="pi pi-times-circle text-xs"></i>
          <span>{{ $t('common.clear_all') }}</span>
        </button>
      </div>
    </div>

    <!-- Filter Inputs Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-3">
      <!-- Property -->
      <div class="space-y-1">
        <label class="block text-[11px] font-bold text-slate-500 uppercase">{{ $t('properties.property_id') }}</label>
        <select
          v-model="model.property"
          @change="emitChange"
          class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">{{ $t('common.all') }}</option>
          <option v-for="p in options.properties" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
      </div>

      <!-- Block -->
      <div class="space-y-1">
        <label class="block text-[11px] font-bold text-slate-500 uppercase">{{ $t('units.block') }}</label>
        <select
          v-model="model.block"
          @change="emitChange"
          class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">{{ $t('common.all') }}</option>
          <option v-for="b in options.blocks" :key="b" :value="b">
            Block {{ b }}
          </option>
        </select>
      </div>

      <!-- Floor -->
      <div class="space-y-1">
        <label class="block text-[11px] font-bold text-slate-500 uppercase">{{ $t('units.floor') }}</label>
        <select
          v-model="model.floor"
          @change="emitChange"
          class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">{{ $t('common.all') }}</option>
          <option v-for="f in options.floors" :key="f" :value="f">
            {{ f }}
          </option>
        </select>
      </div>

      <!-- Unit Type -->
      <div class="space-y-1">
        <label class="block text-[11px] font-bold text-slate-500 uppercase">{{ $t('units.type') }}</label>
        <select
          v-model="model.unitType"
          @change="emitChange"
          class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">{{ $t('common.all') }}</option>
          <option v-for="t in options.unitTypes" :key="t" :value="t">
            {{ t }}
          </option>
        </select>
      </div>

      <!-- Sales Status -->
      <div class="space-y-1">
        <label class="block text-[11px] font-bold text-slate-500 uppercase">{{ $t('units.sales_status') }}</label>
        <select
          v-model="model.salesStatus"
          @change="emitChange"
          class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">{{ $t('common.all') }}</option>
          <option v-for="s in options.salesStatuses" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <!-- Revenue Type -->
      <div class="space-y-1">
        <label class="block text-[11px] font-bold text-slate-500 uppercase">Revenue</label>
        <select
          v-model="model.revenueType"
          @change="emitChange"
          class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">{{ $t('common.all') }}</option>
          <option v-for="r in options.revenueTypes" :key="r" :value="r">
            {{ r }}
          </option>
        </select>
      </div>

      <!-- Currency -->
      <div class="space-y-1">
        <label class="block text-[11px] font-bold text-slate-500 uppercase">Currency</label>
        <select
          v-model="model.currency"
          @change="emitChange"
          class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
        >
          <option value="SAR">SAR (Saudi Riyal)</option>
          <option value="AED">AED (Emirati Dirham)</option>
          <option value="USD">USD (US Dollar)</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: {
    type: Object,
    default: () => ({
      properties: [],
      blocks: [],
      floors: [],
      unitTypes: [],
      salesStatuses: [],
      revenueTypes: [],
      currencies: ['SAR', 'AED', 'USD']
    })
  },
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const model = reactive({
  property: props.modelValue.property || '',
  block: props.modelValue.block || '',
  floor: props.modelValue.floor || '',
  unitType: props.modelValue.unitType || '',
  salesStatus: props.modelValue.salesStatus || '',
  revenueType: props.modelValue.revenueType || '',
  currency: props.modelValue.currency || 'SAR'
});

watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(model, newVal);
  },
  { deep: true }
);

const activeFilterCount = computed(() => {
  let count = 0;
  if (model.property) count++;
  if (model.block) count++;
  if (model.floor) count++;
  if (model.unitType) count++;
  if (model.salesStatus) count++;
  if (model.revenueType) count++;
  return count;
});

function emitChange() {
  emit('update:modelValue', { ...model });
  emit('change', { ...model });
}

function resetFilters() {
  model.property = '';
  model.block = '';
  model.floor = '';
  model.unitType = '';
  model.salesStatus = '';
  model.revenueType = '';
  emitChange();
}
</script>

