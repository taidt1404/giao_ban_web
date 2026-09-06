import { useMemo } from 'react';
import {
  type InpatientReportData,
  calculateCurrentPatients,
  calculateBedDifference,
} from '../data/inpatientReport';

type Props = {
  data: InpatientReportData;
};

export default function Slide4Preview({ data }: Props) {
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
      </div>
    </div>
  );
}
