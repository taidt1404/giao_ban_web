export type AfterHoursDetail = {
  digestiveAndUrinary: number; // 1. Tiêu hóa, tiết niệu
  respiratoryAndFever: number; // 2. Hô hấp, sốt
  trauma: number; // 3. Chấn thương
  obstetricsExam: number; // 4. Sản - Khám
  obstetricsAdmitted: number; // 4. Sản - Vào viện
  pediatricsExam: number; // 5. Khám Nhi - Khám
  pediatricsAdmitted: number; // 5. Khám Nhi - Vào viện
  otherExam: number; // 6. Khám khác
};

export type AfterHoursReportData = {
  admitted: number; // Vào viện (vd 7)
  transferred: number; // Chuyển viện (vd 0)
  details: AfterHoursDetail;
};

// Hàm tính Kê đơn, trong đó (tổng các ca kê đơn)
export function calculatePrescriptionsTotal(details: AfterHoursDetail): number {
  return (
    (Number(details.digestiveAndUrinary) || 0) +
    (Number(details.respiratoryAndFever) || 0) +
    (Number(details.trauma) || 0) +
    (Number(details.obstetricsExam) || 0) +
    (Number(details.pediatricsExam) || 0) +
    (Number(details.otherExam) || 0)
  );
}

// Hàm tính Tổng khám = Vào viện + Kê đơn + Chuyển viện
export function calculateTotalExams(data: AfterHoursReportData): number {
  const prescriptions = calculatePrescriptionsTotal(data.details);
  return (Number(data.admitted) || 0) + prescriptions + (Number(data.transferred) || 0);
}

export const defaultAfterHoursReport: AfterHoursReportData = {
  admitted: 7,
  transferred: 0,
  details: {
    digestiveAndUrinary: 1,
    respiratoryAndFever: 0,
    trauma: 6,
    obstetricsExam: 1,
    obstetricsAdmitted: 1,
    pediatricsExam: 3,
    pediatricsAdmitted: 3,
    otherExam: 2,
  },
};
