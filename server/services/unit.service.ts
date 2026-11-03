import { db } from '../database';
import { units } from '../database/schema';
import { eq, sql, and, gte, lte, desc, asc } from 'drizzle-orm';
import { DashboardService } from './dashboard.service';
import type { GlobalFilterParams } from '../../shared/types';
import { EXPECTED_92_COLUMNS } from './validation.service';

export interface UnitListQuery extends GlobalFilterParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  columns?: string[];
}

export class UnitService {
  /**
   * Get paginated and filtered units
   */
  static async getUnits(query: UnitListQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(query.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    const where = DashboardService.buildFilterConditions(query);

    // Dynamic sort
    const sortBy = query.sortBy || 'id';
    const sortOrder = query.sortOrder === 'desc' ? desc : asc;

    let sortCol: any = units.id;
    if (sortBy === 'propertyId') sortCol = units.propertyId;
    else if (sortBy === 'unitId') sortCol = units.unitId;
    else if (sortBy === 'unitName') sortCol = units.unitName;
    else if (sortBy === 'unitArea') sortCol = units.unitArea;
    else if (sortBy === 'saleAmount') sortCol = units.saleAmount;
    else if (sortBy === 'salesUnitStatus') sortCol = units.salesUnitStatus;
    else if (sortBy === 'blockId') sortCol = units.blockId;
    else if (sortBy === 'floorId') sortCol = units.floorId;

    const totalCountRes = await db.select({ count: sql<number>`count(*)` })
      .from(units)
      .where(where)
      .get();
    const total = totalCountRes?.count || 0;

    const records = await db.select()
      .from(units)
      .where(where)
      .orderBy(sortOrder(sortCol))
      .limit(pageSize)
      .offset(offset)
      .all();

    // Map units and optionally parse rawData
    const items = records.map(r => {
      let raw: any = {};
      try {
        raw = JSON.parse(r.rawData);
      } catch (e) {}

      return {
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
        raw
      };
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * Get single unit with categorized details
   */
  static async getUnitById(idOrUnitId: string | number) {
    let unit = null;
    if (!isNaN(Number(idOrUnitId))) {
      unit = await db.select().from(units).where(eq(units.id, Number(idOrUnitId))).get();
    }
    if (!unit) {
      unit = await db.select().from(units).where(eq(units.unitId, String(idOrUnitId))).get();
    }
    if (!unit) return null;

    let raw: Record<string, any> = {};
    try {
      raw = JSON.parse(unit.rawData || '{}');
    } catch (e) {}

    // Grouping all fields into 8 clear categories as requested
    const categorized = {
      general: {
        propertyId: unit.propertyId,
        originalPropertyId: unit.originalPropertyId,
        unitId: unit.unitId,
        unitName: unit.unitName || raw.UNITNAME,
        unitType: unit.unitType || raw.UNITTYPE,
        activity: raw.ACTIVITY,
        activityGroup: raw.ACTIVITYGROUP,
        brand: raw.BRAND,
        section: raw.SECTION,
        condition: raw.CONDITION,
        unitCondition: raw.UNITCONDITION
      },
      location: {
        blockId: unit.blockId || raw.BLOCKID,
        floorId: unit.floorId || raw.FLOORID,
        unitDimension: raw.UNITDIMENSIONVALUE,
        dimensionDefault: raw.DIMENSIONDEFAULTDISPLAYVALUE,
        extension: raw.EXTENSION,
        company: raw.DATAAREAID_COMPANY
      },
      area: {
        unitArea: unit.unitArea,
        builtUpArea: raw.BUILTUPAREA,
        carpetArea: raw.CARPETAREA,
        commonArea: raw.COMMONAREA,
        terraceArea: raw.TERRACEAREA,
        unitOfMeasure: raw.UNITOFMEASURE,
        conversionUnit: raw.CONVERSIONUNIT
      },
      financials: {
        revenueType: unit.revenueType || raw.REVENUETYPE,
        saleAmount: unit.saleAmount,
        saleTaxAmount: unit.saleTaxAmount,
        totalAmount: unit.totalAmount,
        currencyCode: unit.currencyCode || 'SAR',
        brokerageAmount: raw.BROKERAGEAMOUNT,
        brokerageCalc: raw.BROKERAGECALC,
        brokerageDefaultPayment: raw.BROKERAGEDEFAULTPAYMENT,
        brokerageValue: raw.BROKERAGEVALUE,
        brokerageVendor: raw.BROKERAGEVENDOR,
        facilityAmount: raw.FACILITYAMOUNT,
        rentAmount: raw.RENTAMOUNT,
        minUnitRent: raw.MINUNITRENT,
        maxUnitRent: raw.MAXUNITRENT,
        budgetValidationDiscount: raw.BUDGETVALIDATIONDISCOUNT
      },
      status: {
        salesUnitStatus: unit.salesUnitStatus || raw.SALESUNITSTATUS,
        rentUnitStatus: raw.RENTUNITSTATUS,
        isOccupied: raw.ISOCCUPIED || (unit.occupied ? 'Yes' : 'No'),
        isReserved: raw.ISRESERVED || (unit.reserved ? 'Yes' : 'No'),
        isVacant: raw.ISVACCANT || (unit.vacant ? 'Yes' : 'No'),
        isDeactive: raw.ISDEACTIVE,
        inactive: raw.INACTIVE,
        isOfferUnit: raw.ISOFFERUNIT,
        isAllUnits: raw.ISALLUNITS,
        stopRenewal: raw.STOPRENEWAL
      },
      facilities: {
        balcony: raw.BALCONY,
        swimmingPool: raw.SWIMMINGPOOL,
        terrace: raw.TERRACE,
        maidRoom: raw.MAIDROOM,
        parkingBasement: raw.PARKINGBASEMENT,
        parkingOutside: raw.PARKINGOUTSIDE,
        intercomAvailable: raw.INTERCOMAVAILABLE,
        intercomNumber: raw.INTERCOMNUMBER,
        bedrooms: raw.NOOFBEDROOMS,
        beds: raw.NOOFBEDS,
        attachedBathrooms: raw.NOOFATTACHEDBATHROOMS,
        furnishingType: raw.FURNISHINGTYPE,
        bedSharing: raw.BEDSHARING
      },
      maintenance: {
        lastMaintenanceDate: raw.LASTMAINTENANCEDATE,
        nextMaintenanceDate: raw.NEXTMAINTENANCEDATE,
        nextMaintenanceDate1: raw.NEXTMAINTENANCEDATE1,
        lastPaintingDate: raw.LASTPAINTINGDATE,
        lastVacantDate: raw.LASTVACANTDATE,
        unitCreationDate: raw.UNITCREATIONDATE
      },
      additional: {
        electricalConnection: raw.ELECTRICCONNECTIONNO,
        waterConnection: raw.WATERCONNECTIONNO,
        gasConnection: raw.GASCONNECTIONNO,
        fireExtinguisher: raw.FIREEXTINGUISHERNO,
        viewA: raw.VIEWA,
        viewADesc: raw.VIEWADESC,
        viewB: raw.VIEWB,
        viewBDesc: raw.VIEWBDESC,
        viewC: raw.VIEWC,
        viewCDesc: raw.VIEWCDESC,
        viewD: raw.VIEWD,
        viewDDesc: raw.VIEWDDESC,
        info1: raw.INFO1,
        info2: raw.INFO2,
        info3: raw.INFO3,
        offerDescription: raw.OFFERDESCRIPTION,
        advertisingUnit: raw.ADVERTISINGUNIT,
        currentAgreementId: raw.CURRENTAGREEMENTID,
        currentCustAccount: raw.CURRENTCUSTACCOUNT,
        currentReservationId: raw.CURRENTRESERVATIONID,
        saleAgreementId: raw.SALEAGREEMENTID,
        saleReservationId: raw.SALERESERVATIONID,
        reasonCode: raw.REASONCODE,
        unitStatusIndicatorFileName: raw.UnitStatusIndicatorFileName
      },
      rawData: raw
    };

    return {
      unit,
      categorized
    };
  }

  /**
   * Return schema details for all 92 columns
   */
  static getColumnMetadata() {
    return EXPECTED_92_COLUMNS.map(col => ({
      field: col,
      label: col.replace(/_/g, ' '),
      defaultVisible: [
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
      ].includes(col)
    }));
  }
}

