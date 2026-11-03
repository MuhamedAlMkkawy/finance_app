import { ImportService } from '../../services/import.service';

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  if (!form || form.length === 0) {
    throw createError({ statusCode: 400, message: 'No file uploaded' });
  }

  const fileItem = form.find(f => f.name === 'file' || f.filename);
  if (!fileItem || !fileItem.data) {
    throw createError({ statusCode: 400, message: 'Valid Excel file is required' });
  }

  const filename = fileItem.filename || 'uploaded_units.xlsx';
  const { preview } = ImportService.parseWorkbookBuffer(fileItem.data, filename);

  return preview;
});

