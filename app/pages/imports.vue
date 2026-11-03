<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('imports.title') }}</h1>
        <p class="text-xs text-slate-500 mt-1">{{ $t('imports.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="loadBatches"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <i class="pi pi-refresh text-xs"></i>
          <span>Refresh Batches</span>
        </button>
      </div>
    </div>

    <!-- Google Sheets Live Sync Card -->
    <div class="bg-gradient-to-br from-white to-emerald-50/40 rounded-2xl border border-emerald-200/80 shadow-sm p-6">
      <div class="flex items-center gap-3 pb-3 mb-4 border-b border-emerald-100">
        <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
          <i class="pi pi-table text-base"></i>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900">{{ $t('imports.google_sheets_title') }}</h2>
          <p class="text-xs text-slate-500">{{ $t('imports.google_sheets_subtitle') }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Google Sheets Document URL
          </label>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              v-model="googleSheetUrl"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-inner"
            />
            <button
              @click="syncGoogleSheet"
              :disabled="syncingSheet || !googleSheetUrl"
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 whitespace-nowrap"
            >
              <i v-if="syncingSheet" class="pi pi-spin pi-spinner text-xs"></i>
              <i v-else class="pi pi-sync text-xs"></i>
              <span>{{ syncingSheet ? 'Connecting & Syncing...' : $t('imports.google_sheets_btn') }}</span>
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs">
          <div class="flex items-center gap-2 text-slate-600">
            <i class="pi pi-info-circle text-emerald-600"></i>
            <span>{{ $t('imports.google_sheets_notice') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[11px] font-bold text-slate-500">Strategy:</span>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="radio" value="replace" v-model="googleSheetStrategy" class="text-emerald-600" />
              <span class="text-[11px] font-bold text-slate-700">Replace DB</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="radio" value="update" v-model="googleSheetStrategy" class="text-emerald-600" />
              <span class="text-[11px] font-bold text-slate-700">Update</span>
            </label>
          </div>
        </div>

        <div v-if="sheetSyncMessage" :class="['p-3 rounded-xl text-xs flex items-start gap-2', sheetSyncSuccess ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200']">
          <i :class="['mt-0.5', sheetSyncSuccess ? 'pi pi-check-circle text-emerald-600' : 'pi pi-exclamation-triangle text-rose-600']"></i>
          <div>
            <p class="font-bold">{{ sheetSyncMessage }}</p>
            <p v-if="!sheetSyncSuccess" class="text-[11px] mt-1 text-rose-700">
              Tip: In Google Sheets, click <strong>Share</strong> (top right) &gt; under <strong>General access</strong> select <strong>"Anyone with the link"</strong> (Viewer), then click sync again.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload & Preview Card -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div class="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
        <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <i class="pi pi-cloud-upload"></i>
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-900">Upload Property Units Excel Workbook</h2>
          <p class="text-[11px] text-slate-400">Supports .xlsx spreadsheets matching the 92 expected property unit fields</p>
        </div>
      </div>

      <!-- Drag & Drop Zone -->
      <div
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
        :class="[
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
          dragOver ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
        ]"
        @click="fileInputRef.click()"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx"
          @change="handleFileSelect"
          class="hidden"
        />
        <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 text-xl">
          <i class="pi pi-file-excel"></i>
        </div>
        <p class="text-xs font-bold text-slate-800">
          {{ selectedFile ? selectedFile.name : $t('imports.upload_zone') }}
        </p>
        <p class="text-[10px] text-slate-400 mt-1">
          {{ selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : 'Standard target file: Property Units Exp-Property Units Target.xlsx' }}
        </p>
      </div>

      <!-- Preview Action & Results -->
      <div v-if="previewLoading" class="mt-4 p-8 text-center text-xs text-slate-500">
        <i class="pi pi-spin pi-spinner text-2xl text-emerald-600 block mb-2"></i>
        <span>Analyzing workbook headers and validating 92 columns...</span>
      </div>

      <div v-else-if="previewData" class="mt-6 space-y-4 pt-4 border-t border-slate-100">
        <!-- Preview Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Worksheet</span>
            <span class="text-sm font-black text-slate-800">{{ previewData.sheetName }}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Data Rows</span>
            <span class="text-sm font-black text-slate-800">{{ previewData.totalRows.toLocaleString() }}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Matched Columns</span>
            <span class="text-sm font-black text-emerald-700">
              {{ previewData.matchedExpectedColumns }} / 92
            </span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Audit Findings</span>
            <span class="text-sm font-black" :class="previewData.detectedIssuesCount > 0 ? 'text-amber-600' : 'text-emerald-600'">
              {{ previewData.detectedIssuesCount }} notes
            </span>
          </div>
        </div>

        <!-- Strategy Selection -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Select Import Strategy
          </label>
          <div class="space-y-2">
            <label class="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer text-xs">
              <input type="radio" value="replace" v-model="importStrategy" class="mt-0.5 text-emerald-600" />
              <div>
                <span class="font-bold text-slate-900 block">{{ $t('imports.strategy_replace') }}</span>
                <span class="text-[11px] text-slate-400">Clears current units and loads a pristine set of 1,034 records with zero duplicate pollution.</span>
              </div>
            </label>
            <label class="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer text-xs">
              <input type="radio" value="update" v-model="importStrategy" class="mt-0.5 text-emerald-600" />
              <div>
                <span class="font-bold text-slate-900 block">{{ $t('imports.strategy_update') }}</span>
                <span class="text-[11px] text-slate-400">Matches by Property ID + Unit ID, updating existing entries and adding new ones.</span>
              </div>
            </label>
            <label class="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer text-xs">
              <input type="radio" value="append" v-model="importStrategy" class="mt-0.5 text-emerald-600" />
              <div>
                <span class="font-bold text-slate-900 block">{{ $t('imports.strategy_append') }}</span>
                <span class="text-[11px] text-slate-400">Appends all rows directly into the database as additional records.</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Execute Button -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="executeImport"
            :disabled="executing"
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <i v-if="executing" class="pi pi-spin pi-spinner text-xs"></i>
            <i v-else class="pi pi-check text-xs"></i>
            <span>{{ executing ? 'Importing Into SQLite...' : $t('imports.confirm_btn') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Import Batches History & Rollback Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <i class="pi pi-history text-slate-500"></i>
          <span>{{ $t('imports.batches_title') }}</span>
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th class="p-3">Batch ID</th>
              <th class="p-3">Filename</th>
              <th class="p-3">Strategy</th>
              <th class="p-3 text-right">Rows</th>
              <th class="p-3 text-right">Imported</th>
              <th class="p-3 text-right">Issues Logged</th>
              <th class="p-3">Status</th>
              <th class="p-3">Import Date</th>
              <th class="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr v-if="batches.length === 0">
              <td colspan="9" class="p-6 text-center text-slate-400">No import history yet.</td>
            </tr>
            <tr v-else v-for="b in batches" :key="b.id" class="hover:bg-slate-50">
              <td class="p-3 font-mono font-bold text-slate-500">#{{ b.id }}</td>
              <td class="p-3 font-bold text-slate-800">{{ b.filename }}</td>
              <td class="p-3 uppercase text-[10px] font-bold text-slate-500">{{ b.importStrategy }}</td>
              <td class="p-3 text-right font-bold">{{ b.totalRows }}</td>
              <td class="p-3 text-right text-emerald-700 font-bold">{{ b.importedRows }}</td>
              <td class="p-3 text-right text-amber-600 font-bold">{{ b.issuesCount }}</td>
              <td class="p-3">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                    b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : (b.status === 'rolled_back' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-800')
                  ]"
                >
                  {{ b.status }}
                </span>
              </td>
              <td class="p-3 text-slate-500">{{ b.importedAt }}</td>
              <td class="p-3 text-center">
                <button
                  v-if="b.status === 'completed'"
                  @click="rollbackBatch(b.id)"
                  class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 transition"
                  title="Revert and remove units imported in this batch"
                >
                  Rollback
                </button>
                <span v-else class="text-[10px] text-slate-400 italic">No action</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const googleSheetUrl = ref('https://docs.google.com/spreadsheets/d/1oNYOxYolYO2SAK8kgu13IvYZIf8M8gyKv8QgaVw_Cq4/edit?gid=1892268511#gid=1892268511');
const googleSheetStrategy = ref('replace');
const syncingSheet = ref(false);
const sheetSyncMessage = ref('');
const sheetSyncSuccess = ref(false);

const fileInputRef = ref(null);
const dragOver = ref(false);
const selectedFile = ref(null);

const previewLoading = ref(false);
const previewData = ref(null);
const importStrategy = ref('replace');
const executing = ref(false);

const batches = ref([]);

async function syncGoogleSheet() {
  if (!googleSheetUrl.value) return;
  syncingSheet.value = true;
  sheetSyncMessage.value = '';
  sheetSyncSuccess.value = false;
  try {
    const res = await $fetch('/api/imports/google-sheets', {
      method: 'POST',
      body: {
        url: googleSheetUrl.value,
        strategy: googleSheetStrategy.value
      }
    });
    sheetSyncSuccess.value = true;
    sheetSyncMessage.value = res.message || `Successfully synced ${res.importedRows} rows from Google Sheets.`;
    await loadBatches();
  } catch (err) {
    sheetSyncSuccess.value = false;
    sheetSyncMessage.value = err?.data?.statusMessage || err?.data?.message || err?.message || 'Failed to sync from Google Sheets.';
  } finally {
    syncingSheet.value = false;
  }
}

function handleDrop(e) {
  dragOver.value = false;
  if (e.dataTransfer?.files?.length) {
    selectedFile.value = e.dataTransfer.files[0];
    runPreview();
  }
}

function handleFileSelect(e) {
  if (e.target.files?.length) {
    selectedFile.value = e.target.files[0];
    runPreview();
  }
}

async function runPreview() {
  if (!selectedFile.value) return;
  previewLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    previewData.value = await $fetch('/api/imports/preview', {
      method: 'POST',
      body: formData
    });
  } catch (err) {
    alert(err?.data?.message || 'Failed to parse Excel file');
  } finally {
    previewLoading.value = false;
  }
}

async function executeImport() {
  if (!selectedFile.value) return;
  executing.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('strategy', importStrategy.value);

    await $fetch('/api/imports/execute', {
      method: 'POST',
      body: formData
    });

    alert('Import completed successfully!');
    selectedFile.value = null;
    previewData.value = null;
    await loadBatches();
  } catch (err) {
    alert(err?.data?.message || 'Import failed');
  } finally {
    executing.value = false;
  }
}

async function loadBatches() {
  try {
    batches.value = await $fetch('/api/imports');
  } catch (e) {}
}

async function rollbackBatch(id) {
  if (!confirm(`Are you sure you want to rollback batch #${id}? This will remove imported records from this batch.`)) return;
  try {
    await $fetch(`/api/imports/${id}/rollback`, { method: 'POST' });
    alert(`Batch #${id} rolled back successfully.`);
    await loadBatches();
  } catch (e) {
    alert('Failed to rollback batch');
  }
}

onMounted(() => {
  loadBatches();
});
</script>

