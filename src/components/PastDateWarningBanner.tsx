import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { formatDisplayDate } from '../utils/dailyStorage';

type Props = {
  currentDate: string;
  isLocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
};

export default function PastDateWarningBanner({
  currentDate,
  isLocked,
  onUnlock,
  onLock,
}: Props) {
  const displayDate = formatDisplayDate(currentDate);

  function handleRequestUnlock() {
    const message =
      `Bạn đang chuẩn bị chỉnh sửa báo cáo của ngày cũ (${displayDate}).\n\n` +
      `Mọi thay đổi khi lưu sẽ ghi đè lên dữ liệu lịch sử trên máy chủ.\n\n` +
      `Bạn có chắc chắn muốn mở khóa để chỉnh sửa không?`;

    if (window.confirm(message)) {
      onUnlock();
    }
  }

  if (isLocked) {
    return (
      <div className="past-date-banner banner-locked">
        <div className="banner-content">
          <span className="banner-icon">
            <Lock size={18} />
          </span>
          <div className="banner-text">
            <strong>Chế độ bảo vệ ngày cũ:</strong> Bạn đang xem báo cáo ngày{' '}
            <span className="banner-date">{displayDate}</span>. Nội dung đang ở trạng thái{' '}
            <strong>Chỉ đọc</strong> để tránh ghi đè dữ liệu lịch sử.
          </div>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="banner-unlock-btn"
            onClick={handleRequestUnlock}
            title="Mở khóa nếu bạn thực sự cần sửa đổi dữ liệu ngày này"
          >
            <Unlock size={15} />
            <span>Mở khóa chỉnh sửa</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="past-date-banner banner-unlocked">
      <div className="banner-content">
        <span className="banner-icon">
          <AlertTriangle size={18} />
        </span>
        <div className="banner-text">
          <strong>Cảnh báo chỉnh sửa ngày cũ:</strong> Bạn đã mở khóa báo cáo ngày{' '}
          <span className="banner-date">{displayDate}</span>. Hãy cẩn trọng vì các thay đổi sẽ ghi đè lên dữ liệu lưu trữ trên máy chủ!
        </div>
      </div>
      <div className="banner-actions">
        <button
          type="button"
          className="banner-relock-btn"
          onClick={onLock}
          title="Khóa lại để bảo vệ dữ liệu"
        >
          <Lock size={15} />
          <span>Khóa lại</span>
        </button>
      </div>
    </div>
  );
}
