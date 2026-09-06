import { Copy, Sparkles, X } from 'lucide-react';
import { formatDisplayDate } from '../utils/dailyStorage';

type Props = {
  targetDate: string;
  closestDate?: string;
  onConfirmClone: (sourceDate: string) => void;
  onConfirmDefault: () => void;
  onCancel: () => void;
};

export default function UninitializedDateModal({
  targetDate,
  closestDate,
  onConfirmClone,
  onConfirmDefault,
  onCancel,
}: Props) {
  return (
    <div className="clone-prompt-overlay" onClick={onCancel}>
      <div
        className="uninit-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
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
          Ngày này chưa có dữ liệu báo cáo giao ban trong hệ thống. Bạn muốn khởi
          tạo theo cách nào?
        </p>

        <div className="uninit-options-stack">
          {closestDate && (
            <button
              type="button"
              className="uninit-option-card recommend-card"
              onClick={() => onConfirmClone(closestDate)}
            >
              <div className="option-icon-box">
                <Copy size={22} />
              </div>
              <div className="option-text-content">
                <div className="option-title-row">
                  <strong>
                    Kế thừa số liệu từ ngày {formatDisplayDate(closestDate)}
                  </strong>
                  <span className="rec-badge">Khuyên dùng</span>
                </div>
                <p>
                  Tự động chuyển số <strong>"Hiện có"</strong> của ngày trước thành
                  số <strong>"Cũ"</strong> của ngày hôm nay (Slide 4). Reset các ca
                  vào viện, ra viện về 0. Giữ danh sách theo dõi &amp; ca bệnh để kíp
                  mới cập nhật tiếp.
                </p>
              </div>
            </button>
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
              <p>Khởi tạo dữ liệu giao ban mới hoàn toàn từ đầu.</p>
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
