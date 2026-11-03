import { db } from '../../database';
import { importBatches, importIssues } from '../../database/schema';
import { desc, sql, eq } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const batches = await db.select({
    id: importBatches.id,
    filename: importBatches.filename,
    importStrategy: importBatches.importStrategy,
    totalRows: importBatches.totalRows,
    importedRows: importBatches.importedRows,
    updatedRows: importBatches.updatedRows,
    skippedRows: importBatches.skippedRows,
    failedRows: importBatches.failedRows,
    status: importBatches.status,
    importedAt: importBatches.importedAt,
    issuesCount: sql<number>`(SELECT COUNT(*) FROM import_issues WHERE import_issues.import_batch_id = import_batches.id)`
  })
  .from(importBatches)
  .orderBy(desc(importBatches.id))
  .all();

  return batches;
});

