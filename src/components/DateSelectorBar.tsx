import { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Upload,
  Copy,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatDisplayDate, getTodayString } from '../utils/dailyStorage';

type Props = {
  currentDate: string;
  savedDates: string[];
  onSelectDate: (targetDate: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onCloneCurrentToDate: (targetDate: string) => void;
};

export default function DateSelectorBar({
  currentDate,
  savedDates,
  onSelectDate,
  onExportBackup,
  onImportBackup,
  onCloneCurrentToDate,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showClonePrompt, setShowClonePrompt] = useState(false);
  const [cloneTargetDate, setCloneTargetDate] = useState('');

  const todayStr = getTodayString();
  const isToday = currentDate === todayStr;
  const isSavedInStore = savedDates.includes(currentDate);

  // Tính ngày trước đó và ngày sau đó
  function shiftDate(offsetDays: number) {
    const d = new Date(`${currentDate}T00:00:00`);
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${day}`);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleExecuteClone() {
    if (!cloneTargetDate) {
      alert('Vui lòng chọn ngày đích để sao chép đến!');
      return;
    }
    if (cloneTargetDate === currentDate) {
      alert('Ngày đích phải khác ngày hiện tại!');
      return;
    }
    onCloneCurrentToDate(cloneTargetDate);
    setShowClonePrompt(false);
    setCloneTargetDate('');
  }

  return (
    <div className="date-selector-bar">
      {/* Ẩn input file phục vụ import backup */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="date-control-group">
        <button
          type="button"
          className="date-nav-btn"
          title="Lùi lại 1 ngày"
          onClick={() => shiftDate(-1)}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="date-picker-wrapper">
          <Calendar size={15} className="date-picker-icon" />
          <input
            type="date"
            className="date-picker-input"
            value={currentDate}
            onChange={(e) => {
              if (e.target.value) {
                onSelectDate(e.target.value);
              }
            }}
            title="Bấm để chọn ngày trực bất kỳ"
          />
          <span className="date-display-badge">
            {formatDisplayDate(currentDate)}
          </span>
        </div>

        <button
          type="button"
          className="date-nav-btn"
          title="Tiến thêm 1 ngày"
          onClick={() => shiftDate(1)}
        >
          <ChevronRight size={16} />
        </button>

        {!isToday && (
          <button
            type="button"
            className="date-today-btn"
            title="Trở về ngày hôm nay"
            onClick={() => onSelectDate(todayStr)}
          >
            <Clock size={12} />
            <span>Hôm nay</span>
          </button>
        )}
      </div>

      {/* Trạng thái dữ liệu của ngày */}
      <div className="date-status-indicator">
        {isSavedInStore ? (
          <span
            className="status-pill status-saved"
            title="Đã lưu báo cáo cho ngày này trong hệ thống"
          >
            <CheckCircle2 size={12} />
            <span>Đã lưu</span>
          </span>
        ) : (
          <span
            className="status-pill status-new"
            title="Chưa lưu ngày này hoặc đang soạn thảo mới"
          >
            <span className="dot-pulse" />
            <span>Chưa lưu</span>
          </span>
        )}
      </div>

      {/* Cụm menu sao lưu / sao chép */}
      <div className="date-tools-dropdown-container">
        <button
          type="button"
          className="date-tools-toggle-btn"
          onClick={() => setShowMenu(!showMenu)}
          title="Công cụ sao lưu & nhân bản dữ liệu"
        >
          ⚙ Quản lý ngày
        </button>

        {showMenu && (
          <div className="date-tools-menu" onMouseLeave={() => setShowMenu(false)}>
            <div className="menu-header">Lịch sử ({savedDates.length} ngày đã lưu)</div>

            <button
              type="button"
              className="menu-item-btn"
              onClick={() => {
                setShowMenu(false);
                setShowClonePrompt(true);
              }}
            >
              <Copy size={14} />
              <span>Nhân bản ngày này sang ngày khác...</span>
            </button>

            <button
              type="button"
              className="menu-item-btn"
              onClick={() => {
                setShowMenu(false);
                onExportBackup();
              }}
            >
              <Download size={14} />
              <span>Tải file sao lưu (.json)</span>
            </button>

            <button
              type="button"
              className="menu-item-btn"
              onClick={() => {
                setShowMenu(false);
                fileInputRef.current?.click();
              }}
            >
              <Upload size={14} />
              <span>Mở file sao lưu (.json)</span>
            </button>
          </div>
        )}
      </div>

      {/* Dialog con để chọn ngày cần sao chép đến */}
      {showClonePrompt && (
        <div className="clone-prompt-overlay">
          <div className="clone-prompt-box">
            <h3>Nhân bản dữ liệu báo cáo</h3>
            <p>
              Sao chép toàn bộ số liệu của ngày{' '}
              <strong>{formatDisplayDate(currentDate)}</strong> sang một ngày mới:
            </p>
            <div className="clone-field">
              <label>Chọn ngày mới:</label>
              <input
                type="date"
                value={cloneTargetDate}
                onChange={(e) => setCloneTargetDate(e.target.value)}
              />
            </div>
            <div className="clone-note">
              * Tự động lấy số BN "Hiện có" hôm qua thành "Cũ" hôm nay; reset các ca
              vào/ra đêm trực về 0.
            </div>
            <div className="clone-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowClonePrompt(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleExecuteClone}
              >
                Sao chép ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
