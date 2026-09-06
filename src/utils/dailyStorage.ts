import { defaultReport, type ReportData } from '../data/defaultReport';
import {
  defaultOutpatientReport,
  type OutpatientReportData,
} from '../data/outpatientReport';
import {
  defaultAfterHoursReport,
  type AfterHoursReportData,
} from '../data/afterHoursReport';
import {
  defaultInpatientReport,
  type InpatientReportData,
} from '../data/inpatientReport';
import {
  defaultFreeTextSlides,
  type FreeTextSlideData,
} from '../data/freeTextReport';
import {
  defaultSoapSlides,
  type SoapSlideData,
} from '../data/soapReport';
import {
  defaultMonitoringReport,
  type MonitoringReportData,
} from '../data/monitoringReport';
import {
  defaultPatientCaseTableSlides,
  type PatientCaseTableSlideData,
} from '../data/patientCaseTableReport';

export type DailyGiaoBanBundle = {
  date: string; // Định dạng "YYYY-MM-DD"
  report: ReportData; // Slide 1
  outpatient: OutpatientReportData; // Slide 2
  afterHours: AfterHoursReportData; // Slide 3
  inpatient: InpatientReportData; // Slide 4
  freeTextSlides: FreeTextSlideData[]; // Slide 5..
  soapSlides: SoapSlideData[]; // Slide 6..
  monitoring: MonitoringReportData; // Slide 8
  patientCaseTableSlides: PatientCaseTableSlideData[]; // Slide 9
  updatedAt: string; // ISO string
};

const DATES_INDEX_KEY = 'giao-ban-dates-index-v1';
const ACTIVE_DATE_KEY = 'giao-ban-active-date-v1';

// Các key lưu trữ cũ để auto-migration
const LEGACY_STORAGE_KEYS = {
  report: 'giao-ban-slide-1-v1',
  outpatient: 'giao-ban-slide-2-v1',
  afterHours: 'giao-ban-slide-3-v1',
  inpatient: 'giao-ban-slide-4-v1',
  freeText: 'giao-ban-freetext-slides-v1',
  soap: 'giao-ban-soap-slides-v1',
  monitoring: 'giao-ban-monitoring-slides-v1',
  caseTable: 'giao-ban-patient-case-tables-v1',
};

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr || '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function getSavedDateList(): string[] {
  try {
    const raw = localStorage.getItem(DATES_INDEX_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as string[];
    return Array.isArray(list) ? list.sort().reverse() : [];
  } catch {
    return [];
  }
}

export function getActiveDate(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_DATE_KEY);
    if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) {
      return saved;
    }
    return getTodayString();
  } catch {
    return getTodayString();
  }
}

export function setActiveDate(dateStr: string): void {
  try {
    localStorage.setItem(ACTIVE_DATE_KEY, dateStr);
  } catch {
    // ignore
  }
}

function getBundleStorageKey(dateStr: string): string {
  return `giao-ban-bundle-${dateStr}`;
}

/**
 * Kiểm tra và gom dữ liệu legacy (nếu có) thành bundle đầu tiên
 */
function tryMigrateLegacyData(targetDate: string): DailyGiaoBanBundle | null {
  try {
    const rawReport = localStorage.getItem(LEGACY_STORAGE_KEYS.report);
    const rawOutpatient = localStorage.getItem(LEGACY_STORAGE_KEYS.outpatient);
    const rawInpatient = localStorage.getItem(LEGACY_STORAGE_KEYS.inpatient);

    if (!rawReport && !rawOutpatient && !rawInpatient) {
      return null;
    }

    const report = rawReport ? JSON.parse(rawReport) : defaultReport;
    const outpatient = rawOutpatient ? JSON.parse(rawOutpatient) : defaultOutpatientReport;
    const rawAfter = localStorage.getItem(LEGACY_STORAGE_KEYS.afterHours);
    const afterHours = rawAfter ? JSON.parse(rawAfter) : defaultAfterHoursReport;
    const inpatient = rawInpatient ? JSON.parse(rawInpatient) : defaultInpatientReport;

    const rawFree = localStorage.getItem(LEGACY_STORAGE_KEYS.freeText);
    const freeTextSlides = rawFree ? JSON.parse(rawFree) : defaultFreeTextSlides;

    const rawSoap = localStorage.getItem(LEGACY_STORAGE_KEYS.soap);
    const soapSlides = rawSoap ? JSON.parse(rawSoap) : defaultSoapSlides;

    const rawMon = localStorage.getItem(LEGACY_STORAGE_KEYS.monitoring);
    const monitoring = rawMon ? JSON.parse(rawMon) : defaultMonitoringReport;

    const rawCase = localStorage.getItem(LEGACY_STORAGE_KEYS.caseTable);
    const patientCaseTableSlides = rawCase ? JSON.parse(rawCase) : defaultPatientCaseTableSlides;

    const bundleDate = targetDate || report.reportDate || getTodayString();

    const migratedBundle: DailyGiaoBanBundle = {
      date: bundleDate,
      report: {
        ...report,
        reportDate: bundleDate,
      },
      outpatient,
      afterHours,
      inpatient,
      freeTextSlides,
      soapSlides,
      monitoring,
      patientCaseTableSlides,
      updatedAt: new Date().toISOString(),
    };

    saveDailyBundle(migratedBundle);
    return migratedBundle;
  } catch (err) {
    console.error('Lỗi khi migrate dữ liệu legacy:', err);
    return null;
  }
}

/**
 * Tạo một bundle mặc định trắng cho một ngày cụ thể
 */
export function createDefaultBundle(dateStr: string): DailyGiaoBanBundle {
  return {
    date: dateStr,
    report: {
      ...defaultReport,
      reportDate: dateStr,
    },
    outpatient: defaultOutpatientReport,
    afterHours: defaultAfterHoursReport,
    inpatient: defaultInpatientReport,
    freeTextSlides: defaultFreeTextSlides,
    soapSlides: defaultSoapSlides,
    monitoring: defaultMonitoringReport,
    patientCaseTableSlides: defaultPatientCaseTableSlides,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Tải bundle của một ngày trực
 */
export function loadDailyBundle(dateStr: string): {
  bundle: DailyGiaoBanBundle;
  isExisting: boolean;
} {
  try {
    const key = getBundleStorageKey(dateStr);
    const raw = localStorage.getItem(key);

    if (raw) {
      const parsed = JSON.parse(raw) as DailyGiaoBanBundle;
      return { bundle: parsed, isExisting: true };
    }

    // Nếu chưa có bundle cho ngày này, thử migrate dữ liệu cũ nếu là ngày hôm nay
    const today = getTodayString();
    if (dateStr === today || getSavedDateList().length === 0) {
      const migrated = tryMigrateLegacyData(dateStr);
      if (migrated) {
        return { bundle: migrated, isExisting: true };
      }
    }

    // Chưa có dữ liệu cho ngày này
    return {
      bundle: createDefaultBundle(dateStr),
      isExisting: false,
    };
  } catch (err) {
    console.error(`Lỗi khi load bundle ngày ${dateStr}:`, err);
    return {
      bundle: createDefaultBundle(dateStr),
      isExisting: false,
    };
  }
}

/**
 * Lưu bundle của một ngày trực vào LocalStorage
 */
export function saveDailyBundle(bundle: DailyGiaoBanBundle): void {
  try {
    const updatedBundle: DailyGiaoBanBundle = {
      ...bundle,
      updatedAt: new Date().toISOString(),
    };

    const key = getBundleStorageKey(bundle.date);
    localStorage.setItem(key, JSON.stringify(updatedBundle));

    // Cập nhật index danh sách ngày
    const dates = getSavedDateList();
    if (!dates.includes(bundle.date)) {
      dates.push(bundle.date);
      dates.sort().reverse();
      localStorage.setItem(DATES_INDEX_KEY, JSON.stringify(dates));
    }
  } catch (err) {
    console.error(`Lỗi khi lưu bundle ngày ${bundle.date}:`, err);
  }
}

/**
 * Xóa báo cáo của một ngày
 */
export function deleteDailyBundle(dateStr: string): void {
  try {
    localStorage.removeItem(getBundleStorageKey(dateStr));
    const dates = getSavedDateList().filter((d) => d !== dateStr);
    localStorage.setItem(DATES_INDEX_KEY, JSON.stringify(dates));
  } catch (err) {
    console.error(`Lỗi khi xóa bundle ngày ${dateStr}:`, err);
  }
}

/**
 * Kế thừa thông minh khi sao chép từ ngày cũ sang ngày mới:
 * - Slide 1: Đổi ngày sang targetDateStr
 * - Slide 2 (Ngoại trú): Reset lượt khám về 0
 * - Slide 3 (Khám ngoài giờ): Reset số liệu về 0
 * - Slide 4 (Nội trú): LẤY "HIỆN CÓ" CỦA NGÀY CŨ CHUYỂN THÀNH "CŨ" CỦA NGÀY MỚI!
 *   Vào / Ra / Chuyển / Tử vong reset về 0.
 * - Slide 5, 6, 8, 9: Kế thừa danh sách theo dõi & ca bệnh.
 */
export function cloneBundleToDate(
  sourceBundle: DailyGiaoBanBundle,
  targetDateStr: string,
): DailyGiaoBanBundle {
  const cloned: DailyGiaoBanBundle = JSON.parse(JSON.stringify(sourceBundle));

  cloned.date = targetDateStr;
  cloned.report.reportDate = targetDateStr;
  cloned.updatedAt = new Date().toISOString();

  // 1. Reset ngoại trú
  cloned.outpatient.internalClinics = cloned.outpatient.internalClinics.map((c) => ({
    ...c,
    total: 0,
    admitted: 0,
  }));
  cloned.outpatient.specialtyClinics = cloned.outpatient.specialtyClinics.map((c) => ({
    ...c,
    total: 0,
    admitted: 0,
  }));

  // 2. Reset khám ngoài giờ
  cloned.afterHours = {
    admitted: 0,
    transferred: 0,
    details: {
      digestiveAndUrinary: 0,
      respiratoryAndFever: 0,
      trauma: 0,
      obstetricsExam: 0,
      obstetricsAdmitted: 0,
      pediatricsExam: 0,
      pediatricsAdmitted: 0,
      otherExam: 0,
    },
  };

  // 3. Kế thừa nội trú: "Hiện có" hôm qua -> "Cũ" hôm nay
  cloned.inpatient.departments = cloned.inpatient.departments.map((dept) => {
    const currentPatients =
      (Number(dept.oldPatients) || 0) +
      (Number(dept.admitted) || 0) -
      (Number(dept.discharged) || 0) -
      (Number(dept.transferred) || 0) -
      (Number(dept.deceased) || 0);

    return {
      ...dept,
      oldPatients: currentPatients > 0 ? currentPatients : 0,
      admitted: 0,
      discharged: 0,
      transferred: 0,
      deceased: 0,
    };
  });

  return cloned;
}

/**
 * Tìm ngày có dữ liệu gần nhất trước một ngày cụ thể
 */
export function findClosestPreviousDate(
  targetDate: string,
  dateList?: string[],
): string | undefined {
  const savedDates = dateList || getSavedDateList();
  const pastDates = savedDates.filter((d) => d < targetDate);
  if (pastDates.length > 0) {
    return pastDates[0]; // Vì list đã được sắp xếp giảm dần nên phần tử đầu tiên là ngày gần nhất
  }
  // Nếu không có ngày trước đó, lấy ngày bất kỳ gần nhất
  return savedDates[0];
}

/**
 * Tải file sao lưu JSON về máy tính
 */
export function downloadBackupFile(): void {
  const jsonStr = exportAllDataAsJson();
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BaoCaoGiaoBan_Backup_${getTodayString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Đọc file sao lưu JSON và nhập dữ liệu
 */
export async function importBackupFromFile(file: File): Promise<{
  success: boolean;
  message: string;
  importedCount: number;
  latestDate?: string;
}> {
  const text = await file.text();
  return importAllDataFromJson(text);
}

/**
 * Xuất toàn bộ dữ liệu ra chuỗi JSON để sao lưu file
 */
export function exportAllDataAsJson(): string {
  const savedDates = getSavedDateList();
  const allBundles: Record<string, DailyGiaoBanBundle> = {};

  savedDates.forEach((dateStr) => {
    const raw = localStorage.getItem(getBundleStorageKey(dateStr));
    if (raw) {
      try {
        allBundles[dateStr] = JSON.parse(raw);
      } catch {
        // ignore
      }
    }
  });

  const payload = {
    appName: 'giao-ban-web',
    appTitle: 'Báo cáo giao ban Bệnh viện Hùng Cường',
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    dates: savedDates,
    bundles: allBundles,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Nhập dữ liệu từ file sao lưu JSON
 */
export function importAllDataFromJson(jsonStr: string): {
  success: boolean;
  message: string;
  importedCount: number;
  latestDate?: string;
} {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || !data.bundles || typeof data.bundles !== 'object') {
      return {
        success: false,
        message: 'Tệp sao lưu không đúng định dạng của Báo cáo giao ban!',
        importedCount: 0,
      };
    }

    const bundleEntries = Object.entries(data.bundles) as [string, DailyGiaoBanBundle][];
    let count = 0;
    const allDates = new Set<string>(getSavedDateList());

    bundleEntries.forEach(([dateStr, bundle]) => {
      if (dateStr && bundle && bundle.report) {
        localStorage.setItem(getBundleStorageKey(dateStr), JSON.stringify(bundle));
        allDates.add(dateStr);
        count++;
      }
    });

    const sortedDates = Array.from(allDates).sort().reverse();
    localStorage.setItem(DATES_INDEX_KEY, JSON.stringify(sortedDates));

    const latestDate = sortedDates[0] || getTodayString();
    setActiveDate(latestDate);

    return {
      success: true,
      message: `Đã khôi phục thành công ${count} ngày báo cáo giao ban!`,
      importedCount: count,
      latestDate,
    };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi đọc tệp sao lưu: ${err instanceof Error ? err.message : String(err)}`,
      importedCount: 0,
    };
  }
}
