import { UnitService } from '../../services/unit.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Unit identifier is required' });
  }

  const result = await UnitService.getUnitById(id);
  if (!result) {
    throw createError({ statusCode: 404, message: `Unit ${id} not found` });
  }

  return result;
});

