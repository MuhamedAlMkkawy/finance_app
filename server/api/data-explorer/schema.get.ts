import { db } from '../../database';
import { units } from '../../database/schema';
import { EXPECTED_92_COLUMNS } from '../../services/validation.service';

export default defineEventHandler(async () => {
  const allUnits = await db.select({ rawData: units.rawData }).from(units).all();
  const totalRecords = allUnits.length;

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

  allUnits.forEach(u => {
    let raw: Record<string, any> = {};
    try {
      raw = JSON.parse(u.rawData);
    } catch (e) {}

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
  });

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
});

