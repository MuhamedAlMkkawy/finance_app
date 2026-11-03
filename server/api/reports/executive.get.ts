import { ReportService } from '../../services/report.service';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const format = query.format === 'pdf' ? 'pdf' : 'excel';

  if (format === 'pdf') {
    const pdfBuffer = await ReportService.generateExecutivePdf();
    setHeader(event, 'Content-Type', 'application/pdf');
    setHeader(event, 'Content-Disposition', 'attachment; filename="Executive_Portfolio_Report.pdf"');
    return pdfBuffer;
  } else {
    const excelBuffer = await ReportService.generateExecutiveExcel();
    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    setHeader(event, 'Content-Disposition', 'attachment; filename="Executive_Portfolio_Report.xlsx"');
    return excelBuffer;
  }
});

