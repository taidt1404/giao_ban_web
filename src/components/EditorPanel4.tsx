import { useMemo } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  type InpatientReportData,
  type InpatientDepartment,
  calculateCurrentPatients,
  calculateBedDifference,
} from '../data/inpatientReport';
import {
  getPreviousDayInpatientData,
  syncInpatientOldFromPrevious,
  checkInpatientSyncStatus,
  formatDisplayDate,
} from '../utils/dailyStorage';

type Props = {
  data: InpatientReportData;
  currentDate?: string;
  onChange: (next: InpatientReportData) => void;
};

export default function EditorPanel4({ data, currentDate, onChange }: Props) {
  function handleDeptChange(
    index: number,
    field: keyof Omit<InpatientDepartment, 'id' | 'name'>,
    value: string,
  ) {
    const list = [...data.departments];
    const num = parseInt(value, 10) || 0;
    list[index] = {
      ...list[index],
      [field]: num,
    };
    onChange({
      ...data,
      departments: list,
    });
  }

  // Lấy dữ liệu ngày liền kề trước đó (nếu có)
  const previousData = useMemo(() => {
    if (!currentDate) return null;
    return getPreviousDayInpatientData(currentDate);
  }, [currentDate]);

  // Kiểm tra tình trạng khớp dữ liệu Cũ vs Hiện có
  const syncStatus = useMemo(() => {
    if (!previousData) return null;
    return checkInpatientSyncStatus(data, previousData.inpatient);
  }, [data, previousData]);

  function handleSyncFromPrevious() {
    if (!previousData) return;
    const synced = syncInpatientOldFromPrevious(data, previousData.inpatient);
    onChange(synced);
  }

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">NỘI DUNG SLIDE 4</span>
          <h2>Người bệnh nội trú</h2>
        </div>
        <span className="badge">Tự động tính toán</span>
      </div>

      {/* BANNER THÔNG MINH: ĐỒNG BỘ CỘT CŨ VỚI HIỆN CÓ NGÀY HÔM TRƯỚC */}
      {previousData && syncStatus && (
        <div
          className={`inpatient-sync-banner ${syncStatus.isSynced ? 'is-synced' : 'is-desynced'}`}
        >
          <div className="sync-banner-info">
            <div className="sync-banner-title">
              {syncStatus.isSynced ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>
                    Số <strong>CŨ</strong> đã khớp chuẩn với <strong>HIỆN CÓ</strong> ngày{' '}
                    {formatDisplayDate(previousData.date)}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>
                    Số <strong>CŨ</strong> hiện tại (Tổng: {syncStatus.currentTotal}) khác với{' '}
                    <strong>HIỆN CÓ</strong> ngày {formatDisplayDate(previousData.date)} (Tổng:{' '}
                    {syncStatus.expectedTotal})
                  </span>
                </>
              )}
            </div>
            <div className="sync-banner-desc">
              {syncStatus.isSynced
                ? `Tất cả các khoa đều khớp chính xác (${syncStatus.expectedTotal} BN).`
                : `Đang lệch ${syncStatus.diffCount} bệnh nhân. Bạn có thể bấm nút bên dưới để cập nhật lại.`}
            </div>
          </div>

          <button
            type="button"
            className={`sync-action-btn ${syncStatus.isSynced ? 'secondary-sync-btn' : 'primary-sync-btn'}`}
            title={`Đồng bộ số Cũ của tất cả các khoa theo số Hiện có ngày ${formatDisplayDate(previousData.date)}`}
            onClick={handleSyncFromPrevious}
          >
            <RefreshCw size={13} />
            <span>{syncStatus.isSynced ? 'Lấy lại từ ngày trước' : 'Đồng bộ từ ngày trước'}</span>
          </button>
        </div>
      )}

      <div className="inpatient-dept-list">
        {data.departments.map((dept, index) => {
          const cur = calculateCurrentPatients(dept);
          const diff = calculateBedDifference(dept.actualBeds, cur);

          return (
            <div className="dept-edit-card" key={dept.id}>
              <div className="dept-card-header">
                <span className="dept-title font-bold">Khoa {dept.name}</span>
                <div className="dept-status-badges">
                  <span className="badge-blue">Hiện có: {cur}</span>
                  <span className={diff.startsWith('-') ? 'badge-red' : 'badge-green'}>
                    {diff.startsWith('-') ? `Thiếu ${diff.slice(1)}` : `Thừa ${diff}`}
                  </span>
                </div>
              </div>

              <div className="dept-fields-grid">
                <div className="mini-field">
                  <label>Cũ</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.oldPatients}
                    onChange={(e) => handleDeptChange(index, 'oldPatients', e.target.value)}
                  />
                </div>
                <div className="mini-field">
                  <label>Vào</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.admitted}
                    onChange={(e) => handleDeptChange(index, 'admitted', e.target.value)}
                  />
                </div>
                <div className="mini-field">
                  <label>Ra</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.discharged}
                    onChange={(e) => handleDeptChange(index, 'discharged', e.target.value)}
                  />
                </div>
                <div className="mini-field">
                  <label>Chuyển</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.transferred}
                    onChange={(e) => handleDeptChange(index, 'transferred', e.target.value)}
                  />
                </div>
                <div className="mini-field">
                  <label>Tử vong</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.deceased}
                    onChange={(e) => handleDeptChange(index, 'deceased', e.target.value)}
                  />
                </div>
                <div className="mini-field highlight-field">
                  <label>Giường kê</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.actualBeds}
                    onChange={(e) => handleDeptChange(index, 'actualBeds', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
