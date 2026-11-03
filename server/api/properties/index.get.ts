import { PropertyService } from '../../services/property.service';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (query.compare) {
    const ids = String(query.compare).split(',').map(s => s.trim());
    return await PropertyService.compareProperties(ids);
  }
  return await PropertyService.getAllProperties();
});

