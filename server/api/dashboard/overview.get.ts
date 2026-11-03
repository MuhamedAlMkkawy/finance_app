import { DashboardService } from '../../services/dashboard.service';
import { ImportService } from '../../services/import.service';

export default defineEventHandler(async (event) => {
  // Ensure default data is imported
  await ImportService.ensureDatasetImported();

  const query = getQuery(event);
  const filters = {
    property: query.property ? String(query.property) : undefined,
    block: query.block ? String(query.block) : undefined,
    floor: query.floor ? String(query.floor) : undefined,
    unitType: query.unitType ? String(query.unitType) : undefined,
    salesStatus: query.salesStatus ? String(query.salesStatus) : undefined,
    revenueType: query.revenueType ? String(query.revenueType) : undefined,
    currency: query.currency ? String(query.currency) : undefined,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    search: query.search ? String(query.search) : undefined,
  };

  const [kpis, charts, filterOptions] = await Promise.all([
    DashboardService.getKPIs(filters),
    DashboardService.getCharts(filters),
    DashboardService.getFilterOptions()
  ]);

  return {
    kpis,
    charts,
    filterOptions
  };
});

