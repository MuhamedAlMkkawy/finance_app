import { defineEventHandler, readBody, createError } from 'h3';
import { ImportService } from '../../services/import.service';
import { DEFAULT_GOOGLE_SHEET_URL } from '../../data/store';

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const url = body?.url?.trim() || DEFAULT_GOOGLE_SHEET_URL;
  const strategy = (body?.strategy || 'replace') as 'replace' | 'append' | 'update';

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
