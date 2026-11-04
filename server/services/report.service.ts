import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardService } from './dashboard.service';
import { PropertyService } from './property.service';
import { AnalyticsService } from './analytics.service';

export class ReportService {
  /**
   * Generate Executive Excel Report
   */
  static async generateExecutiveExcel() {
    const kpis = await DashboardService.getKPIs();
    const props = await PropertyService.getAllProperties();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Property Management Executive System';
    workbook.created = new Date();

    // Sheet 1: Executive Summary
    const summarySheet = workbook.addWorksheet('Executive Summary');
    summarySheet.columns = [
      { header: 'KPI Metric', key: 'metric', width: 35 },
      { header: 'Value', key: 'value', width: 25 },
      { header: 'Unit / Currency', key: 'unit', width: 15 }
    ];

    summarySheet.addRows([
      { metric: 'Total Properties', value: kpis.totalProperties, unit: 'Properties' },
      { metric: 'Total Unit Records', value: kpis.totalUnitRecords, unit: 'Records' },
      { metric: 'Unique Unit IDs', value: kpis.uniqueUnitIds, unit: 'Units' },
      { metric: 'Sold Units', value: kpis.soldUnits, unit: 'Units' },
      { metric: 'Available Units', value: kpis.availableUnits, unit: 'Units' },
      { metric: 'Reserved Units', value: kpis.reservedUnits, unit: 'Units' },
      { metric: 'Occupied Units', value: kpis.occupiedUnits, unit: 'Units' },
      { metric: 'Vacant Units', value: kpis.vacantUnits, unit: 'Units' },
      { metric: 'Total Recorded Sale Amount', value: kpis.totalRecordedSaleAmount, unit: kpis.currency },
      { metric: 'Total Sale Tax', value: kpis.totalSaleTax, unit: kpis.currency },
      { metric: 'Total Amount', value: kpis.totalAmount, unit: kpis.currency },
      { metric: 'Total Unit Area', value: kpis.totalUnitArea, unit: 'm²' },
      { metric: 'Average Unit Sale Amount', value: kpis.averageUnitSaleAmount, unit: kpis.currency },
      { metric: 'Average Sale Price / m²', value: kpis.averageSalePricePerSquareMeter, unit: `${kpis.currency}/m²` }
    ]);

    // Format header row
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };

    // Sheet 2: Property Performance
    const propSheet = workbook.addWorksheet('Property Breakdown');
    propSheet.columns = [
      { header: 'Property ID', key: 'normalizedPropertyId', width: 18 },
      { header: 'Total Units', key: 'totalUnits', width: 14 },
      { header: 'Unique Units', key: 'uniqueUnits', width: 14 },
      { header: 'Sold Units', key: 'soldUnits', width: 14 },
      { header: 'Available Units', key: 'availableUnits', width: 15 },
      { header: 'Sales %', key: 'salesPercentage', width: 12 },
      { header: 'Recorded Sales Value (SAR)', key: 'recordedSalesValue', width: 25 },
      { header: 'Total Area (m²)', key: 'totalArea', width: 18 }
    ];

    propSheet.addRows(props);
    propSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    propSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F766E' }
    };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Generate Executive PDF Report
   */
  static async generateExecutivePdf() {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const kpis = await DashboardService.getKPIs();
    const props = await PropertyService.getAllProperties();

    // Title & Header
    doc.setFillColor(15, 23, 42); // Navy 900
    doc.rect(0, 0, 210, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('EXECUTIVE PORTFOLIO & PROPERTY REPORT', 14, 16);

    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toISOString().split('T')[0]}`, 150, 16);

    // Section 1: Portfolio KPIs
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.text('Key Portfolio Performance Indicators', 14, 35);

    const kpiRows = [
      ['Total Properties', String(kpis.totalProperties), 'Total Recorded Sale', `${kpis.totalRecordedSaleAmount.toLocaleString()} ${kpis.currency}`],
      ['Total Unit Records', String(kpis.totalUnitRecords), 'Total Sale Tax', `${kpis.totalSaleTax.toLocaleString()} ${kpis.currency}`],
      ['Unique Unit IDs', String(kpis.uniqueUnitIds), 'Total Amount', `${kpis.totalAmount.toLocaleString()} ${kpis.currency}`],
      ['Sold Units', String(kpis.soldUnits), 'Total Unit Area', `${kpis.totalUnitArea.toLocaleString()} m²`],
      ['Available Units', String(kpis.availableUnits), 'Average Sale Amount', `${kpis.averageUnitSaleAmount.toLocaleString()} ${kpis.currency}`],
      ['Reserved Units', String(kpis.reservedUnits), 'Average Price / m²', `${kpis.averageSalePricePerSquareMeter.toLocaleString()} ${kpis.currency}/m²`],
      ['Occupied / Vacant', `${kpis.occupiedUnits} / ${kpis.vacantUnits}`, 'Active Currency', kpis.currency]
    ];

    autoTable(doc, {
      startY: 40,
      head: [['KPI Name', 'Value', 'Financial Metric', 'Amount']],
      body: kpiRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9, cellPadding: 2 }
    });

    // Section 2: Properties Breakdown
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.text('Properties Performance Breakdown', 14, finalY);

    const propRows = props.map(p => [
      p.normalizedPropertyId,
      String(p.totalUnits),
      String(p.uniqueUnits),
      String(p.soldUnits),
      String(p.availableUnits),
      `${p.salesPercentage}%`,
      p.recordedSalesValue.toLocaleString(),
      p.totalArea.toLocaleString()
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Property ID', 'Units', 'Unique', 'Sold', 'Available', 'Sales %', 'Sales Value (SAR)', 'Area (m²)']],
      body: propRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110] },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    return Buffer.from(doc.output('arraybuffer'));
  }
}

