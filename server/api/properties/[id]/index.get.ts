import { PropertyService } from '../../../services/property.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Property ID is required' });
  }

  const details = await PropertyService.getPropertyDetails(id);
  if (!details) {
    throw createError({ statusCode: 404, message: `Property ${id} not found` });
  }

  return details;
});

