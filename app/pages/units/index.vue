<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('units.title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('units.subtitle') }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Column Selector Button -->
        <button
          @click="showColumnSelector = true"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <i class="pi pi-table text-xs"></i>
          <span>{{ $t('units.columns_selector') }} ({{ visibleColumns.length }}/92)</span>
        </button>

        <!-- Export Filtered Excel -->
        <button
          @click="exportFilteredCSV"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
        >
          <i class="pi pi-file-excel text-xs"></i>
          <span>{{ $t('common.export_excel') }}</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <!-- Search Keyword -->
        <div class="col-span-1 sm:col-span-2">
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">{{ $t('common.search') }}</label>
          <div class="relative">
            <i class="pi pi-search absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="filters.search"
              @input="debounceSearch"
              type="text"
              :placeholder="$t('common.search')"
              class="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <!-- Property Filter -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">{{ $t('units.property_id') }}</label>
          <select
            v-model="filters.property"
            @change="fetchUnits(1)"
            class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="p in filterOptions.properties" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>

        <!-- Sales Status Filter -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">{{ $t('units.sales_status') }}</label>
          <select
            v-model="filters.salesStatus"
            @change="fetchUnits(1)"
            class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="Sold">Sold</option>
            <option value="Available">Available</option>
          </select>
        </div>

        <!-- Block Filter -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">{{ $t('units.block') }}</label>
          <select
            v-model="filters.block"
            @change="fetchUnits(1)"
            class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="b in filterOptions.blocks" :key="b" :value="b">Block {{ b }}</option>
          </select>
        </div>

        <!-- Page Size -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">{{ $t('common.view') }}</label>
          <select
            v-model="pageSize"
            @change="fetchUnits(1)"
            class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none focus:border-emerald-500"
          >
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
            <option :value="50">50 / page</option>
            <option :value="100">100 / page</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th class="p-3 w-8">
                <input
                  type="checkbox"
                  @change="toggleSelectAllRows"
                  :checked="selectedRowIds.length === unitsList.length && unitsList.length > 0"
                  class="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
              </th>
              <th
                v-for="col in activeColumnsMeta"
                :key="col.field"
                @click="handleSort(col.field)"
                class="p-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div class="flex items-center gap-1.5">
                  <span>{{ col.label }}</span>
                  <i
                    v-if="sortBy === col.field"
                    :class="sortOrder === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'"
                    class="text-emerald-600 text-[10px]"
                  ></i>
                </div>
              </th>
              <th class="p-3 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <!-- Loading Indicator -->
            <tr v-if="loading">
              <td :colspan="activeColumnsMeta.length + 2" class="p-12 text-center text-slate-400">
                <i class="pi pi-spin pi-spinner text-2xl text-emerald-600 block mb-2"></i>
                <span>Loading units from Google Sheet...</span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="unitsList.length === 0">
              <td :colspan="activeColumnsMeta.length + 2" class="p-12 text-center text-slate-400">
                <i class="pi pi-inbox text-3xl block mb-2"></i>
                <span class="font-bold text-slate-700 block text-sm">No unit records match your criteria</span>
                <span class="text-xs text-slate-400">Try clearing active filters or adjusting the search term.</span>
              </td>
            </tr>

            <!-- Records -->
            <tr
              v-else
              v-for="unit in unitsList"
              :key="unit.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="p-3">
                <input
                  type="checkbox"
                  :value="unit.id"
                  v-model="selectedRowIds"
                  class="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
              </td>
              <td
                v-for="col in activeColumnsMeta"
                :key="col.field"
                class="p-3 whitespace-nowrap"
              >
                <!-- Custom formatting per field -->
                <template v-if="col.field === 'UNITID'">
                  <NuxtLink :to="localePath(`/units/${unit.id}`)" class="font-bold text-slate-900 hover:text-emerald-600">
                    {{ unit.unitId }}
                  </NuxtLink>
                </template>
                <template v-else-if="col.field === 'PROPERTYID'">
                  <NuxtLink :to="localePath(`/properties/${unit.propertyId}`)" class="font-semibold text-slate-700 hover:text-emerald-600">
                    {{ unit.propertyId }}
                  </NuxtLink>
                </template>
                <template v-else-if="col.field === 'SALESUNITSTATUS'">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      unit.salesUnitStatus?.toLowerCase() === 'sold' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    ]"
                  >
                    {{ unit.salesUnitStatus || '-' }}
                  </span>
                </template>
                <template v-else-if="col.field === 'SALEAMOUNT'">
                  <span class="font-bold text-slate-900">
                    {{ unit.saleAmount ? unit.saleAmount.toLocaleString() + ' ' + (unit.currencyCode || 'SAR') : '-' }}
                  </span>
                </template>
                <template v-else-if="col.field === 'TOTALAMOUNT'">
                  <span class="font-bold text-slate-800">
                    {{ unit.totalAmount ? unit.totalAmount.toLocaleString() : '-' }}
                  </span>
                </template>
                <template v-else-if="col.field === 'UNITAREA'">
                  <span>{{ unit.unitArea ? unit.unitArea.toLocaleString() + ' m²' : '-' }}</span>
                </template>
                <template v-else-if="col.field === 'ISOCCUPIED' || col.field === 'ISRESERVED' || col.field === 'ISVACCANT'">
                  <span :class="unit.raw[col.field] === 'Yes' ? 'text-emerald-600 font-bold' : 'text-slate-400'">
                    {{ unit.raw[col.field] || 'No' }}
                  </span>
                </template>
                <template v-else>
                  <span>{{ unit.raw[col.field] != null ? unit.raw[col.field] : '-' }}</span>
                </template>
              </td>

              <!-- Actions -->
              <td class="p-3 text-center whitespace-nowrap">
                <NuxtLink
                  :to="localePath(`/units/${unit.id}`)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg font-bold text-[11px] transition-colors"
                >
                  <i class="pi pi-eye text-xs"></i>
                  <span>Details</span>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Toolbar -->
      <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div class="text-slate-500">
          Showing <span class="font-bold text-slate-900">{{ (currentPage - 1) * pageSize + 1 }}</span> to
          <span class="font-bold text-slate-900">{{ Math.min(currentPage * pageSize, totalUnits) }}</span> of
          <span class="font-bold text-slate-900">{{ totalUnits.toLocaleString() }}</span> records
        </div>

        <div class="flex items-center gap-1.5">
          <button
            @click="fetchUnits(1)"
            :disabled="currentPage === 1"
            class="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <i class="pi pi-angle-double-left text-xs"></i>
          </button>
          <button
            @click="fetchUnits(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <i class="pi pi-angle-left text-xs"></i>
          </button>

          <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">
            Page {{ currentPage }} / {{ totalPages || 1 }}
          </span>

          <button
            @click="fetchUnits(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <i class="pi pi-angle-right text-xs"></i>
          </button>
          <button
            @click="fetchUnits(totalPages)"
            :disabled="currentPage >= totalPages"
            class="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <i class="pi pi-angle-double-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 92 Columns Visibility Modal -->
    <div
      v-if="showColumnSelector"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[85vh]">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <i class="pi pi-table"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Customize Table Columns</h3>
              <p class="text-xs text-slate-400">Select any of the 92 original Excel columns to display in this table</p>
            </div>
          </div>
          <button
            @click="showColumnSelector = false"
            class="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="flex items-center justify-between gap-3 mb-4">
          <input
            v-model="columnFilterSearch"
            type="text"
            placeholder="Search columns by name..."
            class="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-emerald-500"
          />
          <button
            @click="resetToDefaultColumns"
            class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            Reset Defaults
          </button>
        </div>

        <!-- Columns Checkbox Grid -->
        <div class="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-1">
          <label
            v-for="col in filteredColumnsList"
            :key="col.field"
            :class="[
              'flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors',
              visibleColumns.includes(col.field) ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
            ]"
          >
            <input
              type="checkbox"
              :value="col.field"
              v-model="visibleColumns"
              class="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <span class="truncate" :title="col.field">{{ col.field }}</span>
          </label>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-medium">
            {{ visibleColumns.length }} of 92 columns visible
          </span>
          <button
            @click="showColumnSelector = false"
            class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            Apply Columns
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const localePath = useLocalePath();

const loading = ref(false);
const unitsList = ref([]);
const totalUnits = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const pageSize = ref(20);
const sortBy = ref('id');
const sortOrder = ref('asc');
const selectedRowIds = ref([]);

const showColumnSelector = ref(false);
const columnFilterSearch = ref('');

const allColumns = ref([]);
const defaultColumns = [
  'UNITID',
  'PROPERTYID',
  'UNITNAME',
  'BLOCKID',
  'FLOORID',
  'UNITTYPE',
  'UNITAREA',
  'SALESUNITSTATUS',
  'SALEAMOUNT',
  'SALESTAXAMOUNT',
  'TOTALAMOUNT',
  'RENTAMOUNT',
  'ISOCCUPIED',
  'ISRESERVED',
  'ISVACCANT'
];
const visibleColumns = ref([...defaultColumns]);

const filters = reactive({
  search: String(route.query.search || ''),
  property: String(route.query.property || ''),
  salesStatus: String(route.query.salesStatus || ''),
  block: String(route.query.block || ''),
});

const filterOptions = ref({ properties: [], blocks: [] });

let debounceTimer = null;
function debounceSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchUnits(1);
  }, 300);
}

async function loadMetadata() {
  try {
    const [cols, overview] = await Promise.all([
      $fetch('/api/units/columns'),
      $fetch('/api/dashboard/overview')
    ]);
    allColumns.value = cols || [];
    filterOptions.value = overview.filterOptions || { properties: [], blocks: [] };
  } catch (e) {}
}

async function fetchUnits(page = 1) {
  loading.value = true;
  currentPage.value = page;
  try {
    const res = await $fetch('/api/units', {
      query: {
        page,
        pageSize: pageSize.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        search: filters.search || undefined,
        property: filters.property || undefined,
        salesStatus: filters.salesStatus || undefined,
        block: filters.block || undefined
      }
    });

    unitsList.value = res.items || [];
    totalUnits.value = res.total || 0;
    totalPages.value = res.totalPages || 1;
  } catch (err) {
    console.error('Failed to fetch units', err);
  } finally {
    loading.value = false;
  }
}

const activeColumnsMeta = computed(() => {
  return visibleColumns.value.map(colName => {
    return {
      field: colName,
      label: colName.replace(/_/g, ' ')
    };
  });
});

const filteredColumnsList = computed(() => {
  if (!columnFilterSearch.value.trim()) return allColumns.value;
  const q = columnFilterSearch.value.toLowerCase().trim();
  return allColumns.value.filter(c => c.field.toLowerCase().includes(q));
});

function handleSort(field) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
  fetchUnits(1);
}

function resetToDefaultColumns() {
  visibleColumns.value = [...defaultColumns];
}

function toggleSelectAllRows(e) {
  if (e.target.checked) {
    selectedRowIds.value = unitsList.value.map(u => u.id);
  } else {
    selectedRowIds.value = [];
  }
}

function exportFilteredCSV() {
  if (unitsList.value.length === 0) return;
  const headers = visibleColumns.value.join(',');
  const rows = unitsList.value.map(u => {
    return visibleColumns.value.map(col => {
      const val = u.raw[col] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Units_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(async () => {
  await loadMetadata();
  await fetchUnits(1);
});
</script>

