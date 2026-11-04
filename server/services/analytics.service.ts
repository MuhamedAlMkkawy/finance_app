import { DataStore } from '../data/store';
import type { GlobalFilterParams } from '../../shared/types';

export class AnalyticsService {
  /**
   * Module D: Sales Analytics
   */
  static async getSalesAnalytics(filters: GlobalFilterParams = {}) {
    await DataStore.ensureInitialized();
    return DataStore.getSalesAnalytics(filters);
  }

  /**
   * Module E: Financial Analytics
   */
  static async getFinancialAnalytics(filters: GlobalFilterParams = {}) {
    await DataStore.ensureInitialized();
    return DataStore.getFinancialAnalytics(filters);
  }

  /**
   * Module F: Inventory Analytics
   */
  static async getInventoryAnalytics(filters: GlobalFilterParams = {}) {
    await DataStore.ensureInitialized();
    return DataStore.getInventoryAnalytics(filters);
  }
}
