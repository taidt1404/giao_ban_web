import { useMemo } from 'react';
import {
  type OutpatientReportData,
  calculateRate,
} from '../data/outpatientReport';

type Props = {
  data: OutpatientReportData;
};

export default function Slide2Preview({ data }: Props) {
  // Tính tổng tự động cho PK Nội
  const internalSummary = useMemo(() => {
    const total = data.internalClinics.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const admitted = data.internalClinics.reduce(
      (sum, item) => sum + (Number(item.admitted) || 0),
      0,
    );
    const rate = calculateRate(admitted, total);
    return { total, admitted, rate };
  }, [data.internalClinics]);

  return (
    <div className="slide-wrap">
      <div className="slide slide-2" id="slide-2">
        <div className="slide2-header">
          <h1 className="slide2-title">I .TÌNH HÌNH NGƯỜI BỆNH NGOẠI TRÚ</h1>
        </div>

        <div className="outpatient-table-wrap">
          <table className="outpatient-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>Nội dung</th>
                <th style={{ width: '13%' }}>Tổng số</th>
                <th style={{ width: '14%' }}>Nội dung</th>
                <th style={{ width: '13%' }}></th>
                <th style={{ width: '14%' }}>Tổng số</th>
                <th style={{ width: '14%' }}>Vào viện</th>
                <th style={{ width: '14%' }}>Tổng %</th>
              </tr>
            </thead>
            <tbody>
              {/* Hàng 1: Tổng số/vào viện & Dòng Tổng PK Nội */}
              <tr>
                <td className="cell-label font-bold">Tổng số/vào viện</td>
                <td className="cell-value font-bold">{data.general.totalAndAdmitted}</td>
                <td rowSpan={8} className="cell-group font-bold">
                  PK Nội
                </td>
                <td className="cell-clinic font-bold">Tổng</td>
                <td className="cell-value font-bold">{internalSummary.total}</td>
                <td className="cell-value font-bold">{internalSummary.admitted}</td>
                <td className="cell-value font-bold">{internalSummary.rate}</td>
              </tr>

              {/* Hàng 2: Bảo hiểm y tế & PK 201 */}
              <tr>
                <td className="cell-label font-bold">Bảo hiểm y tế</td>
                <td className="cell-value font-bold">{data.general.insurance}</td>
                <td className="cell-clinic font-bold">{data.internalClinics[0]?.name || 'PK 201'}</td>
                <td className="cell-value font-bold">{data.internalClinics[0]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.internalClinics[0]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.internalClinics[0]?.admitted ?? 0,
                    data.internalClinics[0]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 3: Dịch vụ & PK 202 */}
              <tr>
                <td className="cell-label font-bold">Dịch vụ</td>
                <td className="cell-value font-bold">{data.general.service}</td>
                <td className="cell-clinic font-bold">{data.internalClinics[1]?.name || 'PK 202'}</td>
                <td className="cell-value font-bold">{data.internalClinics[1]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.internalClinics[1]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.internalClinics[1]?.admitted ?? 0,
                    data.internalClinics[1]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 4: Khám yêu cầu & PK 204 */}
              <tr>
                <td className="cell-label font-bold">Khám yêu cầu</td>
                <td className="cell-value font-bold">{data.general.onDemand}</td>
                <td className="cell-clinic font-bold">{data.internalClinics[2]?.name || 'PK 204'}</td>
                <td className="cell-value font-bold">{data.internalClinics[2]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.internalClinics[2]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.internalClinics[2]?.admitted ?? 0,
                    data.internalClinics[2]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 5: Đái tháo đường & PK 205 */}
              <tr>
                <td className="cell-label font-bold">Đái tháo đường</td>
                <td className="cell-value font-bold">{data.general.diabetes}</td>
                <td className="cell-clinic font-bold">{data.internalClinics[3]?.name || 'PK 205'}</td>
                <td className="cell-value font-bold">{data.internalClinics[3]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.internalClinics[3]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.internalClinics[3]?.admitted ?? 0,
                    data.internalClinics[3]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 6: Tăng huyết áp (rowSpan 3) & PK 210 */}
              <tr>
                <td rowSpan={3} className="cell-label font-bold cell-vcenter">
                  Tăng huyết áp
                </td>
                <td rowSpan={3} className="cell-value font-bold cell-vcenter">
                  {data.general.hypertension}
                </td>
                <td className="cell-clinic font-bold">{data.internalClinics[4]?.name || 'PK 210'}</td>
                <td className="cell-value font-bold">{data.internalClinics[4]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.internalClinics[4]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.internalClinics[4]?.admitted ?? 0,
                    data.internalClinics[4]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 7: PK 308 */}
              <tr>
                <td className="cell-clinic font-bold">{data.internalClinics[5]?.name || 'PK 308'}</td>
                <td className="cell-value font-bold">{data.internalClinics[5]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.internalClinics[5]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.internalClinics[5]?.admitted ?? 0,
                    data.internalClinics[5]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 8: PK 309 */}
              <tr>
                <td className="cell-clinic font-bold">{data.internalClinics[6]?.name || 'PK 309'}</td>
                <td className="cell-value font-bold">{data.internalClinics[6]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.internalClinics[6]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.internalClinics[6]?.admitted ?? 0,
                    data.internalClinics[6]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 8: COPD & PK Ngoại */}
              <tr>
                <td className="cell-label font-bold">COPD</td>
                <td className="cell-value font-bold">{data.general.copd}</td>
                <td className="cell-clinic font-bold">{data.specialtyClinics[0]?.name || 'PK Ngoại'}</td>
                <td></td>
                <td className="cell-value font-bold">{data.specialtyClinics[0]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.specialtyClinics[0]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.specialtyClinics[0]?.admitted ?? 0,
                    data.specialtyClinics[0]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 9: Điều trị ngoại trú YHCT - PHCN & Pk Sản */}
              <tr>
                <td className="cell-label font-bold text-center" style={{ fontSize: '0.82em' }}>
                  Điều trị ngoại trú
                  <br />
                  YHCT - PHCN
                </td>
                <td className="cell-value font-bold">{data.general.traditionalRehab}</td>
                <td className="cell-clinic font-bold">{data.specialtyClinics[1]?.name || 'Pk Sản'}</td>
                <td></td>
                <td className="cell-value font-bold">{data.specialtyClinics[1]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.specialtyClinics[1]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.specialtyClinics[1]?.admitted ?? 0,
                    data.specialtyClinics[1]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 10: Chuyển viện & PK Nhi */}
              <tr>
                <td className="cell-label font-bold">Chuyển viện</td>
                <td className="cell-value font-bold">{data.general.transferred}</td>
                <td className="cell-clinic font-bold">{data.specialtyClinics[2]?.name || 'PK Nhi'}</td>
                <td></td>
                <td className="cell-value font-bold">{data.specialtyClinics[2]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.specialtyClinics[2]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.specialtyClinics[2]?.admitted ?? 0,
                    data.specialtyClinics[2]?.total ?? 0,
                  )}
                </td>
              </tr>

              {/* Hàng 11..15: Bên trái trống (rowSpan 5), bên phải lần lượt TMH, Mắt, RHM, YHCT, Cấp cứu */}
              <tr>
                <td rowSpan={5} colSpan={2} className="cell-empty-block"></td>
                <td className="cell-clinic font-bold">{data.specialtyClinics[3]?.name || 'Pk TMH'}</td>
                <td></td>
                <td className="cell-value font-bold">{data.specialtyClinics[3]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.specialtyClinics[3]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.specialtyClinics[3]?.admitted ?? 0,
                    data.specialtyClinics[3]?.total ?? 0,
                  )}
                </td>
              </tr>

              <tr>
                <td className="cell-clinic font-bold">{data.specialtyClinics[4]?.name || 'PK Mắt'}</td>
                <td></td>
                <td className="cell-value font-bold">{data.specialtyClinics[4]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.specialtyClinics[4]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.specialtyClinics[4]?.admitted ?? 0,
                    data.specialtyClinics[4]?.total ?? 0,
                  )}
                </td>
              </tr>

              <tr>
                <td className="cell-clinic font-bold">{data.specialtyClinics[5]?.name || 'PK RHM'}</td>
                <td></td>
                <td className="cell-value font-bold">{data.specialtyClinics[5]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.specialtyClinics[5]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.specialtyClinics[5]?.admitted ?? 0,
                    data.specialtyClinics[5]?.total ?? 0,
                  )}
                </td>
              </tr>

              <tr>
                <td className="cell-clinic font-bold">{data.specialtyClinics[6]?.name || 'PK YHCT'}</td>
                <td></td>
                <td className="cell-value font-bold">{data.specialtyClinics[6]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.specialtyClinics[6]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.specialtyClinics[6]?.admitted ?? 0,
                    data.specialtyClinics[6]?.total ?? 0,
                  )}
                </td>
              </tr>

              <tr>
                <td className="cell-clinic font-bold">{data.specialtyClinics[7]?.name || 'PK cấp cứu'}</td>
                <td></td>
                <td className="cell-value font-bold">{data.specialtyClinics[7]?.total ?? 0}</td>
                <td className="cell-value font-bold">{data.specialtyClinics[7]?.admitted ?? 0}</td>
                <td className="cell-value font-bold">
                  {calculateRate(
                    data.specialtyClinics[7]?.admitted ?? 0,
                    data.specialtyClinics[7]?.total ?? 0,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
