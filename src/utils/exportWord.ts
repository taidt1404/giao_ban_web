import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalMergeType,
  VerticalAlign,
  PageBreak,
  Packer,
} from 'docx';
import type { ReportData } from '../data/defaultReport';
import {
  type OutpatientReportData,
  calculateRate,
} from '../data/outpatientReport';
import {
  type AfterHoursReportData,
  calculatePrescriptionsTotal,
  calculateTotalExams,
} from '../data/afterHoursReport';
import {
  type InpatientReportData,
  calculateCurrentPatients,
  calculateBedDifference,
} from '../data/inpatientReport';
import type { FreeTextSlideData } from '../data/freeTextReport';
import type { SoapSlideData } from '../data/soapReport';
import type { MonitoringReportData } from '../data/monitoringReport';
import type { PatientCaseTableSlideData } from '../data/patientCaseTableReport';

function parseDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { day: '...', month: '...', year: '...' };
  }
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: (d.getMonth() + 1).toString().padStart(2, '0'),
    year: d.getFullYear().toString(),
  };
}

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

const cellNoBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
};

const tableBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '999999',
};

const cellGridBorders = {
  top: tableBorder,
  bottom: tableBorder,
  left: tableBorder,
  right: tableBorder,
};

const FONT_FAMILY = 'Times New Roman';

function createDataCell(
  text: string | string[],
  widthPercent: number,
  options?: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    bold?: boolean;
    color?: string;
    fill?: string;
    verticalMerge?: (typeof VerticalMergeType)[keyof typeof VerticalMergeType];
    columnSpan?: number;
    fontSize?: number;
    spaceBefore?: number;
    spaceAfter?: number;
    verticalAlign?: (typeof VerticalAlign.TOP) | (typeof VerticalAlign.CENTER) | (typeof VerticalAlign.BOTTOM);
  },
): TableCell {
  const rawLines = Array.isArray(text)
    ? text.flatMap((t) => (t || '').split(/\r?\n/))
    : (text || '').split(/\r?\n/);

  const isMultiLine = rawLines.length > 1;

  const paragraphs = rawLines.map((line) => {
    const isHeaderItem = line.trim().startsWith('*');
    return new Paragraph({
      alignment: options?.align ?? AlignmentType.CENTER,
      spacing: {
        before: options?.spaceBefore ?? (isHeaderItem ? 60 : isMultiLine ? 15 : 30),
        after: options?.spaceAfter ?? (isMultiLine ? 15 : 30),
        line: 240,
      },
      children: [
        new TextRun({
          text: line,
          bold: options?.bold ?? (isHeaderItem ? true : false),
          color: options?.color,
          font: FONT_FAMILY,
          size: options?.fontSize ?? 19,
        }),
      ],
    });
  });

  const resolvedVAlign =
    options?.verticalAlign ??
    (isMultiLine || options?.align === AlignmentType.LEFT
      ? VerticalAlign.TOP
      : VerticalAlign.CENTER);

  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellGridBorders,
    verticalMerge: options?.verticalMerge,
    columnSpan: options?.columnSpan,
    shading: options?.fill ? { fill: options.fill } : undefined,
    verticalAlign: resolvedVAlign as any,
    children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: '' })],
  });
}

function createHeaderCell(
  text: string | string[],
  widthPercent: number,
  bgOrOptions?:
    | string
    | {
        verticalMerge?: (typeof VerticalMergeType)[keyof typeof VerticalMergeType];
        columnSpan?: number;
        fill?: string;
        fontSize?: number;
        color?: string;
      },
  textColor?: string,
): TableCell {
  let fill = '3B6BB5';
  let color = 'FFFFFF';
  let fontSize = 20;
  let verticalMerge: (typeof VerticalMergeType)[keyof typeof VerticalMergeType] | undefined;
  let columnSpan: number | undefined;

  if (typeof bgOrOptions === 'string') {
    fill = bgOrOptions;
    if (textColor) color = textColor;
  } else if (bgOrOptions && typeof bgOrOptions === 'object') {
    if (bgOrOptions.fill) fill = bgOrOptions.fill;
    if (bgOrOptions.color) color = bgOrOptions.color;
    if (bgOrOptions.fontSize) fontSize = bgOrOptions.fontSize;
    verticalMerge = bgOrOptions.verticalMerge;
    columnSpan = bgOrOptions.columnSpan;
  }

  const lines = Array.isArray(text) ? text : (text || '').split('\n');
  const paragraphs = lines.map(
    (line) =>
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: line,
            bold: true,
            color,
            font: FONT_FAMILY,
            size: fontSize,
          }),
        ],
      }),
  );

  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellGridBorders,
    verticalMerge,
    columnSpan,
    shading: { fill },
    verticalAlign: VerticalAlign.CENTER,
    children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: '' })],
  });
}

export type ExportWordOptions = {
  continuous?: boolean; // Mặc định true: in nối tiếp tiết kiệm giấy; false: mỗi slide 1 trang
};

export async function downloadGiaoBanWord(
  report: ReportData,
  outpatient?: OutpatientReportData,
  afterHours?: AfterHoursReportData,
  inpatient?: InpatientReportData,
  freeTextSlides?: FreeTextSlideData[],
  soapSlides?: SoapSlideData[],
  monitoring?: MonitoringReportData,
  patientCaseTableSlides?: PatientCaseTableSlideData[],
  options?: ExportWordOptions,
): Promise<void> {
  const continuous = options?.continuous ?? true;
  const dateInfo = parseDate(report.reportDate);

  // Tính tổng PK nội
  const internalTotal =
    outpatient?.internalClinics.reduce((s, c) => s + (Number(c.total) || 0), 0) ?? 0;
  const internalAdmitted =
    outpatient?.internalClinics.reduce((s, c) => s + (Number(c.admitted) || 0), 0) ?? 0;
  const internalRate = calculateRate(internalAdmitted, internalTotal);

  const docChildren: (Paragraph | Table)[] = [
    // ==========================================
    // TRANG 1: THÀNH PHẦN KÍP TRỰC (SLIDE 1)
    // ==========================================
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: cellNoBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: cellNoBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'CÔNG TY CP BỆNH VIỆN HÙNG CƯỜNG',
                      font: FONT_FAMILY,
                      size: 20,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'BỆNH VIỆN ĐA KHOA HÙNG CƯỜNG',
                      bold: true,
                      font: FONT_FAMILY,
                      size: 20,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: '***',
                      font: FONT_FAMILY,
                      size: 18,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: cellNoBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                      bold: true,
                      font: FONT_FAMILY,
                      size: 20,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'Độc lập - Tự do - Hạnh phúc',
                      bold: true,
                      font: FONT_FAMILY,
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: '------------------',
                      font: FONT_FAMILY,
                      size: 18,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({ text: '', spacing: { before: 180, after: 180 } }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
      children: [
        new TextRun({
          text: 'BÁO CÁO GIAO BAN BỆNH VIỆN',
          bold: true,
          font: FONT_FAMILY,
          size: 32,
          color: '003366',
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [
        new TextRun({
          text: `Ngày ${dateInfo.day} tháng ${dateInfo.month} năm ${dateInfo.year}`,
          italics: true,
          font: FONT_FAMILY,
          size: 26,
        }),
      ],
    }),

    new Paragraph({
      spacing: { before: 160, after: 120 },
      children: [
        new TextRun({
          text: 'I. THÀNH PHẦN KÍP TRỰC (SLIDE 1)',
          bold: true,
          font: FONT_FAMILY,
          size: 26,
          color: '003366',
        }),
      ],
    }),

    new Paragraph({
      spacing: { before: 60, after: 60 },
      bullet: { level: 0 },
      children: [
        new TextRun({ text: 'Bác sĩ trực: ', bold: true, font: FONT_FAMILY, size: 26 }),
        new TextRun({
          text: report.doctors.filter(Boolean).join(' – ') || 'Chưa phân công',
          font: FONT_FAMILY,
          size: 26,
        }),
      ],
    }),

    new Paragraph({
      spacing: { before: 60, after: 60 },
      bullet: { level: 0 },
      children: [
        new TextRun({ text: 'Điều dưỡng trực: ', bold: true, font: FONT_FAMILY, size: 26 }),
        new TextRun({
          text: report.nurses.filter(Boolean).join(' – ') || 'Chưa phân công',
          font: FONT_FAMILY,
          size: 26,
        }),
      ],
    }),

    new Paragraph({
      spacing: { before: 60, after: 60 },
      bullet: { level: 0 },
      children: [
        new TextRun({ text: 'Khoa Dược: ', bold: true, font: FONT_FAMILY, size: 26 }),
        new TextRun({ text: report.pharmacy || '—', font: FONT_FAMILY, size: 26 }),
      ],
    }),

    new Paragraph({
      spacing: { before: 60, after: 60 },
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: 'Chẩn đoán hình ảnh (X-Quang): ',
          bold: true,
          font: FONT_FAMILY,
          size: 26,
        }),
        new TextRun({ text: report.xray || '—', font: FONT_FAMILY, size: 26 }),
      ],
    }),

    new Paragraph({
      spacing: { before: 60, after: 60 },
      bullet: { level: 0 },
      children: [
        new TextRun({ text: 'Khoa Xét nghiệm: ', bold: true, font: FONT_FAMILY, size: 26 }),
        new TextRun({
          text: report.laboratory.filter(Boolean).join(' – ') || '—',
          font: FONT_FAMILY,
          size: 26,
        }),
      ],
    }),

    new Paragraph({
      spacing: { before: 60, after: 120 },
      bullet: { level: 0 },
      children: [
        new TextRun({ text: 'Bộ phận Hành chính: ', bold: true, font: FONT_FAMILY, size: 26 }),
        new TextRun({ text: report.administration || '—', font: FONT_FAMILY, size: 26 }),
      ],
    }),
  ];

  // ==========================================
  // TRANG 2: SLIDE 2 NGOẠI TRÚ
  // ==========================================
  if (outpatient) {
    const op = outpatient;
    if (!continuous) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
      );
    }
    docChildren.push(
      new Paragraph({
        spacing: { before: continuous ? 240 : 100, after: 140 },
        children: [
          new TextRun({
            text: 'II. TÌNH HÌNH NGƯỜI BỆNH NGOẠI TRÚ (SLIDE 2)',
            bold: true,
            font: FONT_FAMILY,
            size: 26,
            color: 'C00000',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: cellGridBorders,
        rows: [
          new TableRow({
            children: [
              createHeaderCell('Nội dung', 18),
              createHeaderCell('Tổng số', 12),
              createHeaderCell('Nội dung', 15),
              createHeaderCell('', 13),
              createHeaderCell('Tổng số', 14),
              createHeaderCell('Vào viện', 14),
              createHeaderCell('Tổng %', 14),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Tổng số/vào viện', 18, { align: AlignmentType.LEFT }),
              createDataCell(op.general.totalAndAdmitted, 12),
              createDataCell('PK Nội', 15, {
                verticalMerge: VerticalMergeType.RESTART,
                fill: 'EEF3FA',
              }),
              createDataCell('Tổng', 13),
              createDataCell(String(internalTotal), 14),
              createDataCell(String(internalAdmitted), 14),
              createDataCell(internalRate, 14),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Bảo hiểm y tế', 18, { align: AlignmentType.LEFT }),
              createDataCell(String(op.general.insurance), 12),
              createDataCell('', 15, { verticalMerge: VerticalMergeType.CONTINUE, fill: 'EEF3FA' }),
              createDataCell(op.internalClinics[0]?.name || 'PK 201', 13),
              createDataCell(String(op.internalClinics[0]?.total ?? 0), 14),
              createDataCell(String(op.internalClinics[0]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.internalClinics[0]?.admitted ?? 0,
                  op.internalClinics[0]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Dịch vụ', 18, { align: AlignmentType.LEFT }),
              createDataCell(String(op.general.service), 12),
              createDataCell('', 15, { verticalMerge: VerticalMergeType.CONTINUE, fill: 'EEF3FA' }),
              createDataCell(op.internalClinics[1]?.name || 'PK 202', 13),
              createDataCell(String(op.internalClinics[1]?.total ?? 0), 14),
              createDataCell(String(op.internalClinics[1]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.internalClinics[1]?.admitted ?? 0,
                  op.internalClinics[1]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Khám yêu cầu', 18, { align: AlignmentType.LEFT }),
              createDataCell(String(op.general.onDemand), 12),
              createDataCell('', 15, { verticalMerge: VerticalMergeType.CONTINUE, fill: 'EEF3FA' }),
              createDataCell(op.internalClinics[2]?.name || 'PK 204', 13),
              createDataCell(String(op.internalClinics[2]?.total ?? 0), 14),
              createDataCell(String(op.internalClinics[2]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.internalClinics[2]?.admitted ?? 0,
                  op.internalClinics[2]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Đái tháo đường', 18, { align: AlignmentType.LEFT }),
              createDataCell(String(op.general.diabetes), 12),
              createDataCell('', 15, { verticalMerge: VerticalMergeType.CONTINUE, fill: 'EEF3FA' }),
              createDataCell(op.internalClinics[3]?.name || 'PK 205', 13),
              createDataCell(String(op.internalClinics[3]?.total ?? 0), 14),
              createDataCell(String(op.internalClinics[3]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.internalClinics[3]?.admitted ?? 0,
                  op.internalClinics[3]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Tăng huyết áp', 18, {
                align: AlignmentType.LEFT,
                verticalMerge: VerticalMergeType.RESTART,
              }),
              createDataCell(String(op.general.hypertension), 12, {
                verticalMerge: VerticalMergeType.RESTART,
              }),
              createDataCell('', 15, { verticalMerge: VerticalMergeType.CONTINUE, fill: 'EEF3FA' }),
              createDataCell(op.internalClinics[4]?.name || 'PK 210', 13),
              createDataCell(String(op.internalClinics[4]?.total ?? 0), 14),
              createDataCell(String(op.internalClinics[4]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.internalClinics[4]?.admitted ?? 0,
                  op.internalClinics[4]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('', 18, { verticalMerge: VerticalMergeType.CONTINUE }),
              createDataCell('', 12, { verticalMerge: VerticalMergeType.CONTINUE }),
              createDataCell('', 15, { verticalMerge: VerticalMergeType.CONTINUE, fill: 'EEF3FA' }),
              createDataCell(op.internalClinics[5]?.name || 'PK 308', 13),
              createDataCell(String(op.internalClinics[5]?.total ?? 0), 14),
              createDataCell(String(op.internalClinics[5]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.internalClinics[5]?.admitted ?? 0,
                  op.internalClinics[5]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('', 18, { verticalMerge: VerticalMergeType.CONTINUE }),
              createDataCell('', 12, { verticalMerge: VerticalMergeType.CONTINUE }),
              createDataCell('', 15, { verticalMerge: VerticalMergeType.CONTINUE, fill: 'EEF3FA' }),
              createDataCell(op.internalClinics[6]?.name || 'PK 309', 13),
              createDataCell(String(op.internalClinics[6]?.total ?? 0), 14),
              createDataCell(String(op.internalClinics[6]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.internalClinics[6]?.admitted ?? 0,
                  op.internalClinics[6]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('COPD', 18, { align: AlignmentType.LEFT }),
              createDataCell(String(op.general.copd), 12),
              createDataCell(op.specialtyClinics[0]?.name || 'PK Ngoại', 15),
              createDataCell('', 13),
              createDataCell(String(op.specialtyClinics[0]?.total ?? 0), 14),
              createDataCell(String(op.specialtyClinics[0]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.specialtyClinics[0]?.admitted ?? 0,
                  op.specialtyClinics[0]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Điều trị ngoại trú\n YHCT - PHCN', 18, {
                align: AlignmentType.LEFT,
                fontSize: 18,
              }),
              createDataCell(String(op.general.traditionalRehab), 12),
              createDataCell(op.specialtyClinics[1]?.name || 'Pk Sản', 15),
              createDataCell('', 13),
              createDataCell(String(op.specialtyClinics[1]?.total ?? 0), 14),
              createDataCell(String(op.specialtyClinics[1]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.specialtyClinics[1]?.admitted ?? 0,
                  op.specialtyClinics[1]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Chuyển viện', 18, { align: AlignmentType.LEFT }),
              createDataCell(String(op.general.transferred), 12),
              createDataCell(op.specialtyClinics[2]?.name || 'PK Nhi', 15),
              createDataCell('', 13),
              createDataCell(String(op.specialtyClinics[2]?.total ?? 0), 14),
              createDataCell(String(op.specialtyClinics[2]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.specialtyClinics[2]?.admitted ?? 0,
                  op.specialtyClinics[2]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('', 30, {
                verticalMerge: VerticalMergeType.RESTART,
                columnSpan: 2,
                fill: 'CCD7E8',
              }),
              createDataCell(op.specialtyClinics[3]?.name || 'Pk TMH', 15),
              createDataCell('', 13),
              createDataCell(String(op.specialtyClinics[3]?.total ?? 0), 14),
              createDataCell(String(op.specialtyClinics[3]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.specialtyClinics[3]?.admitted ?? 0,
                  op.specialtyClinics[3]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('', 30, {
                verticalMerge: VerticalMergeType.CONTINUE,
                columnSpan: 2,
                fill: 'CCD7E8',
              }),
              createDataCell(op.specialtyClinics[4]?.name || 'PK Mắt', 15),
              createDataCell('', 13),
              createDataCell(String(op.specialtyClinics[4]?.total ?? 0), 14),
              createDataCell(String(op.specialtyClinics[4]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.specialtyClinics[4]?.admitted ?? 0,
                  op.specialtyClinics[4]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('', 30, {
                verticalMerge: VerticalMergeType.CONTINUE,
                columnSpan: 2,
                fill: 'CCD7E8',
              }),
              createDataCell(op.specialtyClinics[5]?.name || 'PK RHM', 15),
              createDataCell('', 13),
              createDataCell(String(op.specialtyClinics[5]?.total ?? 0), 14),
              createDataCell(String(op.specialtyClinics[5]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.specialtyClinics[5]?.admitted ?? 0,
                  op.specialtyClinics[5]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('', 30, {
                verticalMerge: VerticalMergeType.CONTINUE,
                columnSpan: 2,
                fill: 'CCD7E8',
              }),
              createDataCell(op.specialtyClinics[6]?.name || 'PK YHCT', 15),
              createDataCell('', 13),
              createDataCell(String(op.specialtyClinics[6]?.total ?? 0), 14),
              createDataCell(String(op.specialtyClinics[6]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.specialtyClinics[6]?.admitted ?? 0,
                  op.specialtyClinics[6]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('', 30, {
                verticalMerge: VerticalMergeType.CONTINUE,
                columnSpan: 2,
                fill: 'CCD7E8',
              }),
              createDataCell(op.specialtyClinics[7]?.name || 'PK cấp cứu', 15),
              createDataCell('', 13),
              createDataCell(String(op.specialtyClinics[7]?.total ?? 0), 14),
              createDataCell(String(op.specialtyClinics[7]?.admitted ?? 0), 14),
              createDataCell(
                calculateRate(
                  op.specialtyClinics[7]?.admitted ?? 0,
                  op.specialtyClinics[7]?.total ?? 0,
                ),
                14,
              ),
            ],
          }),
        ],
      }),
    );
  }

  // ==========================================
  // TRANG 3: SLIDE 3 KHÁM NGOÀI GIỜ
  // ==========================================
  if (afterHours) {
    const ah = afterHours;
    const prescriptionsTotal = calculatePrescriptionsTotal(ah.details);
    const totalExams = calculateTotalExams(ah);

    if (!continuous) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
      );
    }
    docChildren.push(
      new Paragraph({
        spacing: { before: continuous ? 240 : 100, after: 140 },
        children: [
          new TextRun({
            text: 'III. KHÁM NGOÀI GIỜ (SLIDE 3)',
            bold: true,
            font: FONT_FAMILY,
            size: 26,
            color: 'C00000',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: cellGridBorders,
        rows: [
          new TableRow({
            children: [
              createDataCell('Tổng khám', 50, { align: AlignmentType.LEFT, columnSpan: 2 }),
              createDataCell(String(totalExams), 50, { columnSpan: 2, fontSize: 22 }),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Vào viện', 50, { align: AlignmentType.LEFT, columnSpan: 2 }),
              createDataCell(String(ah.admitted), 50, { columnSpan: 2 }),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Chuyển viện:', 50, { align: AlignmentType.LEFT, columnSpan: 2 }),
              createDataCell(String(ah.transferred), 50, { columnSpan: 2 }),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('Kê đơn, trong đó:', 50, { align: AlignmentType.LEFT, columnSpan: 2 }),
              createDataCell(String(prescriptionsTotal), 50, { columnSpan: 2 }),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('1', 10),
              createDataCell('- Tiêu hóa, tiết niệu', 40, { align: AlignmentType.LEFT, bold: false }),
              createDataCell(String(ah.details.digestiveAndUrinary), 50, { columnSpan: 2 }),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('2', 10),
              createDataCell('- Hô hấp, sốt', 40, { align: AlignmentType.LEFT, bold: false }),
              createDataCell(String(ah.details.respiratoryAndFever), 50, { columnSpan: 2 }),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('3', 10),
              createDataCell('- Chấn thương', 40, { align: AlignmentType.LEFT, bold: false }),
              createDataCell(String(ah.details.trauma), 50, { columnSpan: 2 }),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('4', 10),
              createDataCell('- Sản', 40, { align: AlignmentType.LEFT, bold: false }),
              createDataCell(`Khám: ${ah.details.obstetricsExam}`, 25),
              createDataCell(`Vào viện: ${ah.details.obstetricsAdmitted}`, 25),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('5', 10),
              createDataCell('- Khám Nhi', 40, { align: AlignmentType.LEFT, bold: false }),
              createDataCell(`Khám: ${ah.details.pediatricsExam}`, 25),
              createDataCell(`Vào viện: ${ah.details.pediatricsAdmitted}`, 25),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('6', 10),
              createDataCell('- Khám khác:', 40, { align: AlignmentType.LEFT, bold: false }),
              createDataCell(String(ah.details.otherExam), 50, { columnSpan: 2 }),
            ],
          }),
        ],
      }),
    );
  }

  // ==========================================
  // TRANG 4: SLIDE 4 NỘI TRÚ
  // ==========================================
  if (inpatient) {
    let sumOld = 0;
    let sumAdm = 0;
    let sumDisc = 0;
    let sumTrans = 0;
    let sumDec = 0;
    let sumCur = 0;
    let sumBeds = 0;

    const deptRows: TableRow[] = inpatient.departments.map((dept) => {
      sumOld += Number(dept.oldPatients) || 0;
      sumAdm += Number(dept.admitted) || 0;
      sumDisc += Number(dept.discharged) || 0;
      sumTrans += Number(dept.transferred) || 0;
      sumDec += Number(dept.deceased) || 0;
      const cur = calculateCurrentPatients(dept);
      sumCur += cur;
      sumBeds += Number(dept.actualBeds) || 0;
      const diff = calculateBedDifference(dept.actualBeds, cur);

      return new TableRow({
        children: [
          createDataCell(dept.name, 12, { fontSize: 18 }),
          createDataCell(String(dept.oldPatients), 10, { fontSize: 18, bold: false }),
          createDataCell(String(dept.admitted), 10, { fontSize: 18, bold: false }),
          createDataCell(String(dept.discharged), 10, { fontSize: 18, bold: false }),
          createDataCell(String(dept.transferred), 13, { fontSize: 18, bold: false }),
          createDataCell(String(dept.deceased), 12, { fontSize: 18, bold: false }),
          createDataCell(String(cur), 11, { fontSize: 18, bold: false }),
          createDataCell(String(dept.actualBeds), 11, { fontSize: 18, bold: true }),
          createDataCell(diff, 11, { fontSize: 18, bold: false }),
        ],
      });
    });

    const sumDiff = calculateBedDifference(sumBeds, sumCur);

    if (!continuous) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
      );
    }
    docChildren.push(
      new Paragraph({
        spacing: { before: continuous ? 240 : 100, after: 140 },
        children: [
          new TextRun({
            text: 'IV. TÌNH HÌNH NGƯỜI BỆNH NỘI TRÚ (SLIDE 4)',
            bold: true,
            font: FONT_FAMILY,
            size: 26,
            color: 'C00000',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: cellGridBorders,
        rows: [
          new TableRow({
            children: [
              createHeaderCell('', 12, 'FAFAFA', '000000'),
              createHeaderCell('CŨ', 10, 'FAFAFA', '000000'),
              createHeaderCell('VÀO', 10, 'FAFAFA', '000000'),
              createHeaderCell('RA', 10, 'FAFAFA', '000000'),
              createHeaderCell('CHUYỂN VIỆN', 13, 'FAFAFA', '000000'),
              createHeaderCell('TỬ VONG', 12, 'FAFAFA', '000000'),
              createHeaderCell('HIỆN CÓ', 11, 'FAFAFA', '000000'),
              createHeaderCell('GIƯỜNG THỰC KÊ', 11, 'FAFAFA', '000000'),
              createHeaderCell('THỪA/THIẾU', 11, 'FAFAFA', '000000'),
            ],
          }),
          new TableRow({
            children: [
              createDataCell('TỔNG', 12, { fontSize: 18, bold: true }),
              createDataCell(String(sumOld), 10, { fontSize: 18, bold: true }),
              createDataCell(String(sumAdm), 10, { fontSize: 18, bold: true }),
              createDataCell(String(sumDisc), 10, { fontSize: 18, bold: true }),
              createDataCell(String(sumTrans), 13, { fontSize: 18, bold: true }),
              createDataCell(String(sumDec), 12, { fontSize: 18, bold: true }),
              createDataCell(String(sumCur), 11, { fontSize: 18, bold: true }),
              createDataCell(String(sumBeds), 11, { fontSize: 18, bold: true }),
              createDataCell(sumDiff, 11, { fontSize: 18, bold: true }),
            ],
          }),
          ...deptRows,
        ],
      }),
    );
  }

  // ==========================================
  // CÁC SLIDE VĂN BẢN TỰ DO (SLIDE 5, ...)
  // ==========================================
  if (freeTextSlides && freeTextSlides.length > 0) {
    freeTextSlides.forEach((slide) => {
      const slideParagraphs: Paragraph[] = [];
      if (!continuous) {
        slideParagraphs.push(
          new Paragraph({
            children: [new PageBreak()],
          }),
        );
      }
      slideParagraphs.push(
        new Paragraph({
          spacing: { before: continuous ? 240 : 100, after: 180 },
          children: [
            new TextRun({
              text: slide.title || 'TIÊU ĐỀ NỘI DUNG',
              bold: true,
              font: FONT_FAMILY,
              size: 26,
              color: 'C00000',
            }),
          ],
        }),
      );

      slide.items.forEach((item, index) => {
        const lines = item.content.split('\n');
        const firstLine = lines[0] || '';
        const restLines = lines.slice(1);

        slideParagraphs.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({
                text: `${index + 1}, `,
                bold: true,
                font: FONT_FAMILY,
                size: 24,
              }),
              new TextRun({
                text: firstLine,
                bold: true,
                font: FONT_FAMILY,
                size: 24,
              }),
            ],
          }),
        );

        restLines.forEach((line) => {
          slideParagraphs.push(
            new Paragraph({
              spacing: { before: 20, after: 20 },
              indent: { left: 400 },
              children: [
                new TextRun({
                  text: line,
                  font: FONT_FAMILY,
                  size: 24,
                }),
              ],
            }),
          );
        });
      });

      docChildren.push(...slideParagraphs);
    });
  }

  // ==========================================
  // CÁC SLIDE BÁO CÁO CA BỆNH SOAP
  // ==========================================
  if (soapSlides && soapSlides.length > 0) {
    soapSlides.forEach((soap) => {
      const soapRows: TableRow[] = [
        new TableRow({
          children: [
            createHeaderCell('Thời gian\n(Ngày, giờ)', 14, 'FAFAFA', '000000'),
            createHeaderCell(
              'Diễn biến bệnh\n(Viết diễn biến theo cấu trúc như SOAP)',
              43,
              'FAFAFA',
              '000000',
            ),
            createHeaderCell('Chỉ định', 43, 'FAFAFA', '000000'),
          ],
        }),
      ];

      soap.rows.forEach((row) => {
        soapRows.push(
          new TableRow({
            children: [
              createDataCell(row.timeText, 14, {
                align: AlignmentType.CENTER,
                fontSize: 18,
                bold: true,
              }),
              createDataCell(row.progression, 43, {
                align: AlignmentType.LEFT,
                fontSize: 18,
                bold: false,
              }),
              createDataCell(row.orders, 43, {
                align: AlignmentType.LEFT,
                fontSize: 18,
                bold: false,
              }),
            ],
          }),
        );
      });

      if (!continuous) {
        docChildren.push(
          new Paragraph({
            children: [new PageBreak()],
          }),
        );
      }
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: continuous ? 240 : 100, after: 150 },
          children: [
            new TextRun({
              text: soap.patientHeader || 'BÁO CÁO CA BỆNH',
              bold: true,
              font: FONT_FAMILY,
              size: 26,
              color: '000000',
            }),
          ],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: cellGridBorders,
          rows: soapRows,
        }),
      );
    });
  }

  // ==========================================
  // SLIDE: BỆNH NHÂN THEO DÕI
  // ==========================================
  if (monitoring && monitoring.departments && monitoring.departments.length > 0) {
    const monitoringRows: TableRow[] = [
      new TableRow({
        children: [
          createHeaderCell('KHOA', 50, { fill: '3866B1', color: 'FFFFFF', fontSize: 22 }),
          createHeaderCell('BN THEO DÕI', 50, { fill: '3866B1', color: 'FFFFFF', fontSize: 22 }),
        ],
      }),
    ];

    monitoring.departments.forEach((dept, index) => {
      const isAltDark = index % 2 === 0;
      const fill = isAltDark ? 'C9D2E7' : 'EBEDF6';

      monitoringRows.push(
        new TableRow({
          children: [
            createDataCell(dept.name, 50, {
              bold: true,
              fill,
              fontSize: 21,
              spaceBefore: 60,
              spaceAfter: 60,
            }),
            createDataCell(String(dept.count ?? 0), 50, {
              bold: true,
              fill,
              fontSize: 21,
              spaceBefore: 60,
              spaceAfter: 60,
            }),
          ],
        }),
      );
    });

    if (!continuous) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
      );
    }
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: continuous ? 240 : 120, after: 180 },
        children: [
          new TextRun({
            text: monitoring.title || 'VIII. BỆNH NHÂN THEO DÕI',
            bold: true,
            font: FONT_FAMILY,
            size: 28,
            color: 'E50000',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: cellGridBorders,
        rows: monitoringRows,
      }),
    );
  }

  // ==========================================
  // SLIDE: BỆNH NHÂN KHÁM / XỬ TRÍ (BẢNG 6 CỘT)
  // ==========================================
  if (patientCaseTableSlides && patientCaseTableSlides.length > 0) {
    patientCaseTableSlides.forEach((slide) => {
      const caseRows: TableRow[] = [
        new TableRow({
          children: [
            createHeaderCell('STT', 5, 'FAFAFA', '000000'),
            createHeaderCell('Họ và tên/tuổi/địa chỉ/giờ', 15, 'FAFAFA', '000000'),
            createHeaderCell('Lý do khám / chẩn đoán sơ bộ', 31, 'FAFAFA', '000000'),
            createHeaderCell('Cận lâm sàng', 22, 'FAFAFA', '000000'),
            createHeaderCell('Chẩn đoán', 13, 'FAFAFA', '000000'),
            createHeaderCell('Xử trí', 14, 'FAFAFA', '000000'),
          ],
        }),
      ];

      slide.rows.forEach((row, rIndex) => {
        const patientLines = (row.patientInfo || '').split('\n');
        const firstLine = patientLines[0] || '';
        const restLines = patientLines.slice(1);

        const patientInfoParagraphs = [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 20, after: 20 },
            children: [
              new TextRun({
                text: firstLine,
                bold: true,
                font: FONT_FAMILY,
                size: 18,
              }),
            ],
          }),
          ...restLines.map(
            (line) =>
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 10, after: 10 },
                children: [
                  new TextRun({
                    text: line,
                    bold: false,
                    font: FONT_FAMILY,
                    size: 17,
                  }),
                ],
              }),
          ),
        ];

        caseRows.push(
          new TableRow({
            children: [
              createDataCell(row.stt || String(rIndex + 1), 5, {
                bold: true,
                fontSize: 18,
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                borders: cellGridBorders,
                verticalAlign: VerticalAlign.TOP,
                children:
                  patientInfoParagraphs.length > 0
                    ? patientInfoParagraphs
                    : [new Paragraph({ text: '' })],
              }),
              createDataCell(row.reasonAndExam, 31, {
                align: AlignmentType.LEFT,
                bold: false,
                fontSize: 17,
              }),
              createDataCell(row.subclinical, 22, {
                align: AlignmentType.LEFT,
                bold: false,
                fontSize: 17,
              }),
              createDataCell(row.diagnosis, 13, {
                align: AlignmentType.LEFT,
                bold: false,
                fontSize: 17,
              }),
              createDataCell(row.treatment, 14, {
                align: AlignmentType.LEFT,
                bold: false,
                fontSize: 17,
              }),
            ],
          }),
        );
      });

      const slideChildren: (Paragraph | Table)[] = [];
      if (!continuous) {
        slideChildren.push(
          new Paragraph({
            children: [new PageBreak()],
          }),
        );
      }

      if (slide.title) {
        slideChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: continuous ? 240 : 100, after: 150 },
            children: [
              new TextRun({
                text: slide.title,
                bold: true,
                font: FONT_FAMILY,
                size: 26,
                color: 'E50000',
              }),
            ],
          }),
        );
      }

      slideChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: cellGridBorders,
          rows: caseRows,
        }),
      );

      docChildren.push(...slideChildren);
    });
  }

  // ==========================================
  // PHẦN CHỮ KÝ (CUỐI TÀI LIỆU)
  // ==========================================
  docChildren.push(
    new Paragraph({ text: '', spacing: { before: 280, after: 120 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: cellNoBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: cellNoBorders,
              children: [new Paragraph({ text: '' })],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: cellNoBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `Ngày ${dateInfo.day} tháng ${dateInfo.month} năm ${dateInfo.year}`,
                      italics: true,
                      font: FONT_FAMILY,
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: 'TRƯỞNG PHIÊN THƯỜNG TRỰC',
                      bold: true,
                      font: FONT_FAMILY,
                      size: 24,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: '(Ký, ghi rõ họ tên)',
                      italics: true,
                      font: FONT_FAMILY,
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~2.0 cm
              bottom: 1134, // ~2.0 cm
              left: 1417, // ~2.5 cm
              right: 850, // ~1.5 cm
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const suffix = continuous ? '' : '-tung-trang';
  link.download = `Bao-cao-giao-ban-${report.reportDate || 'ngay'}${suffix}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
