import React, { useMemo } from 'react';
import {
  type OutpatientReportData,
  calculateRate,
} from '../data/outpatientReport';

type Props = {
  data: OutpatientReportData;
};

type LeftItem = {
  label: React.ReactNode;
  value: string | number;
  style?: React.CSSProperties;
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

  // Chuẩn bị danh sách hàng cột trái
  const leftItems = useMemo<LeftItem[]>(() => {
    const items: LeftItem[] = [
      { label: 'Tổng số/vào viện', value: data.general.totalAndAdmitted },
      { label: 'Bảo hiểm y tế', value: data.general.insurance },
      { label: 'Dịch vụ', value: data.general.service },
      { label: 'Khám yêu cầu', value: data.general.onDemand },
      { label: 'Đái tháo đường', value: data.general.diabetes },
      { label: 'Tăng huyết áp', value: data.general.hypertension },
      { label: 'COPD', value: data.general.copd },
      { label: 'Viêm Gan B, C', value: data.general.hepatitisB ?? 0 },
      {
        label: (
          <span>
            Điều trị ngoại trú
            <br />
            YHCT - PHCN
          </span>
        ),
        value: data.general.traditionalRehab,
        style: { fontSize: '0.82em', textAlign: 'center' },
      },
      { label: 'Chuyển viện', value: data.general.transferred },
    ];

    if (Array.isArray(data.general.customStats)) {
      data.general.customStats.forEach((stat) => {
        items.push({
          label: stat.name,
          value: stat.value,
        });
      });
    }

    return items;
  }, [data.general]);

  const internalCount = data.internalClinics.length;
  const specialtyCount = data.specialtyClinics.length;
  const rightRowsCount = 1 + internalCount + specialtyCount;
  const totalRows = Math.max(leftItems.length, rightRowsCount);

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
              {Array.from({ length: totalRows }).map((_, r) => {
                // Cột trái
                let leftCells: React.ReactNode = null;
                if (r < leftItems.length) {
                  const item = leftItems[r];
                  leftCells = (
                    <>
                      <td className="cell-label font-bold" style={item.style}>
                        {item.label}
                      </td>
                      <td className="cell-value font-bold">{item.value}</td>
                    </>
                  );
                } else if (r === leftItems.length && leftItems.length < totalRows) {
                  leftCells = (
                    <td
                      rowSpan={totalRows - leftItems.length}
                      colSpan={2}
                      className="cell-empty-block"
                    />
                  );
                }

                // Cột phải
                let rightCells: React.ReactNode = null;
                if (r === 0) {
                  // Hàng Tổng PK Nội
                  rightCells = (
                    <>
                      <td rowSpan={1 + internalCount} className="cell-group font-bold">
                        PK Nội
                      </td>
                      <td className="cell-clinic font-bold">Tổng</td>
                      <td className="cell-value font-bold">{internalSummary.total}</td>
                      <td className="cell-value font-bold">{internalSummary.admitted}</td>
                      <td className="cell-value font-bold">{internalSummary.rate}</td>
                    </>
                  );
                } else if (r >= 1 && r <= internalCount) {
                  // Từng phòng khám Nội
                  const clinic = data.internalClinics[r - 1];
                  rightCells = (
                    <>
                      <td className="cell-clinic font-bold">{clinic?.name || ''}</td>
                      <td className="cell-value font-bold">{clinic?.total ?? 0}</td>
                      <td className="cell-value font-bold">{clinic?.admitted ?? 0}</td>
                      <td className="cell-value font-bold">
                        {calculateRate(clinic?.admitted ?? 0, clinic?.total ?? 0)}
                      </td>
                    </>
                  );
                } else if (r > internalCount && r < rightRowsCount) {
                  // Các chuyên khoa khác
                  const spIdx = r - (1 + internalCount);
                  const clinic = data.specialtyClinics[spIdx];
                  rightCells = (
                    <>
                      <td className="cell-clinic font-bold">{clinic?.name || ''}</td>
                      <td></td>
                      <td className="cell-value font-bold">{clinic?.total ?? 0}</td>
                      <td className="cell-value font-bold">{clinic?.admitted ?? 0}</td>
                      <td className="cell-value font-bold">
                        {calculateRate(clinic?.admitted ?? 0, clinic?.total ?? 0)}
                      </td>
                    </>
                  );
                } else {
                  // Hàng trống bên phải nếu bên trái dài hơn bên phải
                  rightCells = <td colSpan={5}></td>;
                }

                return (
                  <tr key={r}>
                    {leftCells}
                    {rightCells}
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
