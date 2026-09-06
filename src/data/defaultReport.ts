export type ReportData = {
  reportDate: string;
  doctors: string[];
  nurses: string[];
  pharmacy: string;
  xray: string;
  laboratory: string[];
  administration: string;
};

export const defaultReport: ReportData = {
  reportDate: '2026-08-22',
  doctors: ['Phong', 'Đức', 'Hợi', 'Nga', 'Khiêm'],
  nurses: [
    'Phương C',
    'Trang C',
    'Nga (Nội)',
    'Kiên (CC)',
    'Thanh',
    'Hương (Nhi)',
    'Hồng (Ngoại)',
    'Thắm (Sản)',
    'Nam (YHCT)',
  ],
  pharmacy: 'Phương Anh',
  xray: 'Mạnh',
  laboratory: ['Đức', 'Sơn'],
  administration: 'Long',
};
