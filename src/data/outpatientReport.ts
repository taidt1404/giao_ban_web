export type ClinicItem = {
  id: string;
  name: string;
  total: number;
  admitted: number;
};

export type OutpatientGeneralStats = {
  totalAndAdmitted: string;
  insurance: number;
  service: number;
  onDemand: number;
  diabetes: number;
  hypertension: number;
  copd: number;
  traditionalRehab: number;
  transferred: number;
};

export type OutpatientReportData = {
  general: OutpatientGeneralStats;
  internalClinics: ClinicItem[];
  specialtyClinics: ClinicItem[];
};

export function calculateRate(admitted: number, total: number): string {
  if (!total || total <= 0) return '0';
  const val = (admitted / total) * 100;
  // Làm tròn tối đa 2 chữ số thập phân, nếu là số nguyên thì không cần .00
  const formatted = parseFloat(val.toFixed(2)).toString().replace('.', ',');
  return formatted;
}

export const defaultOutpatientReport: OutpatientReportData = {
  general: {
    totalAndAdmitted: '203/19',
    insurance: 194,
    service: 6,
    onDemand: 3,
    diabetes: 32,
    hypertension: 34,
    copd: 2,
    traditionalRehab: 23,
    transferred: 2,
  },
  internalClinics: [
    { id: 'pk201', name: 'PK 201', total: 12, admitted: 1 },
    { id: 'pk204', name: 'PK 204', total: 0, admitted: 0 },
    { id: 'pk202', name: 'PK 202', total: 0, admitted: 0 },
    { id: 'pk205', name: 'PK 205', total: 18, admitted: 1 },
    { id: 'pk308', name: 'PK 308', total: 16, admitted: 1 },
    { id: 'pk309', name: 'PK 309', total: 0, admitted: 0 },
  ],
  specialtyClinics: [
    { id: 'ngoai', name: 'PK Ngoại', total: 17, admitted: 2 },
    { id: 'san', name: 'Pk Sản', total: 16, admitted: 3 },
    { id: 'nhi', name: 'PK Nhi', total: 20, admitted: 4 },
    { id: 'tmh', name: 'Pk TMH', total: 8, admitted: 1 },
    { id: 'mat', name: 'PK Mắt', total: 8, admitted: 0 },
    { id: 'rhm', name: 'PK RHM', total: 12, admitted: 0 },
    { id: 'yhct', name: 'PK YHCT', total: 10, admitted: 3 },
    { id: 'capcuu', name: 'PK cấp cứu', total: 7, admitted: 5 },
  ],
};
