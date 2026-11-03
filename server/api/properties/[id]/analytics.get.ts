import { DashboardService } from '../../../services/dashboard.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Property ID is required' });
  }

  const [kpis, charts] = await Promise.all([
    DashboardService.getKPIs({ property: id }),
    DashboardService.getCharts({ property: id })
  ]);

  return { kpis, charts };
});

