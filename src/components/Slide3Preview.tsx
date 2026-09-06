import { useMemo } from 'react';
import {
  type AfterHoursReportData,
  calculatePrescriptionsTotal,
  calculateTotalExams,
} from '../data/afterHoursReport';

type Props = {
  data: AfterHoursReportData;
};

export default function Slide3Preview({ data }: Props) {
  const prescriptionsTotal = useMemo(
    () => calculatePrescriptionsTotal(data.details),
    [data.details],
  );
  const totalExams = useMemo(
    () => calculateTotalExams(data),
    [data],
  );

  return (
    <div className="slide-wrap">
      <div className="slide slide-3" id="slide-3">
        <div className="slide3-header">
          <h1 className="slide3-title">II.KHÁM NGOÀI GIỜ</h1>
        </div>

        <div className="afterhours-table-wrap">
          <table className="afterhours-table">
            <tbody>
              {/* Hàng 1: Tổng khám */}
              <tr>
                <td colSpan={2} className="cell-bold-label">
                  Tổng khám
                </td>
                <td colSpan={2} className="cell-bold-center highlight-number">
                  {totalExams}
                </td>
              </tr>

              {/* Hàng 2: Vào viện */}
              <tr>
                <td colSpan={2} className="cell-bold-label">
                  Vào viện
                </td>
                <td colSpan={2} className="cell-bold-center">
                  {data.admitted}
                </td>
              </tr>

              {/* Hàng 3: Chuyển viện */}
              <tr>
                <td colSpan={2} className="cell-bold-label">
                  Chuyển viện:
                </td>
                <td colSpan={2} className="cell-bold-center">
                  {data.transferred}
                </td>
              </tr>

              {/* Hàng 4: Kê đơn, trong đó */}
              <tr>
                <td colSpan={2} className="cell-bold-label">
                  Kê đơn, trong đó:
                </td>
                <td colSpan={2} className="cell-bold-center">
                  {prescriptionsTotal}
                </td>
              </tr>

              {/* Hàng 5: 1 - Tiêu hóa, tiết niệu */}
              <tr>
                <td className="cell-stt">1</td>
                <td className="cell-sub-label">- Tiêu hóa, tiết niệu</td>
                <td colSpan={2} className="cell-bold-center">
                  {data.details.digestiveAndUrinary}
                </td>
              </tr>

              {/* Hàng 6: 2 - Hô hấp, sốt */}
              <tr>
                <td className="cell-stt">2</td>
                <td className="cell-sub-label">- Hô hấp, sốt</td>
                <td colSpan={2} className="cell-bold-center">
                  {data.details.respiratoryAndFever}
                </td>
              </tr>

              {/* Hàng 7: 3 - Chấn thương */}
              <tr>
                <td className="cell-stt">3</td>
                <td className="cell-sub-label">- Chấn thương</td>
                <td colSpan={2} className="cell-bold-center">
                  {data.details.trauma}
                </td>
              </tr>

              {/* Hàng 8: 4 - Sản */}
              <tr>
                <td className="cell-stt">4</td>
                <td className="cell-sub-label">- Sản</td>
                <td className="cell-split-col">
                  Khám: <span className="font-bold">{data.details.obstetricsExam}</span>
                </td>
                <td className="cell-split-col">
                  Vào viện: <span className="font-bold">{data.details.obstetricsAdmitted}</span>
                </td>
              </tr>

              {/* Hàng 9: 5 - Khám Nhi */}
              <tr>
                <td className="cell-stt">5</td>
                <td className="cell-sub-label">- Khám Nhi</td>
                <td className="cell-split-col">
                  Khám: <span className="font-bold">{data.details.pediatricsExam}</span>
                </td>
                <td className="cell-split-col">
                  Vào viện: <span className="font-bold">{data.details.pediatricsAdmitted}</span>
                </td>
              </tr>

              {/* Hàng 10: 6 - Khám khác */}
              <tr>
                <td className="cell-stt">6</td>
                <td className="cell-sub-label">- Khám khác:</td>
                <td colSpan={2} className="cell-bold-center">
                  {data.details.otherExam}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
