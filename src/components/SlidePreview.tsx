import type { ReportData } from '../data/defaultReport';

function formatVietnameseDate(date: string) {
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return date;
  return `NGÀY ${value.getDate()} THÁNG ${value.getMonth() + 1} NĂM ${value.getFullYear()}`;
}

type Props = {
  report: ReportData;
};

export default function SlidePreview({ report }: Props) {
  return (
    <div className="slide-wrap">
      <div className="slide" id="slide-1">
        <div className="slide-head">
          <img src="/assets/logo.png" alt="Logo bệnh viện" className="slide-logo" />
          <div className="hospital-heading">
            <div>CÔNG TY CỔ PHẦN BỆNH VIỆN HÙNG CƯỜNG</div>
            <div>BỆNH VIỆN ĐA KHOA HÙNG CƯỜNG</div>
          </div>
        </div>

        <div className="report-title">BÁO CÁO TRỰC</div>
        <div className="report-date">{formatVietnameseDate(report.reportDate)}</div>

        <div className="staff-list">
          <p>
            <strong>•</strong> Bác sĩ: {report.doctors.filter(Boolean).join(' – ')}
          </p>
          <p>
            <strong>•</strong> Điều dưỡng: {report.nurses.filter(Boolean).join(' – ')}
          </p>
          <p>
            <strong>•</strong> Dược: {report.pharmacy || '—'}
          </p>
          <p>
            <strong>•</strong> XQuang: {report.xray || '—'}
          </p>
          <p>
            <strong>•</strong> Xét nghiệm: {report.laboratory.filter(Boolean).join(' – ')}
          </p>
          <p>
            <strong>•</strong> Hành chính: {report.administration || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
