export type InpatientDepartment = {
  id: string;
  name: string; // NỘI, CC-HS, NHI, NGOẠI, SẢN, LCK, YHCT
  oldPatients: number; // CŨ
  admitted: number; // VÀO
  discharged: number; // RA
  transferred: number; // CHUYỂN VIỆN
  deceased: number; // TỬ VONG
  actualBeds: number; // GIƯỜNG THỰC KÊ
};

export type InpatientReportData = {
  departments: InpatientDepartment[];
};

// Hàm tính HIỆN CÓ cho từng khoa: CŨ + VÀO - RA - CHUYỂN VIỆN - TỬ VONG
export function calculateCurrentPatients(dept: InpatientDepartment): number {
  return (
    (Number(dept.oldPatients) || 0) +
    (Number(dept.admitted) || 0) -
    (Number(dept.discharged) || 0) -
    (Number(dept.transferred) || 0) -
    (Number(dept.deceased) || 0)
  );
}

// Hàm tính THỪA/THIẾU = GIƯỜNG THỰC KÊ - HIỆN CÓ
export function calculateBedDifference(actualBeds: number, currentPatients: number): string {
  const diff = (Number(actualBeds) || 0) - (Number(currentPatients) || 0);
  if (diff > 0) return `+${diff}`;
  return diff.toString();
}

export const defaultInpatientReport: InpatientReportData = {
  departments: [
    {
      id: 'noi',
      name: 'NỘI',
      oldPatients: 40,
      admitted: 7,
      discharged: 9,
      transferred: 0,
      deceased: 0,
      actualBeds: 48,
    },
    {
      id: 'cchs',
      name: 'CC-HS',
      oldPatients: 9,
      admitted: 2,
      discharged: 1,
      transferred: 0,
      deceased: 0,
      actualBeds: 10,
    },
    {
      id: 'nhi',
      name: 'NHI',
      oldPatients: 59,
      admitted: 7,
      discharged: 12,
      transferred: 0,
      deceased: 0,
      actualBeds: 63,
    },
    {
      id: 'ngoai',
      name: 'NGOẠI',
      oldPatients: 37,
      admitted: 4,
      discharged: 5,
      transferred: 0,
      deceased: 0,
      actualBeds: 38,
    },
    {
      id: 'san',
      name: 'SẢN',
      oldPatients: 27,
      admitted: 5,
      discharged: 8,
      transferred: 0,
      deceased: 0,
      actualBeds: 20,
    },
    {
      id: 'lck',
      name: 'LCK',
      oldPatients: 9,
      admitted: 1,
      discharged: 4,
      transferred: 0,
      deceased: 0,
      actualBeds: 15,
    },
    {
      id: 'yhct',
      name: 'YHCT',
      oldPatients: 5,
      admitted: 1,
      discharged: 0,
      transferred: 0,
      deceased: 0,
      actualBeds: 3,
    },
  ],
};
