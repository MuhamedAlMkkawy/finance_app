<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('reports.title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('reports.subtitle') }}</p>
      </div>
    </div>

    <!-- Reports Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="rep in reportList"
        :key="rep.id"
        class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all"
      >
        <div>
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg mb-3" :class="rep.iconBg">
            <i :class="[rep.icon, rep.iconColor]"></i>
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1">{{ rep.title }}</h3>
          <p class="text-xs text-slate-500 mb-6">{{ rep.description }}</p>
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center gap-2">
          <a
            :href="rep.excelUrl"
            download
            class="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
          >
            <i class="pi pi-file-excel text-xs"></i>
            <span>Excel (.xlsx)</span>
          </a>
          <a
            :href="rep.pdfUrl"
            target="_blank"
            class="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-white text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
          >
            <i class="pi pi-file-pdf text-xs"></i>
            <span>PDF (.pdf)</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();

const reportList = computed(() => [
  {
    id: 'executive',
    title: t('reports.executive_report'),
    description: t('reports.executive_desc', 'High-level synthesis of all 14 KPIs, property breakdown, sales distribution, and occupancy numbers.'),
    icon: 'pi pi-chart-pie',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    excelUrl: '/api/reports/executive?format=excel',
    pdfUrl: '/api/reports/executive?format=pdf'
  },
  {
    id: 'property',
    title: t('reports.property_report'),
    description: t('reports.property_desc', 'Building-by-building metrics comparing total units, sold ratios, area, and total sales volume.'),
    icon: 'pi pi-building',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    excelUrl: '/api/reports/executive?format=excel',
    pdfUrl: '/api/reports/executive?format=pdf'
  },
  {
    id: 'sales',
    title: t('reports.sales_report'),
    description: t('reports.sales_desc', 'Itemized sales ledger detailing sold units, prices per square meter, taxes, and block rankings.'),
    icon: 'pi pi-dollar',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    excelUrl: '/api/reports/executive?format=excel',
    pdfUrl: '/api/reports/executive?format=pdf'
  },
  {
    id: 'inventory',
    title: t('reports.inventory_report'),
    description: t('reports.inventory_desc', 'Available units catalog with dimensions, block and floor locations, and current availability status.'),
    icon: 'pi pi-box',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    excelUrl: '/api/reports/executive?format=excel',
    pdfUrl: '/api/reports/executive?format=pdf'
  },
  {
    id: 'financial',
    title: t('reports.financial_report', 'Financial & Tax Audit Report'),
    description: t('reports.financial_desc', 'Audited currency balances, brokerage amounts, facilities revenue, and zero-price flags.'),
    icon: 'pi pi-wallet',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    excelUrl: '/api/reports/executive?format=excel',
    pdfUrl: '/api/reports/executive?format=pdf'
  },
  {
    id: 'quality',
    title: t('reports.data_quality_report'),
    description: t('reports.quality_desc', 'Complete audit of 1900-01-01 legacy dates, mixed-case property identifiers, and schema completeness.'),
    icon: 'pi pi-check-circle',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    excelUrl: '/api/reports/executive?format=excel',
    pdfUrl: '/api/reports/executive?format=pdf'
  }
]);
</script>
