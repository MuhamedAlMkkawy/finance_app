import { AnalyticsService } from '../../services/analytics.service';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await AnalyticsService.getInventoryAnalytics(query);
});

