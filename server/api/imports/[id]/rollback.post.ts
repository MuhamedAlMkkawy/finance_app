import { ImportService } from '../../../services/import.service';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid Batch ID' });
  }

  return await ImportService.rollbackBatch(id);
});

