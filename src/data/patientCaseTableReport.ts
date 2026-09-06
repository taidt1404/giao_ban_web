export type PatientCaseTableRow = {
  id: string;
  stt?: string;
  patientInfo: string;
  reasonAndExam: string;
  subclinical: string;
  diagnosis: string;
  treatment: string;
};

export type PatientCaseTableSlideData = {
  id: string;
  title: string;
  rows: PatientCaseTableRow[];
};

export const defaultPatientCaseTableSlides: PatientCaseTableSlideData[] = [
  {
    id: 'case-table-1',
    title: 'IX. BỆNH NHÂN NGOẠI TRÚ / KHÁM BỆNH ĐẶC BIỆT',
    rows: [
      {
        id: 'row-1',
        stt: '1',
        patientInfo: 'TRẦN VĂN THỎA 56 tuổi\nThôn Lương Phong, Xã Hiệp Hoà\n16H50',
        reasonAndExam:
          'LDK: đau tê tay trái\nTheo lời người bệnh kể cách vào viện 30 phút người bệnh ở nhà tự nhiên xuất hiện tê, yếu tay trái, ở nhà chưa xử trí gì đến khám kiểm tra.\n- Khám: tỉnh., không sốt G: 15 điểm\nTê tay trái , nắm khó, vận động bình thường\nĐại tiểu tiện bình thường\nHội chứng não, màng não âm tính\nCác cơ quan khác chưa phát hiện bất thường\n.Mạch: 76 lần/ phút, nhiệt độ: 36,8 độ C, nhịp thở: 21 lần/ phút\nC Đ: Tê , yếu tay trái chưa rõ nguyên nhân',
        subclinical:
          'MRI. Chụp cộng hưởng từ sọ não (0.2-1.5T):\nHiện không thấy hình ảnh bất thường nội sọ trên phim chụp cộng hưởng từ sọ não-mạch não. Dày niêm mạc xoang hàm, sàng hai bên.',
        diagnosis: 'Tê tay – Theo dõi viêm xoang sàng hai bên',
        treatment: 'Tư vấn nhập viện điều trị , người bệnh không đồng ý xin kê đơn về',
      },
    ],
  },
];
