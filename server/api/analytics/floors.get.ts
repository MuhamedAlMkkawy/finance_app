import { DashboardService } from '../../services/dashboard.service';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const charts = await DashboardService.getCharts(query);
  return charts.byFloor;
});

