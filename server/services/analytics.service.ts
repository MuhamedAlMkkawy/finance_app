import { db } from '../database';
import { units, properties } from '../database/schema';
import { sql, and, eq, gte, lte, desc, asc } from 'drizzle-orm';
import { DashboardService } from './dashboard.service';
import type { GlobalFilterParams } from '../../shared/types';

export class AnalyticsService {
  /**
   * Module D: Sales Analytics
   */
  static async getSalesAnalytics(filters: GlobalFilterParams = {}) {
    const where = DashboardService.buildFilterConditions(filters);

    // High level metrics
    const totals = await db.select({
      totalSaleValue: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`,
      soldUnitsCount: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      avgSaleAmount: sql<number>`COALESCE(AVG(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' AND ${units.saleAmount} > 0 THEN ${units.saleAmount} END), 0)`,
      avgPricePerSqm: sql<number>`COALESCE(SUM(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' AND ${units.unitArea} > 0 THEN ${units.saleAmount} END) / NULLIF(SUM(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' AND ${units.unitArea} > 0 THEN ${units.unitArea} END), 0), 0)`,
      totalSaleTax: sql<number>`COALESCE(SUM(${units.saleTaxAmount}), 0)`,
      zeroSaleCount: sql<number>`COUNT(CASE WHEN (${units.saleAmount} IS NULL OR ${units.saleAmount} = 0) THEN 1 END)`
    }).from(units).where(where).get();

    // Sales by Property
    const byProperty = await db.select({
      propertyId: units.propertyId,
      salesCount: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      totalAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`,
      avgAmount: sql<number>`COALESCE(AVG(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' AND ${units.saleAmount} > 0 THEN ${units.saleAmount} END), 0)`
    }).from(units).where(where).groupBy(units.propertyId).orderBy(sql`SUM(${units.saleAmount}) DESC`).all();

    // Sales by Block (Top 12)
    const byBlock = await db.select({
      blockId: sql<string>`COALESCE(${units.blockId}, 'N/A')`,
      salesCount: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      totalAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.blockId).orderBy(sql`SUM(${units.saleAmount}) DESC`).limit(12).all();

    // Sales by Floor
    const byFloor = await db.select({
      floorId: sql<string>`COALESCE(${units.floorId}, 'N/A')`,
      salesCount: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      totalAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.floorId).orderBy(sql`SUM(${units.saleAmount}) DESC`).all();

    // Sales by Unit Type
    const byUnitType = await db.select({
      unitType: sql<string>`COALESCE(${units.unitType}, 'Other')`,
      salesCount: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      totalAmount: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.unitType).all();

    // Top 10 Highest Value Units
    const topUnits = await db.select({
      id: units.id,
      propertyId: units.propertyId,
      unitId: units.unitId,
      unitName: units.unitName,
      blockId: units.blockId,
      floorId: units.floorId,
      unitArea: units.unitArea,
      saleAmount: units.saleAmount,
      salesUnitStatus: units.salesUnitStatus,
      currencyCode: units.currencyCode
    }).from(units).where(and(where, sql`${units.saleAmount} > 0`)).orderBy(desc(units.saleAmount)).limit(10).all();

    // Bottom 10 Lowest Value Units (above 0)
    const lowestUnits = await db.select({
      id: units.id,
      propertyId: units.propertyId,
      unitId: units.unitId,
      unitName: units.unitName,
      blockId: units.blockId,
      floorId: units.floorId,
      unitArea: units.unitArea,
      saleAmount: units.saleAmount,
      salesUnitStatus: units.salesUnitStatus,
      currencyCode: units.currencyCode
    }).from(units).where(and(where, sql`${units.saleAmount} > 0`)).orderBy(asc(units.saleAmount)).limit(10).all();

    return {
      totals: {
        totalSaleValue: Math.round((totals?.totalSaleValue || 0) * 100) / 100,
        soldUnitsCount: totals?.soldUnitsCount || 0,
        avgSaleAmount: Math.round((totals?.avgSaleAmount || 0) * 100) / 100,
        avgPricePerSqm: Math.round((totals?.avgPricePerSqm || 0) * 100) / 100,
        totalSaleTax: Math.round((totals?.totalSaleTax || 0) * 100) / 100,
        zeroSaleCount: totals?.zeroSaleCount || 0
      },
      byProperty,
      byBlock,
      byFloor,
      byUnitType,
      topUnits,
      lowestUnits
    };
  }

  /**
   * Module E: Financial Analytics
   */
  static async getFinancialAnalytics(filters: GlobalFilterParams = {}) {
    const where = DashboardService.buildFilterConditions(filters);

    // Sum of amounts
    const totals = await db.select({
      totalSale: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`,
      totalTax: sql<number>`COALESCE(SUM(${units.saleTaxAmount}), 0)`,
      totalOverall: sql<number>`COALESCE(SUM(${units.totalAmount}), 0)`,
      avgSale: sql<number>`COALESCE(AVG(CASE WHEN ${units.saleAmount} > 0 THEN ${units.saleAmount} END), 0)`
    }).from(units).where(where).get();

    // Property Financial Ranking
    const propertyRanking = await db.select({
      propertyId: units.propertyId,
      totalSale: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`,
      totalTax: sql<number>`COALESCE(SUM(${units.saleTaxAmount}), 0)`,
      totalOverall: sql<number>`COALESCE(SUM(${units.totalAmount}), 0)`,
      unitCount: sql<number>`COUNT(*)`
    }).from(units).where(where).groupBy(units.propertyId).orderBy(desc(sql`SUM(${units.saleAmount})`)).all();

    // Revenue Type Breakdown
    const revenueBreakdown = await db.select({
      revenueType: sql<string>`COALESCE(${units.revenueType}, 'Unknown')`,
      count: sql<number>`COUNT(*)`,
      totalSale: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.revenueType).all();

    // Currency breakdown
    const currencyBreakdown = await db.select({
      currency: sql<string>`COALESCE(${units.currencyCode}, 'SAR')`,
      count: sql<number>`COUNT(*)`,
      totalSale: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`
    }).from(units).where(where).groupBy(units.currencyCode).all();

    // Financial Anomalies
    const anomalies = await db.select({
      id: units.id,
      propertyId: units.propertyId,
      unitId: units.unitId,
      salesUnitStatus: units.salesUnitStatus,
      saleAmount: units.saleAmount,
      totalAmount: units.totalAmount,
      saleTaxAmount: units.saleTaxAmount
    }).from(units).where(
      and(
        where,
        sql`(LOWER(${units.salesUnitStatus}) = 'sold' AND (${units.saleAmount} IS NULL OR ${units.saleAmount} = 0)) OR (${units.saleAmount} < 0)`
      )
    ).limit(20).all();

    return {
      totals: {
        totalSale: Math.round((totals?.totalSale || 0) * 100) / 100,
        totalTax: Math.round((totals?.totalTax || 0) * 100) / 100,
        totalOverall: Math.round((totals?.totalOverall || 0) * 100) / 100,
        avgSale: Math.round((totals?.avgSale || 0) * 100) / 100
      },
      propertyRanking,
      revenueBreakdown,
      currencyBreakdown,
      anomalies
    };
  }

  /**
   * Module F: Inventory Analytics
   */
  static async getInventoryAnalytics(filters: GlobalFilterParams = {}) {
    const where = DashboardService.buildFilterConditions(filters);

    const counts = await db.select({
      totalUnits: sql<number>`COUNT(*)`,
      soldUnits: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      availableUnits: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'available' THEN 1 END)`,
      reservedUnits: sql<number>`COUNT(CASE WHEN ${units.reserved} = 1 THEN 1 END)`,
      occupiedUnits: sql<number>`COUNT(CASE WHEN ${units.occupied} = 1 THEN 1 END)`,
      vacantUnits: sql<number>`COUNT(CASE WHEN ${units.vacant} = 1 THEN 1 END)`
    }).from(units).where(where).get();

    // Inventory by Property
    const byProperty = await db.select({
      propertyId: units.propertyId,
      total: sql<number>`COUNT(*)`,
      sold: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      available: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'available' THEN 1 END)`
    }).from(units).where(where).groupBy(units.propertyId).all();

    // Inventory by Block (Top 12)
    const byBlock = await db.select({
      blockId: sql<string>`COALESCE(${units.blockId}, 'N/A')`,
      total: sql<number>`COUNT(*)`,
      sold: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      available: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'available' THEN 1 END)`
    }).from(units).where(where).groupBy(units.blockId).orderBy(sql`COUNT(*) DESC`).limit(12).all();

    // Inventory by Floor
    const byFloor = await db.select({
      floorId: sql<string>`COALESCE(${units.floorId}, 'N/A')`,
      total: sql<number>`COUNT(*)`,
      sold: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      available: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'available' THEN 1 END)`
    }).from(units).where(where).groupBy(units.floorId).orderBy(sql`COUNT(*) DESC`).all();

    // Conflicting status flags (Occupied = 1 and Vacant = 1, etc.)
    const conflicting = await db.select({
      id: units.id,
      propertyId: units.propertyId,
      unitId: units.unitId,
      occupied: units.occupied,
      vacant: units.vacant,
      reserved: units.reserved,
      salesUnitStatus: units.salesUnitStatus
    }).from(units).where(
      and(
        where,
        sql`(${units.occupied} = 1 AND ${units.vacant} = 1)`
      )
    ).limit(20).all();

    return {
      counts,
      byProperty,
      byBlock,
      byFloor,
      conflicting
    };
  }
}

