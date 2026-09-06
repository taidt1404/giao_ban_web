import type { SoapSlideData } from '../data/soapReport';

type Props = {
  data: SoapSlideData;
};

export default function SoapSlidePreview({ data }: Props) {
  return (
    <div className="slide-wrap">
      <div className="slide slide-soap" id="slide-soap">
        <div className="soap-slide-header">
          <div className="soap-patient-header font-bold">
            {data.patientHeader || '1, TÊN BỆNH NHÂN   ... tuổi'}
          </div>
        </div>

        <div className="soap-table-wrap">
          <table className="soap-table">
            <thead>
              <tr>
                <th style={{ width: '13%' }}>
                  Thời gian
                  <br />
                  <span style={{ fontSize: '0.88em', fontWeight: 400 }}>(Ngày, giờ)</span>
                </th>
                <th style={{ width: '43.5%' }}>
                  Diễn biến bệnh
                  <br />
                  <span style={{ fontSize: '0.85em', fontWeight: 400 }}>
                    (Viết diễn biến theo cấu trúc như SOAP)
                  </span>
                </th>
                <th style={{ width: '43.5%' }}>Chỉ định</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-soap-time font-bold">
                    {row.timeText.split('\n').map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </td>
                  <td className="cell-soap-content">
                    <div className="soap-text-block">{row.progression}</div>
                  </td>
                  <td className="cell-soap-content">
                    <div className="soap-text-block">{row.orders}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
