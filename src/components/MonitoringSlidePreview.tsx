import type { MonitoringReportData } from '../data/monitoringReport';

type Props = {
  data: MonitoringReportData;
};

export default function MonitoringSlidePreview({ data }: Props) {
  return (
    <div className="slide-wrap">
      <div className="slide slide-monitoring">
        <div className="monitoring-slide-header">
          <h1 className="monitoring-slide-title">
            {data.title || 'VIII. BỆNH NHÂN THEO DÕI'}
          </h1>
        </div>

        <div className="monitoring-table-wrap">
          <table className="monitoring-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>KHOA</th>
                <th style={{ width: '50%' }}>BN THEO DÕI</th>
              </tr>
            </thead>
            <tbody>
              {data.departments.map((dept, index) => {
                const isOdd = index % 2 === 0;
                return (
                  <tr
                    key={dept.id}
                    className={isOdd ? 'row-alt-dark' : 'row-alt-light'}
                  >
                    <td className="cell-dept-name font-bold">{dept.name}</td>
                    <td className="cell-dept-count font-bold">{dept.count}</td>
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
