import xlsx from 'xlsx';
import path from 'node:path';
import fs from 'node:fs';
import { db } from '../database';
import { units, properties, importBatches, importIssues } from '../database/schema';
import { eq, inArray, sql } from 'drizzle-orm';
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
    const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = wb.SheetNames[0] || 'Property_Units';
    const sheet = wb.Sheets[sheetName];
    
    // Read raw 2D array to inspect headers
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
   * Execute transactional import
   */
  static async executeImport(
    filename: string,
    rows: any[],
    strategy: 'replace' | 'append' | 'update' = 'replace'
  ) {
    const totalRows = rows.length;
    let importedRows = 0;
    let updatedRows = 0;
    let skippedRows = 0;
    let failedRows = 0;

    // 1. Create batch record
    const [batch] = await db.insert(importBatches).values({
      filename,
      importStrategy: strategy,
      totalRows,
      importedRows: 0,
      updatedRows: 0,
      skippedRows: 0,
      failedRows: 0,
      status: 'processing'
    }).returning();

    const batchId = batch.id;
    const issuesToInsert: any[] = [];
    const seenCompoundKeys = new Set<string>();

    try {
      if (strategy === 'replace') {
        // Clear existing units and properties
        await db.delete(units);
        await db.delete(properties);
      }

      // Collect unique properties to populate properties table
      const propertyMap = new Map<string, string>(); // normalized -> original

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
          const originalPropertyId = row.PROPERTYID ? String(row.PROPERTYID).trim() : 'UNKNOWN';
          const normalizedPropertyId = originalPropertyId.toUpperCase();
          const unitId = row.UNITID ? String(row.UNITID).trim() : `ROW_${rowNumber}`;

          if (!propertyMap.has(normalizedPropertyId)) {
            propertyMap.set(normalizedPropertyId, originalPropertyId);
          }

          // Validate row
          const rowIssues = validateDatasetRow(row, rowNumber, seenCompoundKeys);
          for (const iss of rowIssues) {
            issuesToInsert.push({
              importBatchId: batchId,
              unitId: iss.unitId || unitId,
              fieldName: iss.fieldName,
              issueType: iss.issueType,
              message: iss.message,
              originalValue: iss.originalValue != null ? String(iss.originalValue) : null
            });
          }

          // Numeric parsing helpers
          const parseNum = (val: any) => {
            if (val === null || val === undefined || val === '') return null;
            const parsed = parseFloat(String(val).replace(/,/g, ''));
            return isNaN(parsed) ? null : parsed;
          };

          const parseBoolInt = (val: any) => {
            if (!val) return 0;
            const s = String(val).trim().toLowerCase();
            return (s === 'yes' || s === 'true' || s === '1') ? 1 : 0;
          };

          const unitData = {
            propertyId: normalizedPropertyId,
            originalPropertyId,
            unitId,
            unitName: row.UNITNAME ? String(row.UNITNAME).trim() : null,
            blockId: row.BLOCKID ? String(row.BLOCKID).trim() : null,
            floorId: row.FLOORID ? String(row.FLOORID).trim() : null,
            unitType: row.UNITTYPE ? String(row.UNITTYPE).trim() : null,
            unitArea: parseNum(row.UNITAREA),
            salesUnitStatus: row.SALESUNITSTATUS ? String(row.SALESUNITSTATUS).trim() : null,
            revenueType: row.REVENUETYPE ? String(row.REVENUETYPE).trim() : null,
            saleAmount: parseNum(row.SALEAMOUNT),
            saleTaxAmount: parseNum(row.SALESTAXAMOUNT),
            totalAmount: parseNum(row.TOTALAMOUNT),
            currencyCode: row.CURRENCYCODE ? String(row.CURRENCYCODE).trim() : 'SAR',
            occupied: parseBoolInt(row.ISOCCUPIED),
            reserved: parseBoolInt(row.ISRESERVED),
            vacant: parseBoolInt(row.ISVACCANT),
            rawData: JSON.stringify(row),
            sourceRowNumber: rowNumber,
            importBatchId: batchId
          };

          if (strategy === 'update') {
            // Check if exists
            const existing = await db.select({ id: units.id })
              .from(units)
              .where(sql`${units.propertyId} = ${normalizedPropertyId} AND ${units.unitId} = ${unitId}`)
              .get();

            if (existing) {
              await db.update(units).set({
                ...unitData,
                updatedAt: sql`CURRENT_TIMESTAMP`
              }).where(eq(units.id, existing.id));
              updatedRows++;
            } else {
              await db.insert(units).values(unitData);
              importedRows++;
            }
          } else {
            await db.insert(units).values(unitData);
            importedRows++;
          }
        } catch (rowErr) {
          failedRows++;
        }
      }

      // Populate / update properties
      for (const [normId, origId] of propertyMap.entries()) {
        const existingProp = await db.select({ id: properties.id })
          .from(properties)
          .where(eq(properties.normalizedPropertyId, normId))
          .get();

        if (!existingProp) {
          await db.insert(properties).values({
            normalizedPropertyId: normId,
            originalPropertyId: origId
          });
        }
      }

      // Batch insert issues in chunks of 100
      if (issuesToInsert.length > 0) {
        for (let i = 0; i < issuesToInsert.length; i += 100) {
          const chunk = issuesToInsert.slice(i, i + 100);
          await db.insert(importIssues).values(chunk);
        }
      }

      // Update batch record
      await db.update(importBatches).set({
        importedRows,
        updatedRows,
        skippedRows,
        failedRows,
        status: 'completed'
      }).where(eq(importBatches.id, batchId));

      return {
        batchId,
        totalRows,
        importedRows,
        updatedRows,
        skippedRows,
        failedRows,
        issuesCount: issuesToInsert.length,
        status: 'completed'
      };
    } catch (err: any) {
      await db.update(importBatches).set({
        status: 'failed'
      }).where(eq(importBatches.id, batchId));
      throw err;
    }
  }

  /**
   * Rollback a previous import batch
   */
  static async rollbackBatch(batchId: number) {
    const batch = await db.select().from(importBatches).where(eq(importBatches.id, batchId)).get();
    if (!batch) {
      throw new Error(`Batch ID ${batchId} not found`);
    }
    if (batch.status === 'rolled_back') {
      throw new Error(`Batch ID ${batchId} is already rolled back`);
    }

    // Delete units belonging to this batch
    await db.delete(units).where(eq(units.importBatchId, batchId));
    // Delete issues
    await db.delete(importIssues).where(eq(importIssues.importBatchId, batchId));

    // Update batch status
    await db.update(importBatches).set({
      status: 'rolled_back'
    }).where(eq(importBatches.id, batchId));

    // Clean up properties that no longer have units
    const remainingUnits = await db.select({ propId: units.propertyId }).from(units);
    const validProps = new Set(remainingUnits.map(u => u.propId));
    const allProps = await db.select().from(properties);
    for (const p of allProps) {
      if (!validProps.has(p.normalizedPropertyId)) {
        await db.delete(properties).where(eq(properties.id, p.id));
      }
    }

    return { success: true, message: `Batch ${batchId} rolled back successfully.` };
  }

  /**
   * Ensure default dataset is imported on app startup
   */
  static async ensureDatasetImported() {
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(units).get();
    const count = countRes?.count || 0;
    if (count > 0) return; // Already populated

    const excelPath = path.resolve(process.cwd(), 'data', 'Property Units Exp-Property Units Target.xlsx');
    if (!fs.existsSync(excelPath)) {
      console.warn(`Excel file not found at ${excelPath}`);
      return;
    }

    console.log('Seeding initial dataset from Excel file...');
    const buffer = fs.readFileSync(excelPath);
    const { rows } = this.parseWorkbookBuffer(buffer, 'Property Units Exp-Property Units Target.xlsx');
    await this.executeImport('Property Units Exp-Property Units Target.xlsx', rows, 'replace');
    console.log(`Successfully imported ${rows.length} records into database.`);
  }
}

