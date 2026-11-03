<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('data_explorer.title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('data_explorer.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'records'"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'records' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          ]"
        >
          <i class="pi pi-table text-xs mr-1"></i>
          <span>{{ $t('data_explorer.records_tab') }}</span>
        </button>
        <button
          @click="activeTab = 'schema'"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'schema' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          ]"
        >
          <i class="pi pi-chart-bar text-xs mr-1"></i>
          <span>{{ $t('data_explorer.schema_tab') }}</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: ALL RAW RECORDS -->
    <div v-if="activeTab === 'records'" class="space-y-4">
      <!-- Search & Filters Toolbar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex-1 flex flex-wrap items-center gap-3 w-full">
          <!-- Global Search across all 92 fields -->
          <div class="relative flex-1 min-w-[200px]">
            <i class="pi pi-search absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="searchQuery"
              @input="debounceFetch"
              type="text"
              placeholder="Search across all 92 columns..."
              class="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <!-- Specific Field Filter -->
          <div class="flex items-center gap-2">
            <select
              v-model="filterField"
              @change="fetchRecords(1)"
              class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none focus:border-emerald-500 max-w-[160px]"
            >
              <option value="">Filter Field...</option>
              <option v-for="col in schemaList" :key="col.field" :value="col.field">{{ col.field }}</option>
            </select>
            <input
              v-if="filterField"
              v-model="filterValue"
              @input="debounceFetch"
              type="text"
              placeholder="Value..."
              class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-32 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Column picker trigger -->
          <button
            @click="showColumnPicker = true"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Columns ({{ visibleColumns.length }}/92)
          </button>
        </div>
      </div>

      <!-- Raw Records Dynamic Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div class="overflow-x-auto min-h-[420px]">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3 w-12 text-slate-400">Row</th>
                <th v-for="col in visibleColumns" :key="col" class="p-3 whitespace-nowrap">
                  {{ col }}
                </th>
                <th class="p-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr v-if="loadingRecords">
                <td :colspan="visibleColumns.length + 2" class="p-12 text-center text-slate-400">
                  <i class="pi pi-spin pi-spinner text-2xl text-emerald-600 block mb-2"></i>
                  <span>Querying raw dataset...</span>
                </td>
              </tr>
              <tr v-else-if="records.length === 0">
                <td :colspan="visibleColumns.length + 2" class="p-12 text-center text-slate-400">
                  <span>No matching records found.</span>
                </td>
              </tr>
              <tr v-else v-for="row in records" :key="row._dbId" class="hover:bg-slate-50">
                <td class="p-3 font-mono text-slate-400">{{ row._sourceRowNumber }}</td>
                <td v-for="col in visibleColumns" :key="col" class="p-3 whitespace-nowrap max-w-[200px] truncate" :title="String(row[col])">
                  <span v-if="row[col] === null" class="text-slate-300 italic">null</span>
                  <span v-else-if="row[col] === ''" class="text-slate-300 italic">empty</span>
                  <span v-else>{{ row[col] }}</span>
                </td>
                <td class="p-3 text-center">
                  <button
                    @click="activeRecordModal = row"
                    class="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded text-[11px] font-bold"
                  >
                    JSON
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="text-slate-500">
            Total records: <span class="font-bold text-slate-900">{{ totalRecords.toLocaleString() }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="fetchRecords(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span class="font-bold text-slate-700">Page {{ currentPage }} / {{ totalPages || 1 }}</span>
            <button
              @click="fetchRecords(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: SCHEMA & COMPLETENESS -->
    <div v-else class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          All 92 Source Columns Data Quality & Completeness Audit
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3 w-8">#</th>
                <th class="p-3">Field Name</th>
                <th class="p-3 text-right">Completeness %</th>
                <th class="p-3 text-right">Null / Empty</th>
                <th class="p-3 text-right">Populated Count</th>
                <th class="p-3">Sample Observed Values</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr v-for="(col, idx) in schemaList" :key="col.field" class="hover:bg-slate-50">
                <td class="p-3 font-mono text-slate-400">{{ idx + 1 }}</td>
                <td class="p-3 font-bold text-slate-900 font-mono">{{ col.field }}</td>
                <td class="p-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-emerald-500 rounded-full"
                        :style="{ width: `${col.completeness}%` }"
                      ></div>
                    </div>
                    <span class="font-bold text-slate-800">{{ col.completeness }}%</span>
                  </div>
                </td>
                <td class="p-3 text-right text-slate-500">{{ (col.nullCount + col.emptyCount).toLocaleString() }}</td>
                <td class="p-3 text-right font-bold text-slate-900">{{ col.nonEmptyCount.toLocaleString() }}</td>
                <td class="p-3 text-slate-600 max-w-xs truncate" :title="col.sampleValues.join(', ')">
                  {{ col.sampleValues.length > 0 ? col.sampleValues.join(', ') : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- JSON Inspector Modal -->
    <div
      v-if="activeRecordModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
    >
      <div class="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 my-auto">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h3 class="text-sm font-bold text-slate-900">
            Source Row #{{ activeRecordModal._sourceRowNumber }} (All Fields)
          </h3>
          <button @click="activeRecordModal = null" class="text-slate-400 hover:text-slate-600">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96">{{ JSON.stringify(activeRecordModal, null, 2) }}</pre>
      </div>
    </div>

    <!-- Column Picker Modal -->
    <div
      v-if="showColumnPicker"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
    >
      <div class="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl border border-slate-200 my-auto max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h3 class="text-sm font-bold text-slate-900">Select Visible Columns in Data Explorer</h3>
          <button @click="showColumnPicker = false" class="text-slate-400 hover:text-slate-600">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto grid grid-cols-3 gap-2 p-1">
          <label
            v-for="col in schemaList"
            :key="col.field"
            class="flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer select-none"
            :class="visibleColumns.includes(col.field) ? 'bg-emerald-50 border-emerald-200 font-bold' : 'bg-slate-50 border-slate-200'"
          >
            <input type="checkbox" :value="col.field" v-model="visibleColumns" class="text-emerald-600 rounded" />
            <span class="truncate">{{ col.field }}</span>
          </label>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            @click="showColumnPicker = false"
            class="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const activeTab = ref('records');
const loadingRecords = ref(false);
const records = ref([]);
const totalRecords = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);

const searchQuery = ref('');
const filterField = ref('');
const filterValue = ref('');

const schemaList = ref([]);
const visibleColumns = ref([
  'PROPERTYID',
  'UNITID',
  'BLOCKID',
  'FLOORID',
  'UNITTYPE',
  'UNITAREA',
  'SALESUNITSTATUS',
  'SALEAMOUNT',
  'TOTALAMOUNT',
  'CURRENCYCODE'
]);

const showColumnPicker = ref(false);
const activeRecordModal = ref(null);

let timer = null;
function debounceFetch() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchRecords(1);
  }, 300);
}

async function loadSchema() {
  try {
    schemaList.value = await $fetch('/api/data-explorer/schema');
  } catch (e) {}
}

async function fetchRecords(page = 1) {
  loadingRecords.value = true;
  currentPage.value = page;
  try {
    const res = await $fetch('/api/data-explorer/records', {
      query: {
        page,
        pageSize: 25,
        search: searchQuery.value || undefined,
        filterField: filterField.value || undefined,
        filterValue: filterValue.value || undefined
      }
    });
    records.value = res.records || [];
    totalRecords.value = res.total || 0;
    totalPages.value = res.totalPages || 1;
  } catch (e) {
    console.error(e);
  } finally {
    loadingRecords.value = false;
  }
}

onMounted(() => {
  loadSchema();
  fetchRecords(1);
});
</script>

