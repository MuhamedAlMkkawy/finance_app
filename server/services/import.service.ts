import xlsx from 'xlsx';
import { DataStore, DEFAULT_GOOGLE_SHEET_URL } from '../data/store';
import { EXPECTED_92_COLUMNS, validateDatasetRow, type DataQualityIssue } from './validation.service';

export interface ImportPreviewResult {
  filename: string;
  sheetName: string;
  totalRows: number;
  totalColumns: number;
  matchedExpectedColumns: number;
  missingColumns: string[];
  extraColumns: string[];
  sampleRows: any[];
  detectedIssuesCount: number;
  previewIssues: DataQualityIssue[];
}

export class ImportService {
  /**
   * Parse workbook and generate preview
   */
  static parseWorkbookBuffer(buffer: Buffer, filename: string): { rows: any[]; preview: ImportPreviewResult } {
    const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true, raw: false });
    const sheetName = wb.SheetNames[0] || 'Property_Units';
    const sheet = wb.Sheets[sheetName];

    const rawData = xlsx.utils.sheet_to_json<any>(sheet, { defval: null });
    const totalRows = rawData.length;

    // Decode header range
    const range = xlsx.utils.decode_range(sheet['!ref'] || 'A1');
    const headers: string[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: 0, c: C })];
      if (cell && cell.v) headers.push(String(cell.v).trim());
    }

    const missingColumns = EXPECTED_92_COLUMNS.filter(col => !headers.includes(col));
    const extraColumns = headers.filter(col => !EXPECTED_92_COLUMNS.includes(col));
    const matchedCount = EXPECTED_92_COLUMNS.length - missingColumns.length;

    // Validate sample
    const existingIds = new Set<string>();
    const allIssues: DataQualityIssue[] = [];
    rawData.forEach((row, idx) => {
      const rowIssues = validateDatasetRow(row, idx + 2, existingIds);
      allIssues.push(...rowIssues);
    });

    const preview: ImportPreviewResult = {
      filename,
      sheetName,
      totalRows,
      totalColumns: headers.length,
      matchedExpectedColumns: matchedCount,
      missingColumns,
      extraColumns,
      sampleRows: rawData.slice(0, 20),
      detectedIssuesCount: allIssues.length,
      previewIssues: allIssues.slice(0, 50)
    };

    return { rows: rawData, preview };
  }

  /**
   * Execute import
   */
  static async executeImport(
    filename: string,
    rows: any[],
    strategy: 'replace' | 'append' | 'update' = 'replace'
  ) {
    await DataStore.ensureInitialized();
    return DataStore.populateFromRows(rows, filename, strategy);
  }

  /**
   * Rollback a previous import batch
   */
  static async rollbackBatch(batchId: number) {
    await DataStore.ensureInitialized();
    return DataStore.rollbackBatch(batchId);
  }

  /**
   * Sync and import dataset directly from a Google Sheet URL
   */
  static async syncFromGoogleSheet(
    sheetUrl: string = DEFAULT_GOOGLE_SHEET_URL,
    strategy: 'replace' | 'append' | 'update' = 'replace'
  ) {
    return DataStore.syncFromGoogleSheet(sheetUrl, strategy);
  }

  /**
   * Ensure default dataset is imported on app startup
   */
  static async ensureDatasetImported() {
    await DataStore.ensureInitialized();
  }
}
