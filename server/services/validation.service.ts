export const EXPECTED_92_COLUMNS = [
  'PROPERTYID',
  'UNITID',
  'ACTIVITY',
  'ACTIVITYGROUP',
  'ADVERTISINGUNIT',
  'BALCONY',
  'BEDSHARING',
  'BLOCKID',
  'BRAND',
  'BROKERAGEAMOUNT',
  'BROKERAGECALC',
  'BROKERAGEDEFAULTPAYMENT',
  'BROKERAGEVALUE',
  'BROKERAGEVENDOR',
  'BUDGETVALIDATIONDISCOUNT',
  'BUILTUPAREA',
  'CARPETAREA',
  'COMMONAREA',
  'CONDITION',
  'CONVERSIONUNIT',
  'CURRENCYCODE',
  'CURRENTAGREEMENTID',
  'CURRENTCUSTACCOUNT',
  'CURRENTRESERVATIONID',
  'DATAAREAID_COMPANY',
  'DIMENSIONDEFAULTDISPLAYVALUE',
  'ELECTRICCONNECTIONNO',
  'EXTENSION',
  'FACILITYAMOUNT',
  'FIREEXTINGUISHERNO',
  'FLOORID',
  'FURNISHINGTYPE',
  'GASCONNECTIONNO',
  'INACTIVE',
  'INFO1',
  'INFO2',
  'INFO3',
  'INTERCOMAVAILABLE',
  'INTERCOMNUMBER',
  'ISALLUNITS',
  'ISDEACTIVE',
  'ISOCCUPIED',
  'ISOFFERUNIT',
  'ISRESERVED',
  'ISVACCANT',
  'LASTMAINTENANCEDATE',
  'LASTPAINTINGDATE',
  'LASTVACANTDATE',
  'MAIDROOM',
  'MAXUNITRENT',
  'MINUNITRENT',
  'NEXTMAINTENANCEDATE',
  'NEXTMAINTENANCEDATE1',
  'NOOFATTACHEDBATHROOMS',
  'NOOFBEDROOMS',
  'NOOFBEDS',
  'OFFERDESCRIPTION',
  'PARKINGBASEMENT',
  'PARKINGOUTSIDE',
  'REASONCODE',
  'RENTAMOUNT',
  'RENTUNITSTATUS',
  'REVENUETYPE',
  'SALEAGREEMENTID',
  'SALEAMOUNT',
  'SALERESERVATIONID',
  'SALESTAXAMOUNT',
  'SALESUNITSTATUS',
  'SECTION',
  'STOPRENEWAL',
  'SWIMMINGPOOL',
  'TERRACE',
  'TERRACEAREA',
  'TOTALAMOUNT',
  'UNITAREA',
  'UNITCONDITION',
  'UNITCREATIONDATE',
  'UNITDIMENSIONVALUE',
  'UNITNAME',
  'UNITOFMEASURE',
  'UNITTYPE',
  'VALUE',
  'VIEWA',
  'VIEWADESC',
  'VIEWB',
  'VIEWBDESC',
  'VIEWC',
  'VIEWCDESC',
  'VIEWD',
  'VIEWDDESC',
  'WATERCONNECTIONNO',
  'UnitStatusIndicatorFileName'
];

export interface DataQualityIssue {
  unitId?: string;
  propertyId?: string;
  sourceRowNumber?: number;
  fieldName: string;
  issueType: 'MISSING_FIELD' | 'INVALID_DATE' | 'DEFAULT_DATE' | 'ANOMALOUS_AREA' | 'MISSING_FINANCIAL' | 'CONFLICTING_STATUS' | 'CASING_INCONSISTENCY' | 'INVALID_CURRENCY' | 'DUPLICATE_UNIT';
  message: string;
  originalValue: any;
}

export function validateDatasetRow(row: Record<string, any>, rowNumber: number, existingUnitIds: Set<string>): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];
  const unitId = row.UNITID != null ? String(row.UNITID).trim() : '';
  const propertyId = row.PROPERTYID != null ? String(row.PROPERTYID).trim() : '';

  // 1. Missing identifiers
  if (!propertyId) {
    issues.push({
      unitId,
      propertyId,
      sourceRowNumber: rowNumber,
      fieldName: 'PROPERTYID',
      issueType: 'MISSING_FIELD',
      message: 'Missing PROPERTYID',
      originalValue: row.PROPERTYID
    });
  }

  if (!unitId) {
    issues.push({
      unitId,
      propertyId,
      sourceRowNumber: rowNumber,
      fieldName: 'UNITID',
      issueType: 'MISSING_FIELD',
      message: 'Missing UNITID',
      originalValue: row.UNITID
    });
  }

  // 2. Casing inconsistency
  if (propertyId && propertyId !== propertyId.toUpperCase() && propertyId !== propertyId.toLowerCase()) {
    issues.push({
      unitId,
      propertyId,
      sourceRowNumber: rowNumber,
      fieldName: 'PROPERTYID',
      issueType: 'CASING_INCONSISTENCY',
      message: `Mixed-case property identifier: "${propertyId}"`,
      originalValue: propertyId
    });
  }

  // 3. Duplicate UNITID within dataset check
  const compoundKey = `${propertyId.toUpperCase()}:::${unitId}`;
  if (existingUnitIds.has(compoundKey)) {
    issues.push({
      unitId,
      propertyId,
      sourceRowNumber: rowNumber,
      fieldName: 'UNITID',
      issueType: 'DUPLICATE_UNIT',
      message: `Duplicate unit identified for property ${propertyId}: ${unitId}`,
      originalValue: unitId
    });
  } else if (compoundKey.length > 3) {
    existingUnitIds.add(compoundKey);
  }

  // 4. Dates validation
  const dateFields = [
    'LASTMAINTENANCEDATE',
    'LASTPAINTINGDATE',
    'LASTVACANTDATE',
    'NEXTMAINTENANCEDATE',
    'NEXTMAINTENANCEDATE1',
    'UNITCREATIONDATE'
  ];

  for (const df of dateFields) {
    const val = row[df];
    if (val != null && val !== '') {
      const strVal = String(val);
      if (strVal.includes('1900-01-01') || strVal === '0' || strVal === '1900/01/01') {
        issues.push({
          unitId,
          propertyId,
          sourceRowNumber: rowNumber,
          fieldName: df,
          issueType: 'DEFAULT_DATE',
          message: `Default system date placeholder (1900-01-01) in ${df}`,
          originalValue: strVal
        });
      }
    }
  }

  // 5. Area validation
  const areaVal = parseFloat(row.UNITAREA);
  if (row.UNITAREA != null && row.UNITAREA !== '') {
    if (isNaN(areaVal) || areaVal < 0) {
      issues.push({
        unitId,
        propertyId,
        sourceRowNumber: rowNumber,
        fieldName: 'UNITAREA',
        issueType: 'ANOMALOUS_AREA',
        message: `Invalid or negative area: ${row.UNITAREA}`,
        originalValue: row.UNITAREA
      });
    } else if (areaVal > 50000) {
      issues.push({
        unitId,
        propertyId,
        sourceRowNumber: rowNumber,
        fieldName: 'UNITAREA',
        issueType: 'ANOMALOUS_AREA',
        message: `Unusually large unit area (${areaVal} sq m)`,
        originalValue: row.UNITAREA
      });
    }
  }

  // 6. Financial validation
  const salesStatus = String(row.SALESUNITSTATUS || '').trim().toLowerCase();
  const saleAmount = parseFloat(row.SALEAMOUNT);
  if (salesStatus === 'sold' && (isNaN(saleAmount) || saleAmount <= 0)) {
    issues.push({
      unitId,
      propertyId,
      sourceRowNumber: rowNumber,
      fieldName: 'SALEAMOUNT',
      issueType: 'MISSING_FINANCIAL',
      message: 'Unit is marked as Sold but has missing or zero SALEAMOUNT',
      originalValue: row.SALEAMOUNT
    });
  }

  // 7. Conflicting statuses
  const isOccupied = String(row.ISOCCUPIED || '').trim().toLowerCase() === 'yes';
  const isVacant = String(row.ISVACCANT || '').trim().toLowerCase() === 'yes';
  if (isOccupied && isVacant) {
    issues.push({
      unitId,
      propertyId,
      sourceRowNumber: rowNumber,
      fieldName: 'ISOCCUPIED',
      issueType: 'CONFLICTING_STATUS',
      message: 'Unit cannot be marked both Occupied (Yes) and Vacant (Yes)',
      originalValue: `Occupied: ${row.ISOCCUPIED}, Vacant: ${row.ISVACCANT}`
    });
  }

  // 8. Currency check
  if (!row.CURRENCYCODE) {
    issues.push({
      unitId,
      propertyId,
      sourceRowNumber: rowNumber,
      fieldName: 'CURRENCYCODE',
      issueType: 'INVALID_CURRENCY',
      message: 'Currency code is missing/null (defaults to AED/SAR)',
      originalValue: row.CURRENCYCODE
    });
  }

  return issues;
}

