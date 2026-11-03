<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
    <div
      v-for="kpi in kpiList"
      :key="kpi.id"
      :class="[
        'bg-white rounded-2xl p-3.5 border transition-all duration-200 hover:shadow-md flex flex-col justify-between relative group',
        kpi.borderClass || 'border-slate-200/80 hover:border-slate-300'
      ]"
    >
      <div class="flex items-center justify-between gap-1 mb-2">
        <span class="text-[11px] font-semibold text-slate-500 leading-tight truncate" :title="kpi.label">
          {{ kpi.label }}
        </span>
        <div :class="['w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs', kpi.iconBg, kpi.iconColor]">
          <i :class="kpi.icon"></i>
        </div>
      </div>

      <div class="flex items-baseline gap-1 mt-1">
        <span :class="['text-lg sm:text-xl font-black tracking-tight leading-none', kpi.valueColor || 'text-slate-800']">
          {{ kpi.value }}
        </span>
        <span v-if="kpi.unit" class="text-[10px] font-bold text-slate-400">
          {{ kpi.unit }}
        </span>
      </div>

      <div class="text-[10px] text-slate-400 mt-2 truncate flex items-center gap-1">
        <i class="pi pi-info-circle text-[9px]"></i>
        <span>{{ kpi.desc }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  kpis: {
    type: Object,
    required: true
  }
});

const { t } = useI18n();

const kpiList = computed(() => {
  const k = props.kpis || {};
  const cur = k.currency || 'SAR';

  return [
    {
      id: 1,
      label: t('dashboard.kpis.total_properties'),
      value: (k.totalProperties || 0).toLocaleString(),
      desc: 'Normalized properties',
      icon: 'pi pi-building',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-slate-900'
    },
    {
      id: 2,
      label: t('dashboard.kpis.total_records'),
      value: (k.totalUnitRecords || 0).toLocaleString(),
      desc: 'Total row records in DB',
      icon: 'pi pi-file',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-800'
    },
    {
      id: 3,
      label: t('dashboard.kpis.unique_units'),
      value: (k.uniqueUnitIds || 0).toLocaleString(),
      desc: 'Distinct UNITID values',
      icon: 'pi pi-id-card',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      valueColor: 'text-sky-700'
    },
    {
      id: 4,
      label: t('dashboard.kpis.sold_units'),
      value: (k.soldUnits || 0).toLocaleString(),
      desc: 'Status = Sold',
      icon: 'pi pi-check-circle',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600'
    },
    {
      id: 5,
      label: t('dashboard.kpis.available_units'),
      value: (k.availableUnits || 0).toLocaleString(),
      desc: 'Status = Available',
      icon: 'pi pi-tag',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600'
    },
    {
      id: 6,
      label: t('dashboard.kpis.reserved_units'),
      value: (k.reservedUnits || 0).toLocaleString(),
      desc: 'ISRESERVED = Yes',
      icon: 'pi pi-bookmark',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-700'
    },
    {
      id: 7,
      label: t('dashboard.kpis.occupied_units'),
      value: (k.occupiedUnits || 0).toLocaleString(),
      desc: 'ISOCCUPIED = Yes',
      icon: 'pi pi-users',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700'
    },
    {
      id: 8,
      label: t('dashboard.kpis.vacant_units'),
      value: (k.vacantUnits || 0).toLocaleString(),
      desc: 'ISVACCANT = Yes',
      icon: 'pi pi-inbox',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      valueColor: 'text-teal-700'
    },
    {
      id: 9,
      label: t('dashboard.kpis.total_sales_amount'),
      value: formatCompact(k.totalRecordedSaleAmount || 0),
      unit: cur,
      desc: 'Sum of SALEAMOUNT',
      icon: 'pi pi-dollar',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      borderClass: 'border-emerald-200'
    },
    {
      id: 10,
      label: t('dashboard.kpis.total_sales_tax'),
      value: formatCompact(k.totalSaleTax || 0),
      unit: cur,
      desc: 'Sum of SALESTAXAMOUNT',
      icon: 'pi pi-percentage',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-700'
    },
    {
      id: 11,
      label: t('dashboard.kpis.total_amount'),
      value: formatCompact(k.totalAmount || 0),
      unit: cur,
      desc: 'Sum of TOTALAMOUNT',
      icon: 'pi pi-calculator',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-800'
    },
    {
      id: 12,
      label: t('dashboard.kpis.total_area'),
      value: formatCompact(k.totalUnitArea || 0),
      unit: 'm²',
      desc: 'Sum of UNITAREA',
      icon: 'pi pi-map',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      valueColor: 'text-sky-800'
    },
    {
      id: 13,
      label: t('dashboard.kpis.avg_sale_amount'),
      value: formatCompact(k.averageUnitSaleAmount || 0),
      unit: cur,
      desc: 'Sold units avg amount',
      icon: 'pi pi-chart-line',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      valueColor: 'text-indigo-700'
    },
    {
      id: 14,
      label: t('dashboard.kpis.avg_price_sqm'),
      value: formatCompact(k.averageSalePricePerSquareMeter || 0),
      unit: `${cur}/m²`,
      desc: 'Sales value / area',
      icon: 'pi pi-chart-bar',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      valueColor: 'text-teal-700'
    }
  ];
});

function formatCompact(val) {
  if (val >= 1000000000) return (val / 1000000000).toFixed(2) + ' B';
  if (val >= 1000000) return (val / 1000000).toFixed(2) + ' M';
  if (val >= 1000) return (val / 1000).toFixed(1) + ' K';
  return val.toLocaleString();
}
</script>

