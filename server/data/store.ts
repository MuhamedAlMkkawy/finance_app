import fs from 'node:fs';
import path from 'node:path';
import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
import { EXPECTED_92_COLUMNS, validateDatasetRow, type DataQualityIssue } from '../services/validation.service';
import type { GlobalFilterParams, DashboardKPIs } from '../../shared/types';

export const DEFAULT_GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ivMJljBPpppxg7wUpk83c6wBsbQCg3biP_mqjvAXw1w/edit?usp=drive_link';
export const DEFAULT_SHEET_ID = '1ivMJljBPpppxg7wUpk83c6wBsbQCg3biP_mqjvAXw1w';

export interface StoredUnit {
  id: number;
  propertyId: string; // uppercase normalized
  originalPropertyId: string;
  unitId: string;
  unitName: string | null;
  blockId: string | null;
  floorId: string | null;
  unitType: string | null;
  unitArea: number | null;
  salesUnitStatus: string | null;
  revenueType: string | null;
  saleAmount: number | null;
  saleTaxAmount: number | null;
  totalAmount: number | null;
  currencyCode: string | null;
  occupied: number;
  reserved: number;
  vacant: number;
  rawData: string;
  raw: Record<string, any>;
  sourceRowNumber: number;
  importBatchId: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredProperty {
  id: number;
  normalizedPropertyId: string;
  originalPropertyId: string;
}

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
}

export interface StoredImportBatch {
  id: number;
  filename: string;
  importStrategy: string;
  totalRows: number;
  importedRows: number;
  updatedRows: number;
  skippedRows: number;
  failedRows: number;
  status: string;
  importedAt: string;
}

export interface StoredImportIssue {
  id: number;
  importBatchId: number;
  unitId: string | null;
  fieldName: string | null;
  issueType: string;
  message: string;
  originalValue: string | null;
  createdAt: string;
}

class InMemDataStore {
  private units: StoredUnit[] = [];
  private properties: StoredProperty[] = [];
  private users: StoredUser[] = [];
  private batches: StoredImportBatch[] = [];
  private issues: StoredImportIssue[] = [];
  private initialized: boolean = false;
  private initializingPromise: Promise<void> | null = null;
  public lastSyncTime: string | null = null;
  public currentSourceUrl: string = DEFAULT_GOOGLE_SHEET_URL;

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    this.users = [
      {
        id: 1,
        name: 'System Administrator',
        email: 'admin@property.com',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];
  }

  public async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    if (this.initializingPromise) return this.initializingPromise;

    this.initializingPromise = (async () => {
      try {
        await this.syncFromGoogleSheet(DEFAULT_GOOGLE_SHEET_URL, 'replace');
      } catch (err) {
        console.warn('Network sync failed on startup, loading local fallback CSV...', err);
        this.loadLocalFallback();
      } finally {
        this.initialized = true;
        this.initializingPromise = null;
      }
    })();

    return this.initializingPromise;
  }

  private loadLocalFallback() {
    try {
      const csvPath = path.resolve(process.cwd(), 'data', 'google_sheet_data.csv');
      if (fs.existsSync(csvPath)) {
        const buffer = fs.readFileSync(csvPath);
        const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true, raw: false });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json<any>(sheet, { defval: null });
        this.populateFromRows(rows, `Local Cached Google Sheet [${DEFAULT_SHEET_ID.slice(0, 8)}]`, 'replace');
        this.lastSyncTime = new Date().toISOString();
        return;
      }

      // Check original excel file if available
      const excelPath = path.resolve(process.cwd(), 'data', 'Property Units Exp-Property Units Target.xlsx');
      if (fs.existsSync(excelPath)) {
        const buffer = fs.readFileSync(excelPath);
        const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true, raw: false });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json<any>(sheet, { defval: null });
        this.populateFromRows(rows, 'Property Units Exp-Property Units Target.xlsx', 'replace');
        this.lastSyncTime = new Date().toISOString();
      }
    } catch (e) {
      console.error('Failed to load local fallback data:', e);
    }
  }

  /**
   * Fetch and sync live data from Google Sheet URL
   */
  public async syncFromGoogleSheet(
    url: string = DEFAULT_GOOGLE_SHEET_URL,
    strategy: 'replace' | 'append' | 'update' = 'replace'
  ) {
    const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch || !idMatch[1]) {
      throw new Error('Invalid Google Sheet URL format.');
    }
    const sheetId = idMatch[1];
    const gidMatch = url.match(/[?&#]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : undefined;

    const exportUrls = [
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx${gid ? `&gid=${gid}` : ''}`
    ];

    let lastError = '';
    for (const expUrl of exportUrls) {
      try {
        const res = await fetch(expUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NuxtFinanceApp/1.0'
          },
          redirect: 'follow'
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error(
              `The Google Sheet is private (HTTP ${res.status}). Please set sharing to 'Anyone with the link can view'.`
            );
          }
          lastError = `Google responded with HTTP status ${res.status}`;
          continue;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        const headSnippet = buffer.subarray(0, 1000).toString('utf-8');
        if (
          headSnippet.includes('accounts.google.com') ||
          headSnippet.includes('ServiceLogin') ||
          headSnippet.includes('<title>Google Accounts</title>')
        ) {
          throw new Error('Google Sheet requires login. Please change General access to "Anyone with the link can view".');
        }

        const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true, raw: false });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json<any>(sheet, { defval: null });

        if (!rows || rows.length === 0) {
          throw new Error('The downloaded Google Sheet contains 0 data rows.');
        }

        const result = this.populateFromRows(rows, `Google Sheet [${sheetId.slice(0, 8)}...]`, strategy);
        this.currentSourceUrl = url;
        this.lastSyncTime = new Date().toISOString();
        this.initialized = true;

        // Optionally cache copy locally for offline fallback
        try {
          const csvPath = path.resolve(process.cwd(), 'data', 'google_sheet_data.csv');
          fs.writeFileSync(csvPath, buffer);
        } catch (_) {}

        return {
          success: true,
          sheetId,
          totalRows: rows.length,
          ...result,
          message: `Successfully synced ${result.importedRows} units from Google Sheet into live app memory.`
        };
      } catch (e: any) {
        if (e.message && e.message.includes('requires login')) throw e;
        lastError = e.message || String(e);
      }
    }

    throw new Error(lastError || 'Failed to download or parse Google Sheet.');
  }

  /**
   * Ingest raw rows into memory
   */
  public populateFromRows(
    rows: any[],
    filename: string,
    strategy: 'replace' | 'append' | 'update' = 'replace'
  ) {
    const parseNum = (val: any): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const parsed = parseFloat(String(val).replace(/,/g, ''));
      return isNaN(parsed) ? null : parsed;
    };

    const parseBoolInt = (val: any): number => {
      if (!val) return 0;
      const s = String(val).trim().toLowerCase();
      return (s === 'yes' || s === 'true' || s === '1') ? 1 : 0;
    };

    const batchId = this.batches.length + 1;
    const batch: StoredImportBatch = {
      id: batchId,
      filename,
      importStrategy: strategy,
      totalRows: rows.length,
      importedRows: 0,
      updatedRows: 0,
      skippedRows: 0,
      failedRows: 0,
      status: 'processing',
      importedAt: new Date().toISOString()
    };
    this.batches.push(batch);

    if (strategy === 'replace') {
      this.units = [];
      this.properties = [];
    }

    const seenCompoundKeys = new Set<string>();
    const propertyMap = new Map<string, string>(); // normalized -> original
    let importedRows = 0;
    let updatedRows = 0;
    let failedRows = 0;

    let nextUnitId = this.units.length > 0 ? Math.max(...this.units.map(u => u.id)) + 1 : 1;

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
          this.issues.push({
            id: this.issues.length + 1,
            importBatchId: batchId,
            unitId: iss.unitId || unitId,
            fieldName: iss.fieldName,
            issueType: iss.issueType,
            message: iss.message,
            originalValue: iss.originalValue != null ? String(iss.originalValue) : null,
            createdAt: new Date().toISOString()
          });
        }

        const unitRecord: StoredUnit = {
          id: nextUnitId++,
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
          raw: row,
          sourceRowNumber: rowNumber,
          importBatchId: batchId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (strategy === 'update') {
          const idx = this.units.findIndex(
            u => u.propertyId === normalizedPropertyId && u.unitId === unitId
          );
          if (idx !== -1) {
            this.units[idx] = {
              ...unitRecord,
              id: this.units[idx].id,
              updatedAt: new Date().toISOString()
            };
            updatedRows++;
          } else {
            this.units.push(unitRecord);
            importedRows++;
          }
        } else {
          this.units.push(unitRecord);
          importedRows++;
        }
      } catch (err) {
        failedRows++;
      }
    }

    // Populate properties
    for (const [normId, origId] of propertyMap.entries()) {
      if (!this.properties.some(p => p.normalizedPropertyId === normId)) {
        this.properties.push({
          id: this.properties.length + 1,
          normalizedPropertyId: normId,
          originalPropertyId: origId
        });
      }
    }

    batch.importedRows = importedRows;
    batch.updatedRows = updatedRows;
    batch.failedRows = failedRows;
    batch.status = 'completed';

    return {
      batchId,
      totalRows: rows.length,
      importedRows,
      updatedRows,
      skippedRows: 0,
      failedRows,
      issuesCount: this.issues.filter(iss => iss.importBatchId === batchId).length,
      status: 'completed'
    };
  }

  // --- Filter & Query Engine ---

  public filterUnits(filters: GlobalFilterParams = {}): StoredUnit[] {
    return this.units.filter(u => {
      if (filters.property && u.propertyId !== filters.property.toUpperCase()) return false;
      if (filters.block && u.blockId !== filters.block) return false;
      if (filters.floor && u.floorId !== filters.floor) return false;
      if (filters.unitType && u.unitType !== filters.unitType) return false;
      if (filters.salesStatus && u.salesUnitStatus?.toLowerCase() !== filters.salesStatus.toLowerCase()) return false;
      if (filters.revenueType && u.revenueType?.toLowerCase() !== filters.revenueType.toLowerCase()) return false;
      if (filters.currency && u.currencyCode !== filters.currency) return false;
      if (filters.minPrice !== undefined && filters.minPrice !== null && (u.saleAmount === null || u.saleAmount < filters.minPrice)) return false;
      if (filters.maxPrice !== undefined && filters.maxPrice !== null && (u.saleAmount === null || u.saleAmount > filters.maxPrice)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          (u.unitId && u.unitId.toLowerCase().includes(q)) ||
          (u.unitName && u.unitName.toLowerCase().includes(q)) ||
          (u.propertyId && u.propertyId.toLowerCase().includes(q)) ||
          (u.blockId && u.blockId.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }

  public getKPIs(filters: GlobalFilterParams = {}): DashboardKPIs {
    const matched = this.filterUnits(filters);
    const totalUnitRecords = matched.length;

    const propertySet = new Set<string>();
    const uniqueUnitSet = new Set<string>();
    let soldUnits = 0;
    let availableUnits = 0;
    let reservedUnits = 0;
    let occupiedUnits = 0;
    let vacantUnits = 0;
    let totalRecordedSaleAmount = 0;
    let totalSaleTax = 0;
    let totalAmount = 0;
    let totalUnitArea = 0;

    let soldSaleAmountSum = 0;
    let soldUnitsWithAmountCount = 0;
    let soldUnitsAreaSum = 0;

    for (const u of matched) {
      if (u.propertyId) propertySet.add(u.propertyId);
      if (u.unitId) uniqueUnitSet.add(u.unitId);

      const status = u.salesUnitStatus ? u.salesUnitStatus.toLowerCase() : '';
      if (status === 'sold') {
        soldUnits++;
        if (u.saleAmount && u.saleAmount > 0) {
          soldSaleAmountSum += u.saleAmount;
          soldUnitsWithAmountCount++;
        }
        if (u.unitArea && u.unitArea > 0 && u.saleAmount && u.saleAmount > 0) {
          soldUnitsAreaSum += u.unitArea;
        }
      } else if (status === 'available') {
        availableUnits++;
      }

      if (u.reserved === 1) reservedUnits++;
      if (u.occupied === 1) occupiedUnits++;
      if (u.vacant === 1) vacantUnits++;

      if (u.saleAmount) totalRecordedSaleAmount += u.saleAmount;
      if (u.saleTaxAmount) totalSaleTax += u.saleTaxAmount;
      if (u.totalAmount) totalAmount += u.totalAmount;
      if (u.unitArea) totalUnitArea += u.unitArea;
    }

    const avgSaleAmount = soldUnitsWithAmountCount > 0 ? soldSaleAmountSum / soldUnitsWithAmountCount : 0;
    const avgPricePerSqm = soldUnitsAreaSum > 0 ? soldSaleAmountSum / soldUnitsAreaSum : 0;

    return {
      totalProperties: propertySet.size,
      totalUnitRecords,
      uniqueUnitIds: uniqueUnitSet.size,
      soldUnits,
      availableUnits,
      reservedUnits,
      occupiedUnits,
      vacantUnits,
      totalRecordedSaleAmount: Math.round(totalRecordedSaleAmount * 100) / 100,
      totalSaleTax: Math.round(totalSaleTax * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalUnitArea: Math.round(totalUnitArea * 100) / 100,
      averageUnitSaleAmount: Math.round(avgSaleAmount * 100) / 100,
      averageSalePricePerSquareMeter: Math.round(avgPricePerSqm * 100) / 100,
      currency: filters.currency || 'SAR'
    };
  }

  public getCharts(filters: GlobalFilterParams = {}) {
    const matched = this.filterUnits(filters);

    // 1. Sales Status
    const statusMap = new Map<string, { count: number; totalAmount: number }>();
    for (const u of matched) {
      const s = u.salesUnitStatus || 'Unknown';
      const cur = statusMap.get(s) || { count: 0, totalAmount: 0 };
      cur.count++;
      cur.totalAmount += u.saleAmount || 0;
      statusMap.set(s, cur);
    }
    const salesStatus = Array.from(statusMap.entries()).map(([status, d]) => ({
      status,
      count: d.count,
      totalAmount: Math.round(d.totalAmount * 100) / 100
    }));

    // 2. By Property
    const propMap = new Map<string, { unitCount: number; soldCount: number; totalSaleAmount: number; totalArea: number }>();
    for (const u of matched) {
      const p = u.propertyId || 'Unknown';
      const cur = propMap.get(p) || { unitCount: 0, soldCount: 0, totalSaleAmount: 0, totalArea: 0 };
      cur.unitCount++;
      if (u.salesUnitStatus?.toLowerCase() === 'sold') cur.soldCount++;
      cur.totalSaleAmount += u.saleAmount || 0;
      cur.totalArea += u.unitArea || 0;
      propMap.set(p, cur);
    }
    const byProperty = Array.from(propMap.entries())
      .map(([propertyId, d]) => ({
        propertyId,
        unitCount: d.unitCount,
        soldCount: d.soldCount,
        totalSaleAmount: Math.round(d.totalSaleAmount * 100) / 100,
        totalArea: Math.round(d.totalArea * 100) / 100
      }))
      .sort((a, b) => a.propertyId.localeCompare(b.propertyId));

    // 3. By Block (top 15)
    const blockMap = new Map<string, { unitCount: number; totalSaleAmount: number }>();
    for (const u of matched) {
      const b = u.blockId || 'N/A';
      const cur = blockMap.get(b) || { unitCount: 0, totalSaleAmount: 0 };
      cur.unitCount++;
      cur.totalSaleAmount += u.saleAmount || 0;
      blockMap.set(b, cur);
    }
    const byBlock = Array.from(blockMap.entries())
      .map(([blockId, d]) => ({
        blockId,
        unitCount: d.unitCount,
        totalSaleAmount: Math.round(d.totalSaleAmount * 100) / 100
      }))
      .sort((a, b) => b.unitCount - a.unitCount)
      .slice(0, 15);

    // 4. By Floor
    const floorMap = new Map<string, { unitCount: number; totalSaleAmount: number }>();
    for (const u of matched) {
      const f = u.floorId || 'N/A';
      const cur = floorMap.get(f) || { unitCount: 0, totalSaleAmount: 0 };
      cur.unitCount++;
      cur.totalSaleAmount += u.saleAmount || 0;
      floorMap.set(f, cur);
    }
    const byFloor = Array.from(floorMap.entries())
      .map(([floorId, d]) => ({
        floorId,
        unitCount: d.unitCount,
        totalSaleAmount: Math.round(d.totalSaleAmount * 100) / 100
      }))
      .sort((a, b) => b.unitCount - a.unitCount);

    // 5. Unit Type
    const typeMap = new Map<string, { unitCount: number; totalSaleAmount: number }>();
    for (const u of matched) {
      const t = u.unitType || 'Other';
      const cur = typeMap.get(t) || { unitCount: 0, totalSaleAmount: 0 };
      cur.unitCount++;
      cur.totalSaleAmount += u.saleAmount || 0;
      typeMap.set(t, cur);
    }
    const byUnitType = Array.from(typeMap.entries()).map(([unitType, d]) => ({
      unitType,
      unitCount: d.unitCount,
      totalSaleAmount: Math.round(d.totalSaleAmount * 100) / 100
    }));

    // 6. Area Distribution bins
    const bins = {
      '< 1,000 m²': { count: 0, totalSale: 0 },
      '1,000 - 2,000 m²': { count: 0, totalSale: 0 },
      '2,000 - 3,000 m²': { count: 0, totalSale: 0 },
      '3,000 - 5,000 m²': { count: 0, totalSale: 0 },
      '> 5,000 m²': { count: 0, totalSale: 0 }
    };
    for (const u of matched) {
      const a = u.unitArea || 0;
      let binKey: keyof typeof bins = '> 5,000 m²';
      if (a < 1000) binKey = '< 1,000 m²';
      else if (a <= 2000) binKey = '1,000 - 2,000 m²';
      else if (a <= 3000) binKey = '2,000 - 3,000 m²';
      else if (a <= 5000) binKey = '3,000 - 5,000 m²';

      bins[binKey].count++;
      bins[binKey].totalSale += u.saleAmount || 0;
    }
    const areaDistribution = Object.entries(bins).map(([bin, d]) => ({
      bin,
      count: d.count,
      totalSale: Math.round(d.totalSale * 100) / 100
    }));

    const financialComparison = byProperty.map(p => ({
      propertyId: p.propertyId,
      saleAmount: p.totalSaleAmount,
      totalArea: p.totalArea,
      unitCount: p.unitCount
    }));

    return {
      salesStatus,
      byProperty,
      byBlock,
      byFloor,
      byUnitType,
      areaDistribution,
      financialComparison
    };
  }

  public getFilterOptions() {
    const propMap = new Map<string, string>();
    const blocks = new Set<string>();
    const floors = new Set<string>();
    const unitTypes = new Set<string>();
    const salesStatuses = new Set<string>();
    const revenueTypes = new Set<string>();

    for (const u of this.units) {
      if (u.propertyId) propMap.set(u.propertyId, u.propertyId);
      if (u.blockId) blocks.add(u.blockId);
      if (u.floorId) floors.add(u.floorId);
      if (u.unitType) unitTypes.add(u.unitType);
      if (u.salesUnitStatus) salesStatuses.add(u.salesUnitStatus);
      if (u.revenueType) revenueTypes.add(u.revenueType);
    }

    return {
      properties: Array.from(propMap.keys()).sort().map(p => ({ value: p, label: p })),
      blocks: Array.from(blocks).sort(),
      floors: Array.from(floors).sort(),
      unitTypes: Array.from(unitTypes).sort(),
      salesStatuses: Array.from(salesStatuses).sort(),
      revenueTypes: Array.from(revenueTypes).sort(),
      currencies: ['SAR', 'AED', 'USD']
    };
  }

  public getUnitsList(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(query.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    let matched = this.filterUnits(query);

    const sortBy = query.sortBy || 'id';
    const desc = query.sortOrder === 'desc';

    matched.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return desc ? valB - valA : valA - valB;
      }
      return desc
        ? String(valB).localeCompare(String(valA))
        : String(valA).localeCompare(String(valB));
    });

    const total = matched.length;
    const paginated = matched.slice(offset, offset + pageSize);

    const items = paginated.map(r => ({
      id: r.id,
      propertyId: r.propertyId,
      originalPropertyId: r.originalPropertyId,
      unitId: r.unitId,
      unitName: r.unitName,
      blockId: r.blockId,
      floorId: r.floorId,
      unitType: r.unitType,
      unitArea: r.unitArea,
      salesUnitStatus: r.salesUnitStatus,
      revenueType: r.revenueType,
      saleAmount: r.saleAmount,
      saleTaxAmount: r.saleTaxAmount,
      totalAmount: r.totalAmount,
      currencyCode: r.currencyCode,
      occupied: r.occupied === 1,
      reserved: r.reserved === 1,
      vacant: r.vacant === 1,
      sourceRowNumber: r.sourceRowNumber,
      importBatchId: r.importBatchId,
      raw: r.raw
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  public getUnitById(idOrUnitId: string | number): StoredUnit | null {
    if (!isNaN(Number(idOrUnitId))) {
      const byId = this.units.find(u => u.id === Number(idOrUnitId));
      if (byId) return byId;
    }
    return this.units.find(u => u.unitId === String(idOrUnitId)) || null;
  }

  public getAllProperties() {
    const propMap = new Map<string, {
      normalizedPropertyId: string;
      originalPropertyId: string;
      totalUnits: number;
      uniqueUnits: Set<string>;
      soldUnits: number;
      availableUnits: number;
      recordedSalesValue: number;
      totalArea: number;
      totalAmount: number;
      totalTax: number;
    }>();

    for (const u of this.units) {
      const p = u.propertyId;
      let cur = propMap.get(p);
      if (!cur) {
        cur = {
          normalizedPropertyId: p,
          originalPropertyId: u.originalPropertyId,
          totalUnits: 0,
          uniqueUnits: new Set<string>(),
          soldUnits: 0,
          availableUnits: 0,
          recordedSalesValue: 0,
          totalArea: 0,
          totalAmount: 0,
          totalTax: 0
        };
        propMap.set(p, cur);
      }
      cur.totalUnits++;
      if (u.unitId) cur.uniqueUnits.add(u.unitId);
      if (u.salesUnitStatus?.toLowerCase() === 'sold') cur.soldUnits++;
      if (u.salesUnitStatus?.toLowerCase() === 'available') cur.availableUnits++;
      cur.recordedSalesValue += u.saleAmount || 0;
      cur.totalArea += u.unitArea || 0;
      cur.totalAmount += u.totalAmount || 0;
      cur.totalTax += u.saleTaxAmount || 0;
    }

    return Array.from(propMap.values()).map((p, idx) => {
      const soldPct = p.totalUnits > 0 ? (p.soldUnits / p.totalUnits) * 100 : 0;
      const avgPricePerSqm = p.totalArea > 0 ? p.recordedSalesValue / p.totalArea : 0;
      return {
        id: idx + 1,
        normalizedPropertyId: p.normalizedPropertyId,
        originalPropertyId: p.originalPropertyId,
        totalUnits: p.totalUnits,
        uniqueUnits: p.uniqueUnits.size,
        soldUnits: p.soldUnits,
        availableUnits: p.availableUnits,
        recordedSalesValue: Math.round(p.recordedSalesValue * 100) / 100,
        totalArea: Math.round(p.totalArea * 100) / 100,
        totalAmount: Math.round(p.totalAmount * 100) / 100,
        totalTax: Math.round(p.totalTax * 100) / 100,
        salesPercentage: Math.round(soldPct * 10) / 10,
        avgPricePerSqm: Math.round(avgPricePerSqm * 100) / 100
      };
    }).sort((a, b) => a.normalizedPropertyId.localeCompare(b.normalizedPropertyId));
  }

  public getPropertyDetails(propertyId: string) {
    const normId = propertyId.toUpperCase();
    const propUnits = this.units.filter(u => u.propertyId === normId);
    if (propUnits.length === 0) return null;

    const totalUnits = propUnits.length;
    const uniqueUnits = new Set(propUnits.map(u => u.unitId)).size;
    const soldUnits = propUnits.filter(u => u.salesUnitStatus?.toLowerCase() === 'sold').length;
    const availableUnits = propUnits.filter(u => u.salesUnitStatus?.toLowerCase() === 'available').length;
    const occupiedUnits = propUnits.filter(u => u.occupied === 1).length;
    const vacantUnits = propUnits.filter(u => u.vacant === 1).length;
    const reservedUnits = propUnits.filter(u => u.reserved === 1).length;

    let totalSaleAmount = 0;
    let totalTaxAmount = 0;
    let totalOverallAmount = 0;
    let totalArea = 0;

    const blockCounts: Record<string, number> = {};
    const floorCounts: Record<string, number> = {};
    const unitTypeCounts: Record<string, number> = {};

    let swimmingPoolCount = 0;
    let balconyCount = 0;
    let basementParkingCount = 0;
    let outsideParkingCount = 0;
    let maidRoomCount = 0;
    let validMaintenanceDatesCount = 0;

    for (const u of propUnits) {
      totalSaleAmount += u.saleAmount || 0;
      totalTaxAmount += u.saleTaxAmount || 0;
      totalOverallAmount += u.totalAmount || 0;
      totalArea += u.unitArea || 0;

      const b = u.blockId || 'Unknown';
      blockCounts[b] = (blockCounts[b] || 0) + 1;
      const f = u.floorId || 'Unknown';
      floorCounts[f] = (floorCounts[f] || 0) + 1;
      const t = u.unitType || 'Unknown';
      unitTypeCounts[t] = (unitTypeCounts[t] || 0) + 1;

      const raw = u.raw || {};
      if (String(raw.SWIMMINGPOOL).toLowerCase() === 'yes') swimmingPoolCount++;
      if (String(raw.BALCONY).toLowerCase() === 'yes') balconyCount++;
      if (String(raw.PARKINGBASEMENT).toLowerCase() === 'yes') basementParkingCount++;
      if (String(raw.PARKINGOUTSIDE).toLowerCase() === 'yes') outsideParkingCount++;
      if (String(raw.MAIDROOM).toLowerCase() === 'yes') maidRoomCount++;
      if (raw.LASTMAINTENANCEDATE && !String(raw.LASTMAINTENANCEDATE).includes('1900-01-01')) {
        validMaintenanceDatesCount++;
      }
    }

    const avgSalePrice = soldUnits > 0 ? totalSaleAmount / soldUnits : 0;
    const avgPricePerSqm = totalArea > 0 ? totalSaleAmount / totalArea : 0;

    return {
      property: {
        id: 1,
        normalizedPropertyId: normId,
        originalPropertyId: propUnits[0].originalPropertyId
      },
      overview: {
        totalUnits,
        uniqueUnits,
        soldUnits,
        availableUnits,
        occupiedUnits,
        vacantUnits,
        reservedUnits,
        salesPercentage: totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 1000) / 10 : 0
      },
      financials: {
        totalSaleAmount: Math.round(totalSaleAmount * 100) / 100,
        totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
        totalOverallAmount: Math.round(totalOverallAmount * 100) / 100,
        totalArea: Math.round(totalArea * 100) / 100,
        avgSalePrice: Math.round(avgSalePrice * 100) / 100,
        avgPricePerSqm: Math.round(avgPricePerSqm * 100) / 100,
        currency: propUnits[0]?.currencyCode || 'SAR'
      },
      blocks: Object.entries(blockCounts).map(([blockId, count]) => ({ blockId, count })),
      floors: Object.entries(floorCounts).map(([floorId, count]) => ({ floorId, count })),
      unitTypes: Object.entries(unitTypeCounts).map(([unitType, count]) => ({ unitType, count })),
      facilities: {
        swimmingPoolCount,
        balconyCount,
        basementParkingCount,
        outsideParkingCount,
        maidRoomCount
      },
      maintenance: {
        validMaintenanceDatesCount,
        totalRecords: totalUnits
      },
      sampleUnits: propUnits.slice(0, 50).map(u => ({
        id: u.id,
        unitId: u.unitId,
        unitName: u.unitName,
        blockId: u.blockId,
        floorId: u.floorId,
        unitArea: u.unitArea,
        salesUnitStatus: u.salesUnitStatus,
        saleAmount: u.saleAmount,
        currencyCode: u.currencyCode
      }))
    };
  }

  // --- Analytics ---

  public getSalesAnalytics(filters: GlobalFilterParams = {}) {
    const matched = this.filterUnits(filters);

    let totalSaleValue = 0;
    let soldUnitsCount = 0;
    let soldSaleSum = 0;
    let soldAreaSum = 0;
    let totalSaleTax = 0;
    let zeroSaleCount = 0;

    for (const u of matched) {
      if (u.salesUnitStatus?.toLowerCase() === 'sold') {
        soldUnitsCount++;
        const amt = u.saleAmount || 0;
        soldSaleSum += amt;
        if (u.unitArea && u.unitArea > 0 && amt > 0) {
          soldAreaSum += u.unitArea;
        }
      }
      totalSaleValue += u.saleAmount || 0;
      totalSaleTax += u.saleTaxAmount || 0;
      if (!u.saleAmount || u.saleAmount === 0) {
        zeroSaleCount++;
      }
    }

    const avgSaleAmount = soldUnitsCount > 0 ? soldSaleSum / soldUnitsCount : 0;
    const avgPricePerSqm = soldAreaSum > 0 ? soldSaleSum / soldAreaSum : 0;

    // By Property
    const propMap = new Map<string, { salesCount: number; totalAmount: number; totalSoldSum: number }>();
    for (const u of matched) {
      const p = u.propertyId || 'Unknown';
      const cur = propMap.get(p) || { salesCount: 0, totalAmount: 0, totalSoldSum: 0 };
      if (u.salesUnitStatus?.toLowerCase() === 'sold') {
        cur.salesCount++;
        cur.totalSoldSum += u.saleAmount || 0;
      }
      cur.totalAmount += u.saleAmount || 0;
      propMap.set(p, cur);
    }
    const byProperty = Array.from(propMap.entries())
      .map(([propertyId, d]) => ({
        propertyId,
        salesCount: d.salesCount,
        totalAmount: Math.round(d.totalAmount * 100) / 100,
        avgAmount: d.salesCount > 0 ? Math.round((d.totalSoldSum / d.salesCount) * 100) / 100 : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // By Block (Top 12)
    const blockMap = new Map<string, { salesCount: number; totalAmount: number }>();
    for (const u of matched) {
      const b = u.blockId || 'N/A';
      const cur = blockMap.get(b) || { salesCount: 0, totalAmount: 0 };
      if (u.salesUnitStatus?.toLowerCase() === 'sold') cur.salesCount++;
      cur.totalAmount += u.saleAmount || 0;
      blockMap.set(b, cur);
    }
    const byBlock = Array.from(blockMap.entries())
      .map(([blockId, d]) => ({
        blockId,
        salesCount: d.salesCount,
        totalAmount: Math.round(d.totalAmount * 100) / 100
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 12);

    // By Floor
    const floorMap = new Map<string, { salesCount: number; totalAmount: number }>();
    for (const u of matched) {
      const f = u.floorId || 'N/A';
      const cur = floorMap.get(f) || { salesCount: 0, totalAmount: 0 };
      if (u.salesUnitStatus?.toLowerCase() === 'sold') cur.salesCount++;
      cur.totalAmount += u.saleAmount || 0;
      floorMap.set(f, cur);
    }
    const byFloor = Array.from(floorMap.entries())
      .map(([floorId, d]) => ({
        floorId,
        salesCount: d.salesCount,
        totalAmount: Math.round(d.totalAmount * 100) / 100
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // By Unit Type
    const typeMap = new Map<string, { salesCount: number; totalAmount: number }>();
    for (const u of matched) {
      const t = u.unitType || 'Other';
      const cur = typeMap.get(t) || { salesCount: 0, totalAmount: 0 };
      if (u.salesUnitStatus?.toLowerCase() === 'sold') cur.salesCount++;
      cur.totalAmount += u.saleAmount || 0;
      typeMap.set(t, cur);
    }
    const byUnitType = Array.from(typeMap.entries()).map(([unitType, d]) => ({
      unitType,
      salesCount: d.salesCount,
      totalAmount: Math.round(d.totalAmount * 100) / 100
    }));

    // Top 10 Units by saleAmount > 0
    const validSales = matched.filter(u => u.saleAmount && u.saleAmount > 0);
    const topUnits = [...validSales]
      .sort((a, b) => (b.saleAmount || 0) - (a.saleAmount || 0))
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        propertyId: u.propertyId,
        unitId: u.unitId,
        unitName: u.unitName,
        blockId: u.blockId,
        floorId: u.floorId,
        unitArea: u.unitArea,
        saleAmount: u.saleAmount,
        salesUnitStatus: u.salesUnitStatus,
        currencyCode: u.currencyCode
      }));

    const lowestUnits = [...validSales]
      .sort((a, b) => (a.saleAmount || 0) - (b.saleAmount || 0))
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        propertyId: u.propertyId,
        unitId: u.unitId,
        unitName: u.unitName,
        blockId: u.blockId,
        floorId: u.floorId,
        unitArea: u.unitArea,
        saleAmount: u.saleAmount,
        salesUnitStatus: u.salesUnitStatus,
        currencyCode: u.currencyCode
      }));

    return {
      totals: {
        totalSaleValue: Math.round(totalSaleValue * 100) / 100,
        soldUnitsCount,
        avgSaleAmount: Math.round(avgSaleAmount * 100) / 100,
        avgPricePerSqm: Math.round(avgPricePerSqm * 100) / 100,
        totalSaleTax: Math.round(totalSaleTax * 100) / 100,
        zeroSaleCount
      },
      byProperty,
      byBlock,
      byFloor,
      byUnitType,
      topUnits,
      lowestUnits
    };
  }

  public getFinancialAnalytics(filters: GlobalFilterParams = {}) {
    const matched = this.filterUnits(filters);

    let totalSale = 0;
    let totalTax = 0;
    let totalOverall = 0;
    let validSaleSum = 0;
    let validSaleCount = 0;

    for (const u of matched) {
      totalSale += u.saleAmount || 0;
      totalTax += u.saleTaxAmount || 0;
      totalOverall += u.totalAmount || 0;
      if (u.saleAmount && u.saleAmount > 0) {
        validSaleSum += u.saleAmount;
        validSaleCount++;
      }
    }

    const avgSale = validSaleCount > 0 ? validSaleSum / validSaleCount : 0;

    // Property Ranking
    const propMap = new Map<string, { totalSale: number; totalTax: number; totalOverall: number; unitCount: number }>();
    for (const u of matched) {
      const p = u.propertyId || 'Unknown';
      const cur = propMap.get(p) || { totalSale: 0, totalTax: 0, totalOverall: 0, unitCount: 0 };
      cur.totalSale += u.saleAmount || 0;
      cur.totalTax += u.saleTaxAmount || 0;
      cur.totalOverall += u.totalAmount || 0;
      cur.unitCount++;
      propMap.set(p, cur);
    }
    const propertyRanking = Array.from(propMap.entries())
      .map(([propertyId, d]) => ({
        propertyId,
        totalSale: Math.round(d.totalSale * 100) / 100,
        totalTax: Math.round(d.totalTax * 100) / 100,
        totalOverall: Math.round(d.totalOverall * 100) / 100,
        unitCount: d.unitCount
      }))
      .sort((a, b) => b.totalSale - a.totalSale);

    // Revenue breakdown
    const revMap = new Map<string, { count: number; totalSale: number }>();
    for (const u of matched) {
      const r = u.revenueType || 'Unknown';
      const cur = revMap.get(r) || { count: 0, totalSale: 0 };
      cur.count++;
      cur.totalSale += u.saleAmount || 0;
      revMap.set(r, cur);
    }
    const revenueBreakdown = Array.from(revMap.entries()).map(([revenueType, d]) => ({
      revenueType,
      count: d.count,
      totalSale: Math.round(d.totalSale * 100) / 100
    }));

    // Currency breakdown
    const curMap = new Map<string, { count: number; totalSale: number }>();
    for (const u of matched) {
      const c = u.currencyCode || 'SAR';
      const cur = curMap.get(c) || { count: 0, totalSale: 0 };
      cur.count++;
      cur.totalSale += u.saleAmount || 0;
      curMap.set(c, cur);
    }
    const currencyBreakdown = Array.from(curMap.entries()).map(([currency, d]) => ({
      currency,
      count: d.count,
      totalSale: Math.round(d.totalSale * 100) / 100
    }));

    // Anomalies
    const anomalies = matched
      .filter(u => {
        const isSold = u.salesUnitStatus?.toLowerCase() === 'sold';
        const hasNoSale = u.saleAmount === null || u.saleAmount === 0;
        const negativeSale = (u.saleAmount || 0) < 0;
        return (isSold && hasNoSale) || negativeSale;
      })
      .slice(0, 20)
      .map(u => ({
        id: u.id,
        propertyId: u.propertyId,
        unitId: u.unitId,
        salesUnitStatus: u.salesUnitStatus,
        saleAmount: u.saleAmount,
        totalAmount: u.totalAmount,
        saleTaxAmount: u.saleTaxAmount
      }));

    return {
      totals: {
        totalSale: Math.round(totalSale * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalOverall: Math.round(totalOverall * 100) / 100,
        avgSale: Math.round(avgSale * 100) / 100
      },
      propertyRanking,
      revenueBreakdown,
      currencyBreakdown,
      anomalies
    };
  }

  public getInventoryAnalytics(filters: GlobalFilterParams = {}) {
    const matched = this.filterUnits(filters);

    let soldUnits = 0;
    let availableUnits = 0;
    let reservedUnits = 0;
    let occupiedUnits = 0;
    let vacantUnits = 0;

    for (const u of matched) {
      const s = u.salesUnitStatus?.toLowerCase();
      if (s === 'sold') soldUnits++;
      if (s === 'available') availableUnits++;
      if (u.reserved === 1) reservedUnits++;
      if (u.occupied === 1) occupiedUnits++;
      if (u.vacant === 1) vacantUnits++;
    }

    const counts = {
      totalUnits: matched.length,
      soldUnits,
      availableUnits,
      reservedUnits,
      occupiedUnits,
      vacantUnits
    };

    // By Property
    const propMap = new Map<string, { total: number; sold: number; available: number }>();
    for (const u of matched) {
      const p = u.propertyId || 'Unknown';
      const cur = propMap.get(p) || { total: 0, sold: 0, available: 0 };
      cur.total++;
      if (u.salesUnitStatus?.toLowerCase() === 'sold') cur.sold++;
      if (u.salesUnitStatus?.toLowerCase() === 'available') cur.available++;
      propMap.set(p, cur);
    }
    const byProperty = Array.from(propMap.entries()).map(([propertyId, d]) => ({
      propertyId,
      total: d.total,
      sold: d.sold,
      available: d.available
    }));

    // By Block (Top 12)
    const blockMap = new Map<string, { total: number; sold: number; available: number }>();
    for (const u of matched) {
      const b = u.blockId || 'N/A';
      const cur = blockMap.get(b) || { total: 0, sold: 0, available: 0 };
      cur.total++;
      if (u.salesUnitStatus?.toLowerCase() === 'sold') cur.sold++;
      if (u.salesUnitStatus?.toLowerCase() === 'available') cur.available++;
      blockMap.set(b, cur);
    }
    const byBlock = Array.from(blockMap.entries())
      .map(([blockId, d]) => ({
        blockId,
        total: d.total,
        sold: d.sold,
        available: d.available
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);

    // By Floor
    const floorMap = new Map<string, { total: number; sold: number; available: number }>();
    for (const u of matched) {
      const f = u.floorId || 'N/A';
      const cur = floorMap.get(f) || { total: 0, sold: 0, available: 0 };
      cur.total++;
      if (u.salesUnitStatus?.toLowerCase() === 'sold') cur.sold++;
      if (u.salesUnitStatus?.toLowerCase() === 'available') cur.available++;
      floorMap.set(f, cur);
    }
    const byFloor = Array.from(floorMap.entries())
      .map(([floorId, d]) => ({
        floorId,
        total: d.total,
        sold: d.sold,
        available: d.available
      }))
      .sort((a, b) => b.total - a.total);

    // Conflicting status flags
    const conflicting = matched
      .filter(u => u.occupied === 1 && u.vacant === 1)
      .slice(0, 20)
      .map(u => ({
        id: u.id,
        propertyId: u.propertyId,
        unitId: u.unitId,
        occupied: u.occupied,
        vacant: u.vacant,
        reserved: u.reserved,
        salesUnitStatus: u.salesUnitStatus
      }));

    return {
      counts,
      byProperty,
      byBlock,
      byFloor,
      conflicting
    };
  }

  // --- Data Explorer ---

  public getDataExplorerRecords(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(query.pageSize) || 25));
    const search = query.search ? String(query.search).trim().toLowerCase() : '';
    const filterField = query.filterField ? String(query.filterField) : '';
    const filterValue = query.filterValue ? String(query.filterValue).trim().toLowerCase() : '';

    let list = this.units.map(u => ({
      _dbId: u.id,
      _sourceRowNumber: u.sourceRowNumber,
      ...u.raw
    }));

    if (filterField && filterValue) {
      list = list.filter(row => {
        const val = row[filterField];
        return val != null && String(val).toLowerCase().includes(filterValue);
      });
    }

    if (search) {
      list = list.filter(row =>
        Object.values(row).some(v => v != null && String(v).toLowerCase().includes(search))
      );
    }

    const total = list.length;
    const start = (page - 1) * pageSize;
    const paginated = list.slice(start, start + pageSize);

    return {
      records: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  public getDataExplorerSchema() {
    const totalRecords = this.units.length;
    const columnStats: Record<string, {
      field: string;
      nullCount: number;
      emptyCount: number;
      nonEmptyCount: number;
      sampleValues: Set<string>;
      inferredType: string;
    }> = {};

    EXPECTED_92_COLUMNS.forEach(col => {
      columnStats[col] = {
        field: col,
        nullCount: 0,
        emptyCount: 0,
        nonEmptyCount: 0,
        sampleValues: new Set<string>(),
        inferredType: 'string'
      };
    });

    for (const u of this.units) {
      const raw = u.raw || {};
      EXPECTED_92_COLUMNS.forEach(col => {
        const val = raw[col];
        const stat = columnStats[col];
        if (val === null || val === undefined) {
          stat.nullCount++;
        } else if (val === '' || String(val).trim() === '') {
          stat.emptyCount++;
        } else {
          stat.nonEmptyCount++;
          if (stat.sampleValues.size < 5) {
            stat.sampleValues.add(String(val));
          }
        }
      });
    }

    return EXPECTED_92_COLUMNS.map(col => {
      const s = columnStats[col];
      const missingTotal = s.nullCount + s.emptyCount;
      const completeness = totalRecords > 0 ? Math.round(((totalRecords - missingTotal) / totalRecords) * 1000) / 10 : 0;
      return {
        field: col,
        label: col.replace(/_/g, ' '),
        nullCount: s.nullCount,
        emptyCount: s.emptyCount,
        nonEmptyCount: s.nonEmptyCount,
        totalRecords,
        completeness,
        sampleValues: Array.from(s.sampleValues)
      };
    });
  }

  // --- Auth & Users ---

  public findUserByEmail(email: string): StoredUser | null {
    const clean = String(email).trim().toLowerCase();
    return this.users.find(u => u.email === clean) || null;
  }

  public createUser(name: string, email: string, passwordHash: string, role: string = 'manager'): StoredUser {
    const clean = String(email).trim().toLowerCase();
    const newUser: StoredUser = {
      id: this.users.length + 1,
      name,
      email: clean,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Batches & Issues ---

  public getBatches() {
    return [...this.batches].reverse();
  }

  public getBatchById(id: number) {
    return this.batches.find(b => b.id === id) || null;
  }

  public getBatchIssues(batchId: number) {
    return this.issues.filter(i => i.importBatchId === batchId);
  }

  public rollbackBatch(batchId: number) {
    const batch = this.getBatchById(batchId);
    if (!batch) throw new Error(`Batch ID ${batchId} not found.`);
    if (batch.status === 'rolled_back') throw new Error(`Batch ID ${batchId} already rolled back.`);

    this.units = this.units.filter(u => u.importBatchId !== batchId);
    this.issues = this.issues.filter(i => i.importBatchId !== batchId);
    batch.status = 'rolled_back';

    // Cleanup empty properties
    const remainingPropIds = new Set(this.units.map(u => u.propertyId));
    this.properties = this.properties.filter(p => remainingPropIds.has(p.normalizedPropertyId));

    return { success: true, message: `Batch ${batchId} rolled back successfully.` };
  }
}

export const DataStore = new InMemDataStore();

