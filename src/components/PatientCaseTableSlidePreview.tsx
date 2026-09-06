import type { PatientCaseTableSlideData } from '../data/patientCaseTableReport';

type Props = {
  data: PatientCaseTableSlideData;
};

export default function PatientCaseTableSlidePreview({ data }: Props) {
  return (
    <div className="slide-wrap">
      <div className="slide slide-case-table">
        {data.title && (
          <div className="case-table-header">
            <h1 className="case-table-title">{data.title}</h1>
          </div>
        )}

        <div className="case-table-container">
          <table className="case-data-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>STT</th>
                <th style={{ width: '15%' }}>
                  Họ và tên/tuổi/địa chỉ/giờ
                </th>
                <th style={{ width: '31%' }}>
                  Lý do khám / chẩn đoán sơ bộ
                </th>
                <th style={{ width: '22%' }}>Cận lâm sàng</th>
                <th style={{ width: '13%' }}>Chẩn đoán</th>
                <th style={{ width: '14%' }}>Xử trí</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, index) => {
                const sttValue = row.stt || String(index + 1);
                // Xử lý dòng đầu của patientInfo in đậm nếu có nhiều dòng
                const patientLines = (row.patientInfo || '').split('\n');
                const firstLine = patientLines[0] || '';
                const restLines = patientLines.slice(1).join('\n');

                return (
                  <tr key={row.id}>
                    <td className="cell-center font-bold">{sttValue}</td>
                    <td className="cell-patient-info">
                      <div className="font-bold patient-name-line">{firstLine}</div>
                      {restLines && (
                        <div className="patient-sub-line">{restLines}</div>
                      )}
                    </td>
                    <td className="cell-pre-line">{row.reasonAndExam}</td>
                    <td className="cell-pre-line">{row.subclinical}</td>
                    <td className="cell-pre-line">{row.diagnosis}</td>
                    <td className="cell-pre-line">{row.treatment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
