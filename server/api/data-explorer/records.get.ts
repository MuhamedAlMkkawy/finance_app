import { db } from '../../database';
import { units } from '../../database/schema';
import { sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(10, Number(query.pageSize) || 25));
  const search = query.search ? String(query.search).trim().toLowerCase() : '';
  const filterField = query.filterField ? String(query.filterField) : '';
  const filterValue = query.filterValue ? String(query.filterValue).trim().toLowerCase() : '';

  const allUnits = await db.select({
    id: units.id,
    sourceRowNumber: units.sourceRowNumber,
    rawData: units.rawData
  }).from(units).all();

  let filtered = allUnits.map(u => {
    let raw: Record<string, any> = {};
    try {
      raw = JSON.parse(u.rawData);
    } catch (e) {}
    return {
      _dbId: u.id,
      _sourceRowNumber: u.sourceRowNumber,
      ...raw
    };
  });

  if (filterField && filterValue) {
    filtered = filtered.filter(row => {
      const val = row[filterField];
      return val != null && String(val).toLowerCase().includes(filterValue);
    });
  }

  if (search) {
    filtered = filtered.filter(row => {
      return Object.values(row).some(v => v != null && String(v).toLowerCase().includes(search));
    });
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return {
    records: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
});

