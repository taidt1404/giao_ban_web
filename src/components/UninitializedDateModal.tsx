import { useState } from 'react';
import { Copy, Sparkles, X } from 'lucide-react';
import { formatDisplayDate } from '../utils/dailyStorage';

type Props = {
  targetDate: string;
  closestDate?: string;
  savedDates: string[];
  onConfirmClone: (sourceDate: string) => void;
  onConfirmDefault: () => void;
  onCancel: () => void;
};

export default function UninitializedDateModal({
  targetDate,
  closestDate,
  savedDates,
  onConfirmClone,
  onConfirmDefault,
  onCancel,
}: Props) {
  // Ưu tiên ngày gần nhất trước đó, nếu không có thì lấy ngày đầu tiên trong danh sách đã lưu
  const defaultSource = closestDate || (savedDates.length > 0 ? savedDates[0] : '');
  const [selectedSourceDate, setSelectedSourceDate] = useState<string>(defaultSource);

  return (
    <div className="clone-prompt-overlay" onClick={onCancel}>
      <div className="uninit-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="uninit-modal-header">
          <div>
            <span className="uninit-eyebrow">KHỞI TẠO BÁO CÁO MỚI</span>
            <h2>Ngày {formatDisplayDate(targetDate)}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            title="Đóng hộp thoại"
            onClick={onCancel}
          >
            <X size={18} />
          </button>
        </div>

        <p className="uninit-intro-text">
          Ngày <strong>{formatDisplayDate(targetDate)}</strong> chưa có dữ liệu trong hệ thống.
          Bạn muốn khởi tạo báo cáo cho ngày này theo cách nào?
        </p>

        <div className="uninit-options-stack">
          {savedDates.length > 0 && selectedSourceDate && (
            <div className="uninit-clone-section">
              <div className="uninit-option-card recommend-card">
                <div className="option-icon-box">
                  <Copy size={22} />
                </div>
                <div className="option-text-content">
                  <div className="option-title-row">
                    <strong>Kế thừa / Sao chép từ ngày đã có</strong>
                    <span className="rec-badge">Khuyên dùng</span>
                  </div>

                  <div className="source-date-picker-row">
                    <label htmlFor="source-date-select">Chọn ngày nguồn để copy:</label>
                    <select
                      id="source-date-select"
                      className="source-date-select"
                      value={selectedSourceDate}
                      onChange={(e) => setSelectedSourceDate(e.target.value)}
                    >
                      {savedDates.map((d) => (
                        <option key={d} value={d}>
                          Ngày {formatDisplayDate(d)} {d === closestDate ? '(Gần nhất)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="clone-explanation">
                    • <strong>Slide 4 (Nội trú):</strong> Tự động lấy số <em>"Hiện có"</em> ngày {formatDisplayDate(selectedSourceDate)} thành số <em>"Cũ"</em> ngày mới. Reset số Vào/Ra/Chuyển/Tử vong về 0.<br />
                    • <strong>Slide 2 &amp; 3 (Khám bệnh):</strong> Reset số ca khám về 0.<br />
                    • <strong>Slide 5, 6, 8, 9:</strong> Giữ nguyên danh sách ca bệnh &amp; theo dõi để tua mới cập nhật tiếp.
                  </p>

                  <button
                    type="button"
                    className="primary-button clone-submit-btn"
                    onClick={() => onConfirmClone(selectedSourceDate)}
                  >
                    <Copy size={16} />
                    <span>Sao chép số liệu từ ngày {formatDisplayDate(selectedSourceDate)}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="uninit-option-card default-card"
            onClick={onConfirmDefault}
          >
            <div className="option-icon-box default-icon">
              <Sparkles size={22} />
            </div>
            <div className="option-text-content">
              <div className="option-title-row">
                <strong>Bắt đầu bằng mẫu trắng mặc định</strong>
              </div>
              <p>Khởi tạo dữ liệu giao ban mới hoàn toàn từ đầu (không copy từ ngày nào).</p>
            </div>
          </button>
        </div>

        <div className="uninit-footer">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Hủy bỏ (Quay lại)
          </button>
        </div>
      </div>
    </div>
  );
}
