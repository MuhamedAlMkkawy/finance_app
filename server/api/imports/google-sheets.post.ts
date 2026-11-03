import { defineEventHandler, readBody, createError } from 'h3';
import { ImportService } from '../../services/import.service';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const url = body?.url?.trim();
  const strategy = (body?.strategy || 'replace') as 'replace' | 'append' | 'update';

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Google Sheet URL is required.'
    });
  }

  try {
    const result = await ImportService.syncFromGoogleSheet(url, strategy);
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: 422,
      statusMessage: error.message || 'Failed to sync Google Sheet.'
    });
  }
});
