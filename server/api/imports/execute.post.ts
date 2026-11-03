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

  const strategyItem = form.find(f => f.name === 'strategy');
  const strategy = (strategyItem?.data?.toString('utf-8') || 'replace') as 'replace' | 'append' | 'update';

  const filename = fileItem.filename || 'uploaded_units.xlsx';
  const { rows } = ImportService.parseWorkbookBuffer(fileItem.data, filename);

  const result = await ImportService.executeImport(filename, rows, strategy);
  return result;
});

