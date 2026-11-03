import { db } from '../database';
import { properties, units } from '../database/schema';
import { eq, sql, inArray } from 'drizzle-orm';

export class PropertyService {
  /**
   * Get all properties with high-level summary metrics
   */
  static async getAllProperties() {
    const list = await db.select({
      id: properties.id,
      normalizedPropertyId: properties.normalizedPropertyId,
      originalPropertyId: properties.originalPropertyId,
      totalUnits: sql<number>`COUNT(${units.id})`,
      uniqueUnits: sql<number>`COUNT(DISTINCT ${units.unitId})`,
      soldUnits: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'sold' THEN 1 END)`,
      availableUnits: sql<number>`COUNT(CASE WHEN LOWER(${units.salesUnitStatus}) = 'available' THEN 1 END)`,
      recordedSalesValue: sql<number>`COALESCE(SUM(${units.saleAmount}), 0)`,
      totalArea: sql<number>`COALESCE(SUM(${units.unitArea}), 0)`,
      totalAmount: sql<number>`COALESCE(SUM(${units.totalAmount}), 0)`,
      totalTax: sql<number>`COALESCE(SUM(${units.saleTaxAmount}), 0)`
    })
    .from(properties)
    .leftJoin(units, eq(properties.normalizedPropertyId, units.propertyId))
    .groupBy(properties.id, properties.normalizedPropertyId, properties.originalPropertyId)
    .orderBy(properties.normalizedPropertyId)
    .all();

    return list.map(p => {
      const soldPct = p.totalUnits > 0 ? (p.soldUnits / p.totalUnits) * 100 : 0;
      const avgPricePerSqm = p.totalArea > 0 ? p.recordedSalesValue / p.totalArea : 0;
      return {
        ...p,
        salesPercentage: Math.round(soldPct * 10) / 10,
        recordedSalesValue: Math.round(p.recordedSalesValue * 100) / 100,
        totalArea: Math.round(p.totalArea * 100) / 100,
        avgPricePerSqm: Math.round(avgPricePerSqm * 100) / 100
      };
    });
  }

  /**
   * Get single property details with in-depth sections
   */
  static async getPropertyDetails(propertyId: string) {
    const normId = propertyId.toUpperCase();
    const prop = await db.select().from(properties).where(eq(properties.normalizedPropertyId, normId)).get();
    if (!prop) return null;

    const propUnits = await db.select().from(units).where(eq(units.propertyId, normId)).all();

    // 1. Overview & Inventory stats
    const totalUnits = propUnits.length;
    const uniqueUnits = new Set(propUnits.map(u => u.unitId)).size;
    const soldUnits = propUnits.filter(u => u.salesUnitStatus?.toLowerCase() === 'sold').length;
    const availableUnits = propUnits.filter(u => u.salesUnitStatus?.toLowerCase() === 'available').length;
    const occupiedUnits = propUnits.filter(u => u.occupied === 1).length;
    const vacantUnits = propUnits.filter(u => u.vacant === 1).length;
    const reservedUnits = propUnits.filter(u => u.reserved === 1).length;

    // 2. Financials
    const totalSaleAmount = propUnits.reduce((acc, u) => acc + (u.saleAmount || 0), 0);
    const totalTaxAmount = propUnits.reduce((acc, u) => acc + (u.saleTaxAmount || 0), 0);
    const totalOverallAmount = propUnits.reduce((acc, u) => acc + (u.totalAmount || 0), 0);
    const totalArea = propUnits.reduce((acc, u) => acc + (u.unitArea || 0), 0);
    const avgSalePrice = soldUnits > 0 ? totalSaleAmount / soldUnits : 0;
    const avgPricePerSqm = totalArea > 0 ? totalSaleAmount / totalArea : 0;

    // 3. Blocks & Floors
    const blockCounts: Record<string, number> = {};
    const floorCounts: Record<string, number> = {};
    const unitTypeCounts: Record<string, number> = {};

    propUnits.forEach(u => {
      const b = u.blockId || 'Unknown';
      blockCounts[b] = (blockCounts[b] || 0) + 1;
      const f = u.floorId || 'Unknown';
      floorCounts[f] = (floorCounts[f] || 0) + 1;
      const t = u.unitType || 'Unknown';
      unitTypeCounts[t] = (unitTypeCounts[t] || 0) + 1;
    });

    // 4. Facilities & Maintenance summary from rawData
    let swimmingPoolCount = 0;
    let balconyCount = 0;
    let basementParkingCount = 0;
    let outsideParkingCount = 0;
    let maidRoomCount = 0;
    let validMaintenanceDatesCount = 0;

    propUnits.forEach(u => {
      try {
        const raw = JSON.parse(u.rawData || '{}');
        if (String(raw.SWIMMINGPOOL).toLowerCase() === 'yes') swimmingPoolCount++;
        if (String(raw.BALCONY).toLowerCase() === 'yes') balconyCount++;
        if (String(raw.PARKINGBASEMENT).toLowerCase() === 'yes') basementParkingCount++;
        if (String(raw.PARKINGOUTSIDE).toLowerCase() === 'yes') outsideParkingCount++;
        if (String(raw.MAIDROOM).toLowerCase() === 'yes') maidRoomCount++;
        if (raw.LASTMAINTENANCEDATE && !String(raw.LASTMAINTENANCEDATE).includes('1900-01-01')) {
          validMaintenanceDatesCount++;
        }
      } catch (e) {}
    });

    return {
      property: prop,
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

  /**
   * Compare multiple properties side-by-side
   */
  static async compareProperties(propertyIds: string[]) {
    const normIds = propertyIds.map(p => p.toUpperCase());
    const allProps = await this.getAllProperties();
    return allProps.filter(p => normIds.includes(p.normalizedPropertyId));
  }
}

