export type DepartmentMonitoring = {
  id: string;
  name: string;
  count: number;
};

export type MonitoringReportData = {
  title: string;
  departments: DepartmentMonitoring[];
};

export const defaultMonitoringReport: MonitoringReportData = {
  title: 'VIII. BỆNH NHÂN THEO DÕI',
  departments: [
    { id: 'noi-hscc', name: 'NỘI - HSCC', count: 0 },
    { id: 'ngoai', name: 'NGOẠI', count: 0 },
    { id: 'san', name: 'SẢN', count: 2 },
    { id: 'nhi', name: 'NHI', count: 0 },
    { id: 'lck', name: 'LCK', count: 0 },
  ],
};
