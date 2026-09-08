import { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Printer,
  Save,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileDown,
  PanelRightClose,
  PanelRightOpen,
  Loader2,
  PlusCircle,
  Stethoscope,
  TableProperties,
} from 'lucide-react';
import EditorPanel from './components/EditorPanel';
import EditorPanel2 from './components/EditorPanel2';
import EditorPanel3 from './components/EditorPanel3';
import EditorPanel4 from './components/EditorPanel4';
import EditorPanelFreeText from './components/EditorPanelFreeText';
import EditorPanelSoap from './components/EditorPanelSoap';
import EditorPanelMonitoring from './components/EditorPanelMonitoring';
import EditorPanelPatientCaseTable from './components/EditorPanelPatientCaseTable';
import SlidePreview from './components/SlidePreview';
import Slide2Preview from './components/Slide2Preview';
import Slide3Preview from './components/Slide3Preview';
import Slide4Preview from './components/Slide4Preview';
import FreeTextSlidePreview from './components/FreeTextSlidePreview';
import SoapSlidePreview from './components/SoapSlidePreview';
import MonitoringSlidePreview from './components/MonitoringSlidePreview';
import PatientCaseTableSlidePreview from './components/PatientCaseTableSlidePreview';
import WordExportButton from './components/WordExportButton';
import { defaultReport, type ReportData } from './data/defaultReport';
import {
  defaultOutpatientReport,
  type OutpatientReportData,
} from './data/outpatientReport';
import {
  defaultAfterHoursReport,
  type AfterHoursReportData,
} from './data/afterHoursReport';
import {
  defaultInpatientReport,
  type InpatientReportData,
} from './data/inpatientReport';
import {
  defaultFreeTextSlides,
  type FreeTextSlideData,
} from './data/freeTextReport';
import {
  defaultSoapSlides,
  type SoapSlideData,
} from './data/soapReport';
import {
  defaultMonitoringReport,
  type MonitoringReportData,
} from './data/monitoringReport';
import {
  defaultPatientCaseTableSlides,
  type PatientCaseTableSlideData,
} from './data/patientCaseTableReport';

import {
  DailyGiaoBanBundle,
  getActiveDate,
  setActiveDate,
  getSavedDateList,
  loadDailyBundle,
  saveDailyBundle,
  createDefaultBundle,
  cloneBundleToDate,
  findClosestPreviousDate,
  exportAllDataAsJson,
  downloadBackupFile,
  importBackupFromFile,
  importAllDataFromJson,
  formatDisplayDate,
  apiCheckServer,
  apiGetServerDates,
  apiGetServerBundle,
  apiSyncLocalToServer,
} from './utils/dailyStorage';
import DateSelectorBar from './components/DateSelectorBar';
import UninitializedDateModal from './components/UninitializedDateModal';

// Nạp sẵn dữ liệu của ngày đang hoạt động (hỗ trợ auto-migration ngày đầu tiên)
const initialLoad = loadDailyBundle(getActiveDate());
const initialBundle = initialLoad.bundle;

export default function App() {
  const [currentDate, setCurrentDate] = useState<string>(initialBundle.date);
  const [savedDates, setSavedDates] = useState<string[]>(getSavedDateList);
  const [uninitModal, setUninitModal] = useState<{
    isOpen: boolean;
    targetDate: string;
    closestDate?: string;
  } | null>(null);

  const [report, setReport] = useState<ReportData>(initialBundle.report);
  const [outpatient, setOutpatient] = useState<OutpatientReportData>(initialBundle.outpatient);
  const [afterHours, setAfterHours] = useState<AfterHoursReportData>(initialBundle.afterHours);
  const [inpatient, setInpatient] = useState<InpatientReportData>(initialBundle.inpatient);
  const [freeTextSlides, setFreeTextSlides] = useState<FreeTextSlideData[]>(initialBundle.freeTextSlides);
  const [soapSlides, setSoapSlides] = useState<SoapSlideData[]>(initialBundle.soapSlides);
  const [monitoring, setMonitoring] = useState<MonitoringReportData>(initialBundle.monitoring);
  const [patientCaseTableSlides, setPatientCaseTableSlides] = useState<PatientCaseTableSlideData[]>(
    initialBundle.patientCaseTableSlides,
  );

  const totalSlideCount =
    4 + freeTextSlides.length + soapSlides.length + 1 + patientCaseTableSlides.length;

  // Mở sẵn slide ca bệnh dạng bảng mới
  const [activeSlide, setActiveSlide] = useState<number>(totalSlideCount);

  const [savedAt, setSavedAt] = useState<string>(
    initialLoad.isExisting
      ? `Bản lưu ngày ${formatDisplayDate(initialBundle.date)}`
      : `Ngày mới (${formatDisplayDate(initialBundle.date)}) - Chưa lưu`,
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const applyBundleToStates = useCallback((bundle: DailyGiaoBanBundle) => {
    setReport(bundle.report);
    setOutpatient(bundle.outpatient);
    setAfterHours(bundle.afterHours);
    setInpatient(bundle.inpatient);
    setFreeTextSlides(bundle.freeTextSlides);
    setSoapSlides(bundle.soapSlides);
    setMonitoring(bundle.monitoring);
    setPatientCaseTableSlides(bundle.patientCaseTableSlides);
  }, []);

  const getCurrentBundle = useCallback((): DailyGiaoBanBundle => {
    return {
      date: currentDate,
      report,
      outpatient,
      afterHours,
      inpatient,
      freeTextSlides,
      soapSlides,
      monitoring,
      patientCaseTableSlides,
      updatedAt: new Date().toISOString(),
    };
  }, [
    currentDate,
    report,
    outpatient,
    afterHours,
    inpatient,
    freeTextSlides,
    soapSlides,
    monitoring,
    patientCaseTableSlides,
  ]);

  useEffect(() => {
    setSavedDates(getSavedDateList());
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const enterPresentation = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(true);
    }
  }, []);

  const exitPresentation = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F5') {
        e.preventDefault();
        if (isFullscreen) {
          exitPresentation();
        } else {
          enterPresentation();
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        exitPresentation();
      } else if (isFullscreen) {
        if (
          e.key === 'ArrowRight' ||
          e.key === 'ArrowDown' ||
          e.key === 'PageDown' ||
          e.key === ' ' ||
          e.key === 'Enter'
        ) {
          setActiveSlide((prev) => (prev < totalSlideCount ? prev + 1 : 1));
        } else if (
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowUp' ||
          e.key === 'PageUp' ||
          e.key === 'Backspace'
        ) {
          setActiveSlide((prev) => (prev > 1 ? prev - 1 : totalSlideCount));
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, totalSlideCount, enterPresentation, exitPresentation]);

  // Điều hướng chuyển slide bằng chuột khi đang trình chiếu: Chuột trái = Next, Chuột phải = Lùi
  useEffect(() => {
    if (!isFullscreen) return;

    function handleMouseDown(e: MouseEvent) {
      // Bỏ qua nếu click vào nút thoát trình chiếu
      if ((e.target as HTMLElement).closest('.exit-presentation-btn')) {
        return;
      }

      if (e.button === 0) {
        // Chuột trái: Chuyển tiếp (Next slide)
        setActiveSlide((prev) => (prev < totalSlideCount ? prev + 1 : 1));
      } else if (e.button === 2) {
        // Chuột phải: Lùi lại (Previous slide)
        e.preventDefault();
        setActiveSlide((prev) => (prev > 1 ? prev - 1 : totalSlideCount));
      }
    }

    function handleContextMenu(e: MouseEvent) {
      // Chặn hiển thị menu ngữ cảnh chuột phải của trình duyệt khi đang trình chiếu
      e.preventDefault();
    }

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isFullscreen, totalSlideCount]);

  const [isServerMode, setIsServerMode] = useState<boolean>(false);

  // Đồng bộ với máy chủ lưu trữ tập trung khi khởi động
  useEffect(() => {
    let isMounted = true;

    async function initServer() {
      const isAvailable = await apiCheckServer();
      if (!isAvailable || !isMounted) return;
      setIsServerMode(true);

      // Bước 1: Nếu client này có dữ liệu trong LocalStorage (máy của bạn đã nhập 5 ngày bao gồm 1/9/2026),
      // tự động đồng bộ đẩy toàn bộ lên Server để lưu vào server-data!
      await apiSyncLocalToServer();

      // Bước 2: Lấy danh sách ngày chuẩn nhất từ Server
      const serverDates = await apiGetServerDates();
      if (serverDates && serverDates.length > 0 && isMounted) {
        setSavedDates(serverDates);
        localStorage.setItem('giao-ban-saved-dates-index-v1', JSON.stringify(serverDates));

        // Bước 3: Tải dữ liệu của ngày đang mở từ Server
        const serverBundleRes = await apiGetServerBundle(currentDate);
        if (serverBundleRes && serverBundleRes.isExisting && serverBundleRes.bundle && isMounted) {
          applyBundleToStates(serverBundleRes.bundle);
          saveDailyBundle(serverBundleRes.bundle);
          setSavedAt(`Máy chủ LAN - Bản lưu ngày ${formatDisplayDate(currentDate)}`);
        }
      }
    }

    initServer();

    // Định kỳ 20s cập nhật danh sách ngày từ máy chủ nếu các khoa phòng khác có thêm ngày mới
    const interval = setInterval(async () => {
      if (!document.hidden) {
        const dates = await apiGetServerDates();
        if (dates && dates.length > 0 && isMounted) {
          setSavedDates(dates);
        }
      }
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentDate, applyBundleToStates]);

  function handleSave() {
    const bundle = getCurrentBundle();
    saveDailyBundle(bundle);
    setSavedDates(getSavedDateList());
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setSavedAt(
      `Đã lưu ${isServerMode ? 'máy chủ' : ''} ${timeStr} (${formatDisplayDate(currentDate)})`,
    );
  }

  // Xử lý chọn ngày từ DateSelectorBar
  const handleSelectDate = useCallback(
    async (newDateStr: string) => {
      // Tự động lưu ngày hiện tại trước khi chuyển
      const currentBundle = getCurrentBundle();
      saveDailyBundle(currentBundle);

      // 1. Ưu tiên tải dữ liệu từ Máy chủ LAN trước
      let loadedBundle: DailyGiaoBanBundle | null = null;
      let isExisting = false;

      try {
        const serverRes = await apiGetServerBundle(newDateStr);
        if (serverRes && serverRes.isExisting && serverRes.bundle) {
          loadedBundle = serverRes.bundle;
          isExisting = true;
        }
      } catch {
        // fallback to local
      }

      // 2. Nếu server chưa có, fallback tìm trong LocalStorage
      if (!isExisting) {
        const localLoaded = loadDailyBundle(newDateStr);
        loadedBundle = localLoaded.bundle;
        isExisting = localLoaded.isExisting;
      }

      if (isExisting && loadedBundle) {
        applyBundleToStates(loadedBundle);
        saveDailyBundle(loadedBundle);
        setCurrentDate(newDateStr);
        setActiveDate(newDateStr);
        setSavedDates(getSavedDateList());
        setSavedAt(`Bản lưu ngày ${formatDisplayDate(newDateStr)}`);
      } else {
        // Ngày chưa từng tạo -> mở modal hỏi người dùng
        const dates = getSavedDateList();
        const closest = findClosestPreviousDate(newDateStr, dates);
        setUninitModal({
          isOpen: true,
          targetDate: newDateStr,
          closestDate: closest,
        });
      }
    },
    [getCurrentBundle, applyBundleToStates],
  );

  // Modal: Xác nhận sao chép từ ngày cũ
  const handleConfirmClone = useCallback(
    (sourceDate: string) => {
      if (!uninitModal) return;
      const targetDate = uninitModal.targetDate;
      const sourceLoaded = loadDailyBundle(sourceDate);
      const cloned = cloneBundleToDate(sourceLoaded.bundle, targetDate);
      saveDailyBundle(cloned);
      applyBundleToStates(cloned);
      setCurrentDate(targetDate);
      setActiveDate(targetDate);
      setSavedDates(getSavedDateList());
      setSavedAt(`Đã kế thừa từ ngày ${formatDisplayDate(sourceDate)}`);
      setUninitModal(null);
    },
    [uninitModal, applyBundleToStates],
  );

  // Modal: Tạo ngày mới trắng / mặc định
  const handleConfirmDefault = useCallback(() => {
    if (!uninitModal) return;
    const targetDate = uninitModal.targetDate;
    const defaultBundle = createDefaultBundle(targetDate);
    saveDailyBundle(defaultBundle);
    applyBundleToStates(defaultBundle);
    setCurrentDate(targetDate);
    setActiveDate(targetDate);
    setSavedDates(getSavedDateList());
    setSavedAt(`Ngày mới (${formatDisplayDate(targetDate)}) - Mặc định`);
    setUninitModal(null);
  }, [uninitModal, applyBundleToStates]);

  // Sao chép nhanh ngày hiện tại sang một ngày cụ thể
  const handleCloneCurrentToDate = useCallback(
    (targetDate: string) => {
      const currentBundle = getCurrentBundle();
      saveDailyBundle(currentBundle);
      const cloned = cloneBundleToDate(currentBundle, targetDate);
      saveDailyBundle(cloned);
      applyBundleToStates(cloned);
      setCurrentDate(targetDate);
      setActiveDate(targetDate);
      setSavedDates(getSavedDateList());
      setSavedAt(`Đã sao chép sang ngày ${formatDisplayDate(targetDate)}`);
    },
    [getCurrentBundle, applyBundleToStates],
  );

  // Sao lưu toàn bộ JSON
  const handleExportBackup = useCallback(() => {
    // Lưu ngày hiện tại trước
    saveDailyBundle(getCurrentBundle());
    downloadBackupFile();
  }, [getCurrentBundle]);

  // Nhập dữ liệu sao lưu JSON
  const handleImportBackup = useCallback(
    async (file: File) => {
      try {
        const result = await importBackupFromFile(file);
        if (result.success) {
          alert(result.message);
          const reloaded = loadDailyBundle(currentDate);
          applyBundleToStates(reloaded.bundle);
          setSavedDates(getSavedDateList());
          setSavedAt(`Đã nhập dữ liệu (${result.importedCount} ngày)`);
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error(err);
        alert('Tệp dữ liệu sao lưu không đúng định dạng!');
      }
    },
    [currentDate, applyBundleToStates],
  );

  function handleReset() {
    if (window.confirm('Bạn có chắc muốn khôi phục về dữ liệu mẫu mặc định của trang này?')) {
      if (activeSlide === 1) {
        setReport(defaultReport);
      } else if (activeSlide === 2) {
        setOutpatient(defaultOutpatientReport);
      } else if (activeSlide === 3) {
        setAfterHours(defaultAfterHoursReport);
      } else if (activeSlide === 4) {
        setInpatient(defaultInpatientReport);
      } else if (activeSlide >= 5 && activeSlide < 5 + freeTextSlides.length) {
        const freeIndex = activeSlide - 5;
        const list = [...freeTextSlides];
        if (freeIndex === 0) list[0] = defaultFreeTextSlides[0];
        setFreeTextSlides(list);
      } else if (activeSlide < 5 + freeTextSlides.length + soapSlides.length) {
        const soapIndex = activeSlide - 5 - freeTextSlides.length;
        const list = [...soapSlides];
        if (soapIndex === 0) list[0] = defaultSoapSlides[0];
        setSoapSlides(list);
      } else if (activeSlide === 5 + freeTextSlides.length + soapSlides.length) {
        setMonitoring(defaultMonitoringReport);
      } else {
        const caseIndex = activeSlide - (6 + freeTextSlides.length + soapSlides.length);
        const list = [...patientCaseTableSlides];
        if (caseIndex === 0) list[0] = defaultPatientCaseTableSlides[0];
        setPatientCaseTableSlides(list);
      }
      setSavedAt(`Đã khôi phục mẫu Slide ${activeSlide}`);
    }
  }

  // Thêm Slide văn bản tự do
  function handleAddFreeTextSlide() {
    const newSlideNumber = 5 + freeTextSlides.length;
    const newSlide: FreeTextSlideData = {
      id: `slide-freetext-${Date.now()}`,
      title: `V. TIÊU ĐỀ NỘI DUNG SLIDE ${newSlideNumber}`,
      items: [
        {
          id: `item-${Date.now()}-1`,
          content: '',
        },
      ],
    };
    setFreeTextSlides([...freeTextSlides, newSlide]);
    setActiveSlide(newSlideNumber);
  }

  // Xóa Slide văn bản tự do
  function handleDeleteFreeTextSlide(freeIndex: number) {
    if (window.confirm('Bạn có chắc muốn xóa slide văn bản này?')) {
      const nextList = freeTextSlides.filter((_, i) => i !== freeIndex);
      setFreeTextSlides(nextList);
      setActiveSlide((prev) => (prev > 1 ? prev - 1 : 1));
    }
  }

  function handleUpdateFreeTextSlide(freeIndex: number, nextData: FreeTextSlideData) {
    const list = [...freeTextSlides];
    list[freeIndex] = nextData;
    setFreeTextSlides(list);
  }

  // Thêm Slide ca bệnh SOAP mới
  function handleAddSoapSlide() {
    const newSoapNumber = soapSlides.length + 1;
    const newSoap: SoapSlideData = {
      id: `soap-slide-${Date.now()}`,
      patientHeader: `${newSoapNumber}, TÊN BỆNH NHÂN   ... tuổi`,
      rows: [
        {
          id: `row-${Date.now()}-1`,
          timeText: '22/08/2026\n20:00',
          progression: '',
          orders: '',
        },
      ],
    };
    const nextSoap = [...soapSlides, newSoap];
    setSoapSlides(nextSoap);
    setActiveSlide(4 + freeTextSlides.length + nextSoap.length);
  }

  // Xóa Slide ca bệnh SOAP
  function handleDeleteSoapSlide(soapIndex: number) {
    if (window.confirm('Bạn có chắc muốn xóa slide ca bệnh này?')) {
      const nextSoap = soapSlides.filter((_, i) => i !== soapIndex);
      setSoapSlides(nextSoap);
      setActiveSlide((prev) => (prev > 1 ? prev - 1 : 1));
    }
  }

  function handleUpdateSoapSlide(soapIndex: number, nextData: SoapSlideData) {
    const list = [...soapSlides];
    list[soapIndex] = nextData;
    setSoapSlides(list);
  }

  // Thêm Slide ca bệnh dạng bảng 6 cột
  function handleAddCaseTableSlide() {
    const newSlide: PatientCaseTableSlideData = {
      id: `case-table-${Date.now()}`,
      title: 'IX. BỆNH NHÂN NGOẠI TRÚ / KHÁM BỆNH ĐẶC BIỆT',
      rows: [
        {
          id: `row-${Date.now()}-1`,
          stt: '1',
          patientInfo: 'HỌ VÀ TÊN ... TUỔI\nĐịa chỉ: ...\n...H...',
          reasonAndExam: 'LDK: ...\n- Khám: ...',
          subclinical: 'CLS: ...',
          diagnosis: 'CĐ: ...',
          treatment: 'Xử trí: ...',
        },
      ],
    };
    const nextList = [...patientCaseTableSlides, newSlide];
    setPatientCaseTableSlides(nextList);
    setActiveSlide(5 + freeTextSlides.length + soapSlides.length + nextList.length);
  }

  // Xóa Slide ca bệnh dạng bảng
  function handleDeleteCaseTableSlide(index: number) {
    if (window.confirm('Bạn có chắc muốn xóa slide ca bệnh dạng bảng này?')) {
      const nextList = patientCaseTableSlides.filter((_, i) => i !== index);
      setPatientCaseTableSlides(nextList);
      setActiveSlide((prev) => (prev > 1 ? prev - 1 : 1));
    }
  }

  function handleUpdateCaseTableSlide(index: number, nextData: PatientCaseTableSlideData) {
    const list = [...patientCaseTableSlides];
    list[index] = nextData;
    setPatientCaseTableSlides(list);
  }

  async function handleExportWord(continuous: boolean = true) {
    try {
      setIsExporting(true);
      const { downloadGiaoBanWord } = await import('./utils/exportWord');
      await downloadGiaoBanWord(
        report,
        outpatient,
        afterHours,
        inpatient,
        freeTextSlides,
        soapSlides,
        monitoring,
        patientCaseTableSlides,
        { continuous },
      );
    } catch (err) {
      console.error('Lỗi xuất file Word:', err);
      alert('Có lỗi xảy ra khi tạo file Word. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  }

  // Phân loại slide hiện tại
  const isFreeTextSlide = activeSlide >= 5 && activeSlide < 5 + freeTextSlides.length;
  const freeTextIndex = isFreeTextSlide ? activeSlide - 5 : 0;
  const currentFreeSlide = isFreeTextSlide ? freeTextSlides[freeTextIndex] : null;

  const isSoapSlide =
    activeSlide >= 5 + freeTextSlides.length &&
    activeSlide < 5 + freeTextSlides.length + soapSlides.length;
  const soapIndex = isSoapSlide ? activeSlide - 5 - freeTextSlides.length : 0;
  const currentSoapSlide = isSoapSlide ? soapSlides[soapIndex] : null;

  const isMonitoringSlide = activeSlide === 5 + freeTextSlides.length + soapSlides.length;

  const isCaseTableSlide = activeSlide > 5 + freeTextSlides.length + soapSlides.length;
  const caseTableIndex = isCaseTableSlide
    ? activeSlide - (6 + freeTextSlides.length + soapSlides.length)
    : 0;
  const currentCaseTableSlide = isCaseTableSlide
    ? patientCaseTableSlides[caseTableIndex]
    : null;

  function getToolbarTitle(): string {
    if (activeSlide === 1) return 'Slide 1 — Thông tin trực';
    if (activeSlide === 2) return 'Slide 2 — Tình hình người bệnh ngoại trú';
    if (activeSlide === 3) return 'Slide 3 — Khám ngoài giờ';
    if (activeSlide === 4) return 'Slide 4 — Tình hình người bệnh nội trú';
    if (isFreeTextSlide) return `Slide ${activeSlide} — ${currentFreeSlide?.title || 'Văn bản tự do'}`;
    if (isSoapSlide) return `Slide ${activeSlide} — Ca bệnh: ${currentSoapSlide?.patientHeader || 'SOAP'}`;
    if (isMonitoringSlide) return `Slide ${activeSlide} — ${monitoring.title || 'Bệnh nhân theo dõi'}`;
    if (isCaseTableSlide) return `Slide ${activeSlide} — ${currentCaseTableSlide?.title || 'Bệnh nhân khám / xử trí'}`;
    return `Slide ${activeSlide}`;
  }

  return (
    <div className={`app-shell ${isFullscreen ? 'presentation-mode' : ''}`}>
      {/* Nút nổi thoát chế độ trình chiếu */}
      {isFullscreen && (
        <button
          type="button"
          className="exit-presentation-btn"
          onClick={exitPresentation}
          title="Thoát trình chiếu (Esc) • Chuột trái: Tới slide • Chuột phải: Lùi slide"
        >
          <Minimize2 size={16} />
          <span>Thoát trình chiếu (Trang {activeSlide}/{totalSlideCount})</span>
          <kbd>Esc</kbd>
        </button>
      )}

      <header className="topbar">
        <div className="brand-block">
          <div className="brand-icon">
            <FileText size={20} />
          </div>
          <div>
            <div className="brand-title">Báo cáo giao ban</div>
            <div className="brand-subtitle">Bệnh viện đa khoa Hùng Cường</div>
          </div>
        </div>

        <DateSelectorBar
          currentDate={currentDate}
          savedDates={savedDates}
          onSelectDate={handleSelectDate}
          onCloneCurrentToDate={handleCloneCurrentToDate}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
        />

        <div className="top-actions">
          <span className="save-status">{savedAt}</span>
          <button
            className="secondary-button presentation-btn"
            onClick={enterPresentation}
            title="Bật chế độ trình chiếu toàn màn hình (F5)"
          >
            <Maximize2 size={16} />
            Trình chiếu (F5)
          </button>
          <WordExportButton
            onExport={handleExportWord}
            isExporting={isExporting}
            totalSlideCount={totalSlideCount}
          />
          <button className="secondary-button" onClick={handleReset}>
            <RotateCcw size={16} />
            Khôi phục mẫu
          </button>
          <button className="primary-button" onClick={handleSave}>
            <Save size={16} />
            Lưu báo cáo
          </button>
        </div>
      </header>

      <main className={`workspace ${isEditorCollapsed ? 'editor-collapsed' : ''}`}>
        <aside className="slide-sidebar">
          <div className="sidebar-heading">
            <span>TRANG</span>
            <strong>{activeSlide} / {totalSlideCount}</strong>
          </div>

          {/* Slide 1 */}
          <button
            className={`thumbnail ${activeSlide === 1 ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveSlide(1)}
            title="Slide 1: Thông tin trực"
          >
            <div className="thumbnail-number">1</div>
            <div className="thumbnail-canvas">
              <div className="thumbnail-line title-line" />
              <div className="thumbnail-red" />
              <div className="thumbnail-line" />
              <div className="thumbnail-line" />
              <div className="thumbnail-line short" />
              <div className="thumbnail-line" />
            </div>
          </button>

          {/* Slide 2 */}
          <button
            className={`thumbnail ${activeSlide === 2 ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveSlide(2)}
            title="Slide 2: Tình hình người bệnh ngoại trú"
          >
            <div className="thumbnail-number">2</div>
            <div className="thumbnail-canvas" style={{ padding: '4px' }}>
              <div style={{ height: '3px', background: '#ea1b1b', borderRadius: '2px', marginBottom: '3px', width: '80%' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2px', height: 'calc(100% - 7px)' }}>
                <div style={{ background: '#e2e8f0', borderRadius: '1px', border: '1px solid #cbd5e1' }} />
                <div style={{ background: '#dbeafe', borderRadius: '1px', border: '1px solid #93c5fd' }} />
              </div>
            </div>
          </button>

          {/* Slide 3 */}
          <button
            className={`thumbnail ${activeSlide === 3 ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveSlide(3)}
            title="Slide 3: Khám ngoài giờ"
          >
            <div className="thumbnail-number">3</div>
            <div className="thumbnail-canvas" style={{ padding: '4px' }}>
              <div style={{ height: '3px', background: '#ea1b1b', borderRadius: '2px', marginBottom: '3px', width: '70%', margin: '0 auto' }} />
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', height: 'calc(100% - 7px)', borderRadius: '1px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '2px' }}>
                <div style={{ height: '2px', background: '#94a3b8', width: '90%', margin: '0 auto' }} />
                <div style={{ height: '2px', background: '#94a3b8', width: '90%', margin: '0 auto' }} />
                <div style={{ height: '2px', background: '#94a3b8', width: '90%', margin: '0 auto' }} />
              </div>
            </div>
          </button>

          {/* Slide 4 */}
          <button
            className={`thumbnail ${activeSlide === 4 ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveSlide(4)}
            title="Slide 4: Tình hình người bệnh nội trú"
          >
            <div className="thumbnail-number">4</div>
            <div className="thumbnail-canvas" style={{ padding: '3px' }}>
              <div style={{ height: '3px', background: '#ea1b1b', borderRadius: '2px', marginBottom: '3px', width: '85%', margin: '0 auto' }} />
              <div style={{ background: '#fff', border: '1px solid #94a3b8', height: 'calc(100% - 6px)', display: 'grid', gridTemplateRows: 'repeat(5, 1fr)', gap: '1px' }}>
                <div style={{ background: '#f1f5f9' }} />
                <div style={{ background: '#fff' }} />
                <div style={{ background: '#f8fafc' }} />
                <div style={{ background: '#fff' }} />
                <div style={{ background: '#f8fafc' }} />
              </div>
            </div>
          </button>

          {/* Các slide FreeText từ 5.. */}
          {freeTextSlides.map((slide, fIndex) => {
            const slideNum = 5 + fIndex;
            return (
              <button
                key={slide.id}
                className={`thumbnail ${activeSlide === slideNum ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveSlide(slideNum)}
                title={`Slide ${slideNum}: ${slide.title}`}
              >
                <div className="thumbnail-number">{slideNum}</div>
                <div className="thumbnail-canvas" style={{ padding: '4px' }}>
                  <div style={{ height: '3px', background: '#ea1b1b', borderRadius: '2px', marginBottom: '4px', width: '75%' }} />
                  <div style={{ height: '2px', background: '#cbd5e1', width: '85%', marginBottom: '3px' }} />
                  <div style={{ height: '2px', background: '#cbd5e1', width: '65%', marginBottom: '3px' }} />
                  <div style={{ height: '2px', background: '#cbd5e1', width: '80%' }} />
                </div>
              </button>
            );
          })}

          {/* Các slide Ca bệnh SOAP */}
          {soapSlides.map((soap, sIndex) => {
            const slideNum = 5 + freeTextSlides.length + sIndex;
            return (
              <button
                key={soap.id}
                className={`thumbnail ${activeSlide === slideNum ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveSlide(slideNum)}
                title={`Slide ${slideNum}: Ca bệnh ${soap.patientHeader}`}
              >
                <div className="thumbnail-number">{slideNum}</div>
                <div className="thumbnail-canvas" style={{ padding: '3px' }}>
                  <div style={{ height: '2px', background: '#0f172a', borderRadius: '1px', marginBottom: '2px', width: '90%', margin: '0 auto' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr 2.5fr', gap: '1px', height: 'calc(100% - 5px)', border: '1px solid #94a3b8' }}>
                    <div style={{ background: '#f1f5f9' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#fff' }} />
                  </div>
                </div>
              </button>
            );
          })}

          {/* Slide Bệnh nhân theo dõi */}
          {(() => {
            const monitoringSlideNum = 5 + freeTextSlides.length + soapSlides.length;
            return (
              <button
                className={`thumbnail ${activeSlide === monitoringSlideNum ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveSlide(monitoringSlideNum)}
                title={`Slide ${monitoringSlideNum}: ${monitoring.title || 'Bệnh nhân theo dõi'}`}
              >
                <div className="thumbnail-number">{monitoringSlideNum}</div>
                <div className="thumbnail-canvas" style={{ padding: '3px' }}>
                  <div
                    style={{
                      height: '2.5px',
                      background: '#ea1b1b',
                      borderRadius: '1px',
                      marginBottom: '3px',
                      width: '80%',
                      margin: '0 auto 3px',
                    }}
                  />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1px',
                      height: 'calc(100% - 6px)',
                      background: '#3866b1',
                      padding: '1px',
                      borderRadius: '1px',
                    }}
                  >
                    <div style={{ background: '#c9d2e7' }} />
                    <div style={{ background: '#c9d2e7' }} />
                    <div style={{ background: '#ebedf6' }} />
                    <div style={{ background: '#ebedf6' }} />
                    <div style={{ background: '#c9d2e7' }} />
                    <div style={{ background: '#c9d2e7' }} />
                  </div>
                </div>
              </button>
            );
          })()}

          {/* Các slide Ca bệnh dạng bảng 6 cột */}
          {patientCaseTableSlides.map((slide, cIndex) => {
            const slideNum = 6 + freeTextSlides.length + soapSlides.length + cIndex;
            return (
              <button
                key={slide.id}
                className={`thumbnail ${activeSlide === slideNum ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveSlide(slideNum)}
                title={`Slide ${slideNum}: ${slide.title || 'Ca bệnh dạng bảng'}`}
              >
                <div className="thumbnail-number">{slideNum}</div>
                <div className="thumbnail-canvas" style={{ padding: '3px' }}>
                  <div
                    style={{
                      height: '2.5px',
                      background: '#ea1b1b',
                      borderRadius: '1px',
                      marginBottom: '2px',
                      width: '85%',
                      margin: '0 auto 2px',
                    }}
                  />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '1px',
                      height: 'calc(100% - 5px)',
                      border: '1px solid #000000',
                      background: '#fff',
                    }}
                  >
                    <div style={{ background: '#e2e8f0' }} />
                    <div style={{ background: '#f8fafc' }} />
                    <div style={{ background: '#f8fafc' }} />
                    <div style={{ background: '#f8fafc' }} />
                    <div style={{ background: '#f8fafc' }} />
                    <div style={{ background: '#f8fafc' }} />
                  </div>
                </div>
              </button>
            );
          })}

          {/* Nhóm nút thêm slide ở sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
            <button
              type="button"
              className="add-slide-sidebar-btn"
              onClick={handleAddFreeTextSlide}
              title="Tạo thêm 1 slide văn bản tự do mới"
            >
              <PlusCircle size={14} />
              + Thêm slide văn bản
            </button>
            <button
              type="button"
              className="add-slide-sidebar-btn"
              style={{ color: '#059669', borderColor: '#a7f3d0' }}
              onClick={handleAddSoapSlide}
              title="Tạo thêm 1 slide ca bệnh SOAP mới"
            >
              <Stethoscope size={14} />
              + Thêm slide ca bệnh (SOAP)
            </button>
            <button
              type="button"
              className="add-slide-sidebar-btn"
              style={{ color: '#0284c7', borderColor: '#bae6fd' }}
              onClick={handleAddCaseTableSlide}
              title="Tạo thêm 1 slide ca bệnh dạng bảng 6 cột mới"
            >
              <TableProperties size={14} />
              + Thêm slide ca bệnh (bảng)
            </button>
          </div>
        </aside>

        <section className="canvas-area">
          <div className="canvas-toolbar">
            <div>
              <span className="toolbar-title">{getToolbarTitle()}</span>
              <span className="toolbar-note">Màn hình thử nghiệm</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="secondary-button"
                onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                title={isEditorCollapsed ? 'Mở bảng nhập liệu' : 'Ẩn bảng nhập liệu'}
              >
                {isEditorCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                {isEditorCollapsed ? 'Hiện nhập liệu' : 'Ẩn nhập liệu'}
              </button>
              <button
                className="secondary-button presentation-btn"
                onClick={enterPresentation}
                title="Bật chế độ trình chiếu toàn màn hình (F5)"
              >
                <Maximize2 size={16} />
                Trình chiếu
              </button>
              <WordExportButton
                onExport={handleExportWord}
                isExporting={isExporting}
                totalSlideCount={totalSlideCount}
              />
              <button className="secondary-button" onClick={() => window.print()}>
                <Printer size={16} />
                In / PDF
              </button>
            </div>
          </div>

          <div className="canvas-scroll">
            {activeSlide === 1 && <SlidePreview report={report} />}
            {activeSlide === 2 && <Slide2Preview data={outpatient} />}
            {activeSlide === 3 && <Slide3Preview data={afterHours} />}
            {activeSlide === 4 && <Slide4Preview data={inpatient} />}
            {isFreeTextSlide && currentFreeSlide && (
              <FreeTextSlidePreview data={currentFreeSlide} />
            )}
            {isSoapSlide && currentSoapSlide && (
              <SoapSlidePreview data={currentSoapSlide} />
            )}
            {isMonitoringSlide && (
              <MonitoringSlidePreview data={monitoring} />
            )}
            {isCaseTableSlide && currentCaseTableSlide && (
              <PatientCaseTableSlidePreview data={currentCaseTableSlide} />
            )}
          </div>
        </section>

        <aside className="right-panel">
          {activeSlide === 1 && <EditorPanel report={report} onChange={setReport} />}
          {activeSlide === 2 && <EditorPanel2 data={outpatient} onChange={setOutpatient} />}
          {activeSlide === 3 && <EditorPanel3 data={afterHours} onChange={setAfterHours} />}
          {activeSlide === 4 && <EditorPanel4 data={inpatient} onChange={setInpatient} />}
          {isFreeTextSlide && currentFreeSlide && (
            <EditorPanelFreeText
              data={currentFreeSlide}
              slideNumber={activeSlide}
              totalSlides={totalSlideCount}
              canDeleteSlide={freeTextSlides.length > 1}
              onChange={(next) => handleUpdateFreeTextSlide(freeTextIndex, next)}
              onAddNewSlide={handleAddFreeTextSlide}
              onDeleteSlide={() => handleDeleteFreeTextSlide(freeTextIndex)}
            />
          )}
          {isSoapSlide && currentSoapSlide && (
            <EditorPanelSoap
              data={currentSoapSlide}
              slideNumber={activeSlide}
              canDeleteSlide={soapSlides.length > 1}
              onChange={(next) => handleUpdateSoapSlide(soapIndex, next)}
              onAddNewSlide={handleAddSoapSlide}
              onDeleteSlide={() => handleDeleteSoapSlide(soapIndex)}
            />
          )}
          {isMonitoringSlide && (
            <EditorPanelMonitoring
              data={monitoring}
              slideNumber={activeSlide}
              onChange={setMonitoring}
            />
          )}
          {isCaseTableSlide && currentCaseTableSlide && (
            <EditorPanelPatientCaseTable
              data={currentCaseTableSlide}
              slideNumber={activeSlide}
              totalSlides={totalSlideCount}
              canDeleteSlide={patientCaseTableSlides.length > 1}
              onChange={(next) => handleUpdateCaseTableSlide(caseTableIndex, next)}
              onAddNewSlide={handleAddCaseTableSlide}
              onDeleteSlide={() => handleDeleteCaseTableSlide(caseTableIndex)}
            />
          )}
        </aside>
      </main>

      {uninitModal?.isOpen && (
        <UninitializedDateModal
          targetDate={uninitModal.targetDate}
          closestDate={uninitModal.closestDate}
          savedDates={savedDates}
          onConfirmClone={handleConfirmClone}
          onConfirmDefault={handleConfirmDefault}
          onCancel={() => setUninitModal(null)}
        />
      )}
    </div>
  );
}
