import { DataStore } from '../data/store';

export class PropertyService {
  /**
   * Get all properties with high-level summary metrics
   */
  static async getAllProperties() {
    await DataStore.ensureInitialized();
    return DataStore.getAllProperties();
  }

  /**
   * Get single property details with in-depth sections
   */
  static async getPropertyDetails(propertyId: string) {
    await DataStore.ensureInitialized();
    return DataStore.getPropertyDetails(propertyId);
  }

  /**
   * Compare multiple properties side-by-side
   */
  static async compareProperties(propertyIds: string[]) {
    await DataStore.ensureInitialized();
    const normIds = propertyIds.map(p => p.toUpperCase());
    const allProps = DataStore.getAllProperties();
    return allProps.filter(p => normIds.includes(p.normalizedPropertyId));
  }
}
