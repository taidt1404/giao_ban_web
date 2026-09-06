export type SoapTimelineRow = {
  id: string;
  timeText: string; // VD: "22/08/2026\n20:20"
  progression: string; // Diễn biến bệnh (theo cấu trúc SOAP)
  orders: string; // Chỉ định (CLS, thuốc, chế độ ăn, chăm sóc)
};

export type SoapSlideData = {
  id: string;
  patientHeader: string; // VD: "1, ĐỖ THỊ SONG    66 tuổi"
  rows: SoapTimelineRow[];
};

export const defaultSoapSlides: SoapSlideData[] = [
  {
    id: 'soap-slide-1',
    patientHeader: '1, ĐỖ THỊ SONG    66 tuổi',
    rows: [
      {
        id: 'row-1',
        timeText: '22/08/2026\n20:20',
        progression:
          'Tiền sử : Mới cắt polip đại tràng 1 tuần\n' +
          'Theo lời người bệnh kể cách vào viện 3 ngày người bệnh ở nhà xuất hiện đau bụng quặn cơn hạ vị , mệt mỏi, ăn uống kém, ở nhà người bệnh chưa dùng thuốc gì. Tối nay mệt nhiều, đau bụng quặn cơn vùng dưới rốn, ăn vào lại nôn ra, đại tiện ít phân, kèm đau đầu, chóng mặt, gia đình lo lắng cho nhập viện điều trị.\n' +
          'Lúc vào : Bệnh nhân tỉnh, G : 15 điểm, vật vã\n' +
          'Da, niêm mạc hồng nhạt\n' +
          'Thể trạng trung bình\n' +
          'Không sốt\n' +
          'Đau bụng quặn cơn hạ vị\n' +
          'Buồn nôn, ăn vào nôn\n' +
          'Đại tiện ít phân sền sệt\n' +
          'Mệt mỏi nhiều\n' +
          'Tim nhịp đều, T1T2 rõ\n' +
          'Không thấy tiếng tim bệnh lý\n' +
          'Phổi không có rales\n' +
          'Bụng mềm, không chướng\n' +
          'Gan, lách không sờ thấy\n' +
          'Ấn hạ vị đau tức\n' +
          'Mạch : 78 lần/phút\n' +
          'HA : 120/80 mmHg\n' +
          'SPO2 : 95 %\n' +
          'T : 37 độ C\n' +
          'P : 52 kg\n' +
          'Chẩn đoán ban đầu : Đau bụng - nôn chưa rõ nguyên nhân - Bệnh trào ngược dạ dày, thực quản\n' +
          'Tiên lượng : Dè dặt\n' +
          'Hướng điều trị : Truyền dịch, giảm tiết, Tìm và điều trị theo nguyên nhân',
        orders:
          '* Chỉ định cận lâm sàng:\n' +
          '- Tổng phân tích tế bào máu ngoại vi (bằng máy đếm laser)\n' +
          '- Điện giải đồ (Na, K, Cl) [Máu]\n' +
          '- Định lượng Creatinin (máu)\n' +
          '- Định lượng Glucose [Máu]\n' +
          '- Đo hoạt độ ALT (GPT) [Máu]\n' +
          '- Đo hoạt độ AST (GOT) [Máu]\n' +
          '- Chụp X-quang bụng không chuẩn bị thẳng hoặc nghiêng [số hóa 1 phim]\n' +
          '- Chụp X-quang ngực thẳng [số hóa 1 phim]\n' +
          '- Chụp CT scanner ổ bụng\n' +
          '- Siêu âm ổ bụng (gan mật, tụy, lách, thận, bàng quang)\n' +
          '- Điện tim thường\n' +
          '* Đơn thuốc:\n' +
          '- Sodium Chloride Injection 0,9%; 500ml x 01 Chai\n' +
          '    Truyền tĩnh mạch 40 giọt/phút- 20h20\n' +
          '- Lactated Ringer\'s (3g+1,55g+0,15g+0,1g)/500ml x 01 Chai\n' +
          '    Truyền tĩnh mạch 40 giọt/ phút\n' +
          '- Vinxium 40mg x 01 Lọ\n' +
          '    Tiêm tĩnh mạch chậm 20h20(01 lọ/lần)\n' +
          'TH01 - Cháo\n' +
          'Chăm sóc cấp 2\n' +
          'Theo dõi thêm',
      },
    ],
  },
];
