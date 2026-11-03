import { db } from '../database';
import { units, properties } from '../database/schema';
import { sql, and, eq, gte, lte, like } from 'drizzle-orm';
import type { GlobalFilterParams, DashboardKPIs } from '../../shared/types';

export class DashboardService {
  /**
   * Build WHERE clauses based on global filter parameters
   */
  static buildFilterConditions(filters: GlobalFilterParams = {}) {
    const conditions = [];

    if (filters.property) {
      conditions.push(eq(units.propertyId, filters.property.toUpperCase()));
    }
    if (filters.block) {
      conditions.push(eq(units.blockId, filters.block));
    }
    if (filters.floor) {
      conditions.push(eq(units.floorId, filters.floor));
    }
    if (filters.unitType) {
      conditions.push(eq(units.unitType, filters.unitType));
    }
    if (filters.salesStatus) {
      conditions.push(sql`LOWER(${units.salesUnitStatus}) = LOWER(${filters.salesStatus})`);
    }
    if (filters.revenueType) {
      conditions.push(sql`LOWER(${units.revenueType}) = LOWER(${filters.revenueType})`);
    }
    if (filters.currency) {
      conditions.push(eq(units.currencyCode, filters.currency));
    }
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      conditions.push(gte(units.saleAmount, filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      conditions.push(lte(units.saleAmount, filters.maxPrice));
    }
    if (filters.search) {
      const q = `%${filters.search}%`;
      conditions.push(sql`(${units.unitId} LIKE ${q} OR ${units.unitName} LIKE ${q} OR ${units.propertyId} LIKE ${q} OR ${units.blockId} LIKE ${q})`);
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  /**
   * Get 14 Executive KPIs
   */
  static async getKPIs(filters: GlobalFilterParams = {}): Promise<DashboardKPIs> {
    const where = this.buildFilterConditions(filters);

    const result = await db.select({
      totalProperties: sql<number>`COUNT(DISTINCT ${units.propertyId})`,
      totalUnitRecords: sql<number>`COUNT(*)`,
      uniqueUnitIds: sql<number>`COUNT(DISTINCT ${units.unitId})`,
      soldUnits: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      availableUnits: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'available' THEN 1 END)`,
      reservedUnits: sql<number>`COUNT(CASE WHEN ${units.reserved} = 1 THEN 1 END)`,
      occupiedUnits: sql<number>`COUNT(CASE WHEN ${units.occupied} = 1 THEN 1 END)`,
      vacantUnits: sql<number>`COUNT(CASE WHEN ${units.vacant} = 1 THEN 1 END)`,
      totalRecordedSaleAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`,
      totalSaleTax: sql<number>`COALESCE(SUM(${units.saleTaxAmount}), 0)`,
      totalAmount: sql<number>`COALESCE(SUM(${units.totalAmount}), 0)`,
      totalUnitArea: sql<number>`COALESCE(SUM(${units.unitArea}), 0)`,
      avgSaleAmount: sql<number>`COALESCE(AVG(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' AND ${units.saleAmount} > 0 THEN ${units.saleAmount} END), 0)`,
      avgPricePerSqm: sql<number>`COALESCE(SUM(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' AND ${units.unitArea} > 0 THEN ${units.saleAmount} END) / NULLIF(SUM(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' AND ${units.unitArea} > 0 THEN ${units.unitArea} END), 0), 0)`
    }).from(units).where(where).get();

    return {
      totalProperties: result?.totalProperties || 0,
      totalUnitRecords: result?.totalUnitRecords || 0,
      uniqueUnitIds: result?.uniqueUnitIds || 0,
      soldUnits: result?.soldUnits || 0,
      availableUnits: result?.availableUnits || 0,
      reservedUnits: result?.reservedUnits || 0,
      occupiedUnits: result?.occupiedUnits || 0,
      vacantUnits: result?.vacantUnits || 0,
      totalRecordedSaleAmount: Math.round((result?.totalRecordedSaleAmount || 0) * 100) / 100,
      totalSaleTax: Math.round((result?.totalSaleTax || 0) * 100) / 100,
      totalAmount: Math.round((result?.totalAmount || 0) * 100) / 100,
      totalUnitArea: Math.round((result?.totalUnitArea || 0) * 100) / 100,
      averageUnitSaleAmount: Math.round((result?.avgSaleAmount || 0) * 100) / 100,
      averageSalePricePerSquareMeter: Math.round((result?.avgPricePerSqm || 0) * 100) / 100,
      currency: filters.currency || 'SAR'
    };
  }

  /**
   * Get chart aggregations
   */
  static async getCharts(filters: GlobalFilterParams = {}) {
    const where = this.buildFilterConditions(filters);

    // 1. Sold vs Available
    const statusData = await db.select({
      status: sql<string>`COALESCE(${units.salesUnitStatus}, 'Unknown')`,
      count: sql<number>`COUNT(*)`,
      totalAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.salesUnitStatus).all();

    // 2. Units & Sales by Property
    const propertyData = await db.select({
      propertyId: units.propertyId,
      unitCount: sql<number>`COUNT(*)`,
      soldCount: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      totalSaleAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`,
      totalArea: sql<number>`COALESCE(SUM(${units.unitArea}), 0)`
    }).from(units).where(where).groupBy(units.propertyId).orderBy(units.propertyId).all();

    // 3. Units by Block (top 15)
    const blockData = await db.select({
      blockId: sql<string>`COALESCE(${units.blockId}, 'N/A')`,
      unitCount: sql<number>`COUNT(*)`,
      totalSaleAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.blockId).orderBy(sql`COUNT(*) DESC`).limit(15).all();

    // 4. Units by Floor
    const floorData = await db.select({
      floorId: sql<string>`COALESCE(${units.floorId}, 'N/A')`,
      unitCount: sql<number>`COUNT(*)`,
      totalSaleAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.floorId).orderBy(sql`COUNT(*) DESC`).all();

    // 5. Unit Type distribution
    const unitTypeData = await db.select({
      unitType: sql<string>`COALESCE(${units.unitType}, 'Other')`,
      unitCount: sql<number>`COUNT(*)`,
      totalSaleAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.unitType).all();

    // 6. Unit Area Distribution (bins)
    const areaBins = await db.select({
      bin: sql<string>`
        CASE 
          WHEN ${units.unitArea} < 1000 THEN '< 1,000 m²'
          WHEN ${units.unitArea} BETWEEN 1000 AND 2000 THEN '1,000 - 2,000 m²'
          WHEN ${units.unitArea} BETWEEN 2000 AND 3000 THEN '2,000 - 3,000 m²'
          WHEN ${units.unitArea} BETWEEN 3000 AND 5000 THEN '3,000 - 5,000 m²'
          ELSE '> 5,000 m²'
        END
      `,
      count: sql<number>`COUNT(*)`,
      totalSale: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(sql`1`).all();

    // 7. Property financial comparison (Sale vs Total vs Tax)
    const financialComparison = propertyData.map(p => ({
      propertyId: p.propertyId,
      saleAmount: Math.round(p.totalSaleAmount),
      totalArea: Math.round(p.totalArea),
      unitCount: p.unitCount
    }));

    return {
      salesStatus: statusData,
      byProperty: propertyData,
      byBlock: blockData,
      byFloor: floorData,
      byUnitType: unitTypeData,
      areaDistribution: areaBins,
      financialComparison
    };
  }

  /**
   * Get distinct filter options for dropdowns
   */
  static async getFilterOptions() {
    const props = await db.select({ value: properties.normalizedPropertyId, label: properties.normalizedPropertyId }).from(properties).orderBy(properties.normalizedPropertyId).all();
    const blocks = await db.select({ value: units.blockId }).from(units).where(sql`${units.blockId} IS NOT NULL`).groupBy(units.blockId).orderBy(units.blockId).all();
    const floors = await db.select({ value: units.floorId }).from(units).where(sql`${units.floorId} IS NOT NULL`).groupBy(units.floorId).orderBy(units.floorId).all();
    const unitTypes = await db.select({ value: units.unitType }).from(units).where(sql`${units.unitType} IS NOT NULL`).groupBy(units.unitType).orderBy(units.unitType).all();
    const salesStatuses = await db.select({ value: units.salesUnitStatus }).from(units).where(sql`${units.salesUnitStatus} IS NOT NULL`).groupBy(units.salesUnitStatus).all();
    const revenueTypes = await db.select({ value: units.revenueType }).from(units).where(sql`${units.revenueType} IS NOT NULL`).groupBy(units.revenueType).all();

    return {
      properties: props,
      blocks: blocks.map(b => b.value),
      floors: floors.map(f => f.value),
      unitTypes: unitTypes.map(u => u.value),
      salesStatuses: salesStatuses.map(s => s.value),
      revenueTypes: revenueTypes.map(r => r.value),
      currencies: ['SAR', 'AED', 'USD']
    };
  }
}

