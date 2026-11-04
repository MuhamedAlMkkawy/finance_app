import { DataStore } from '../data/store';
import type { GlobalFilterParams, DashboardKPIs } from '../../shared/types';

export class DashboardService {
  static async getKPIs(filters: GlobalFilterParams = {}): Promise<DashboardKPIs> {
    await DataStore.ensureInitialized();
    return DataStore.getKPIs(filters);
  }

  static async getCharts(filters: GlobalFilterParams = {}) {
    await DataStore.ensureInitialized();
    return DataStore.getCharts(filters);
  }

  static async getFilterOptions() {
    await DataStore.ensureInitialized();
    return DataStore.getFilterOptions();
  }
}
