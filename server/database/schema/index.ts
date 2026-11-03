import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const properties = sqliteTable('properties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  normalizedPropertyId: text('normalized_property_id').notNull().unique(),
  originalPropertyId: text('original_property_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const units = sqliteTable('units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propertyId: text('property_id').notNull(),
  originalPropertyId: text('original_property_id').notNull(),
  unitId: text('unit_id').notNull(),
  unitName: text('unit_name'),
  blockId: text('block_id'),
  floorId: text('floor_id'),
  unitType: text('unit_type'),
  unitArea: real('unit_area'),
  salesUnitStatus: text('sales_unit_status'),
  revenueType: text('revenue_type'),
  saleAmount: real('sale_amount'),
  saleTaxAmount: real('sale_tax_amount'),
  totalAmount: real('total_amount'),
  currencyCode: text('currency_code'),
  occupied: integer('occupied').default(0),
  reserved: integer('reserved').default(0),
  vacant: integer('vacant').default(0),
  rawData: text('raw_data').notNull(), // JSON string of all 92 columns
  sourceRowNumber: integer('source_row_number'),
  importBatchId: integer('import_batch_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  propertyIdIdx: index('idx_units_property_id').on(table.propertyId),
  unitIdIdx: index('idx_units_unit_id').on(table.unitId),
  blockIdIdx: index('idx_units_block_id').on(table.blockId),
  floorIdIdx: index('idx_units_floor_id').on(table.floorId),
  salesStatusIdx: index('idx_units_sales_status').on(table.salesUnitStatus),
  revenueTypeIdx: index('idx_units_revenue_type').on(table.revenueType),
  currencyIdx: index('idx_units_currency').on(table.currencyCode),
  batchIdx: index('idx_units_batch').on(table.importBatchId),
  propUnitIdx: index('idx_units_prop_unit').on(table.propertyId, table.unitId)
}));

export const importBatches = sqliteTable('import_batches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  importStrategy: text('import_strategy').notNull(),
  totalRows: integer('total_rows').notNull().default(0),
  importedRows: integer('imported_rows').notNull().default(0),
  updatedRows: integer('updated_rows').notNull().default(0),
  skippedRows: integer('skipped_rows').notNull().default(0),
  failedRows: integer('failed_rows').notNull().default(0),
  status: text('status').notNull().default('completed'), // completed, rolled_back, failed
  importedAt: text('imported_at').default(sql`CURRENT_TIMESTAMP`)
});

export const importIssues = sqliteTable('import_issues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  importBatchId: integer('import_batch_id').notNull(),
  unitId: text('unit_id'),
  fieldName: text('field_name'),
  issueType: text('issue_type').notNull(),
  message: text('message').notNull(),
  originalValue: text('original_value'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  batchIdx: index('idx_issues_batch').on(table.importBatchId)
}));

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'), // admin, manager, viewer
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull()
});

