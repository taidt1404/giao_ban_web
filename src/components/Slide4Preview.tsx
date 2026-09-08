import { useMemo } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  type InpatientReportData,
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
  onChange?: (next: InpatientReportData) => void;
};

export default function Slide4Preview({ data, currentDate, onChange }: Props) {
  const isEditable = Boolean(onChange);

  // Tính dòng TỔNG cộng dồn
  const summary = useMemo(() => {
    let oldPatients = 0;
    let admitted = 0;
    let discharged = 0;
    let transferred = 0;
    let deceased = 0;
    let currentPatients = 0;
    let actualBeds = 0;

    data.departments.forEach((dept) => {
      oldPatients += Number(dept.oldPatients) || 0;
      admitted += Number(dept.admitted) || 0;
      discharged += Number(dept.discharged) || 0;
      transferred += Number(dept.transferred) || 0;
      deceased += Number(dept.deceased) || 0;
      const cur = calculateCurrentPatients(dept);
      currentPatients += cur;
      actualBeds += Number(dept.actualBeds) || 0;
    });

    const diff = calculateBedDifference(actualBeds, currentPatients);

    return {
      oldPatients,
      admitted,
      discharged,
      transferred,
      deceased,
      currentPatients,
      actualBeds,
      diff,
    };
  }, [data.departments]);

  // Kiểm tra ngày trước
  const previousData = useMemo(() => {
    if (!currentDate) return null;
    return getPreviousDayInpatientData(currentDate);
  }, [currentDate]);

  const syncStatus = useMemo(() => {
    if (!previousData) return null;
    return checkInpatientSyncStatus(data, previousData.inpatient);
  }, [data, previousData]);

  function handleSync() {
    if (!onChange || !previousData) return;
    const synced = syncInpatientOldFromPrevious(data, previousData.inpatient);
    onChange(synced);
  }

  return (
    <div className="slide-wrap">
      <div className="slide slide-4" id="slide-4">
        <div className="slide4-header">
          <h1 className="slide4-title">III.TÌNH HÌNH NGƯỜI BỆNH NỘI TRÚ</h1>
        </div>

        <div className="inpatient-table-wrap">
          <table className="inpatient-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}></th>
                <th style={{ width: '10%' }}>CŨ</th>
                <th style={{ width: '10%' }}>VÀO</th>
                <th style={{ width: '10%' }}>RA</th>
                <th style={{ width: '13%' }}>CHUYỂN VIỆN</th>
                <th style={{ width: '12%' }}>TỬ VONG</th>
                <th style={{ width: '11%' }}>HIỆN CÓ</th>
                <th style={{ width: '11%' }}>GIƯỜNG THỰC KÊ</th>
                <th style={{ width: '11%' }}>THỪA/THIẾU</th>
              </tr>
            </thead>
            <tbody>
              {/* Hàng TỔNG */}
              <tr className="row-total">
                <td className="cell-dept font-bold">TỔNG</td>
                <td className="cell-num">{summary.oldPatients}</td>
                <td className="cell-num">{summary.admitted}</td>
                <td className="cell-num">{summary.discharged}</td>
                <td className="cell-num">{summary.transferred}</td>
                <td className="cell-num">{summary.deceased}</td>
                <td className="cell-num">{summary.currentPatients}</td>
                <td className="cell-num font-bold">{summary.actualBeds}</td>
                <td className="cell-num">{summary.diff}</td>
              </tr>

              {/* Các khoa */}
              {data.departments.map((dept) => {
                const cur = calculateCurrentPatients(dept);
                const diff = calculateBedDifference(dept.actualBeds, cur);

                return (
                  <tr key={dept.id}>
                    <td className="cell-dept font-bold">{dept.name}</td>
                    <td className="cell-num">{dept.oldPatients}</td>
                    <td className="cell-num">{dept.admitted}</td>
                    <td className="cell-num">{dept.discharged}</td>
                    <td className="cell-num">{dept.transferred}</td>
                    <td className="cell-num">{dept.deceased}</td>
                    <td className="cell-num">{cur}</td>
                    <td className="cell-num font-bold">{dept.actualBeds}</td>
                    <td className="cell-num">{diff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Thanh đồng bộ thông minh hiển thị dưới bảng ở chế độ chỉnh sửa */}
        {isEditable && previousData && syncStatus && (
          <div
            className={`slide-inpatient-sync-bar ${syncStatus.isSynced ? 'synced' : 'desynced'}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {syncStatus.isSynced ? (
                <CheckCircle2 size={15} />
              ) : (
                <AlertTriangle size={15} />
              )}
              <span>
                {syncStatus.isSynced
                  ? `Cột CŨ đã khớp chuẩn với cột HIỆN CÓ ngày ${formatDisplayDate(previousData.date)} (${syncStatus.expectedTotal} BN).`
                  : `Cột CŨ (${syncStatus.currentTotal} BN) đang lệch ${syncStatus.diffCount} BN so với HIỆN CÓ ngày ${formatDisplayDate(previousData.date)} (${syncStatus.expectedTotal} BN).`}
              </span>
            </div>

            <button
              type="button"
              className="slide-sync-btn"
              onClick={handleSync}
              title={`Lấy số Hiện có ngày ${formatDisplayDate(previousData.date)} điền vào cột Cũ`}
            >
              <RefreshCw size={12} />
              <span>{syncStatus.isSynced ? 'Lấy lại từ ngày trước' : `Đồng bộ từ ${formatDisplayDate(previousData.date)}`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
