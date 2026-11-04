import { DataStore } from '../data/store';
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
    await DataStore.ensureInitialized();
    return DataStore.getUnitsList(query);
  }

  /**
   * Get single unit with categorized details into 8 clear categories
   */
  static async getUnitById(idOrUnitId: string | number) {
    await DataStore.ensureInitialized();
    const unit = DataStore.getUnitById(idOrUnitId);
    if (!unit) return null;

    const raw = unit.raw || {};

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
