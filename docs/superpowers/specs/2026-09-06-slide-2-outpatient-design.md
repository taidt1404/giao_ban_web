# Tài liệu Thiết kế: Slide 2 - Tình Hình Người Bệnh Ngoại Trú

## 1. Mục tiêu
Bổ sung Slide 2 cho hệ thống báo cáo giao ban: **I . TÌNH HÌNH NGƯỜI BỆNH NGOẠI TRÚ**, bao gồm:
- Bảng tổng hợp hiển thị giao diện slide 16:9 sắc nét, sát với mẫu báo cáo bệnh viện.
- Form nhập liệu riêng cho Slide 2.
- Cơ chế tự động tính toán tỷ lệ phần trăm: `Tổng % = (Vào viện / Tổng số) * 100` (định dạng dấu phẩy tiếng Việt như `8,33%`, `12,5%`).
- Cơ chế tự động tính dòng "Tổng PK Nội" từ các phòng khám con.
- Hỗ trợ chuyển đổi qua lại giữa Slide 1 và Slide 2 trên sidebar.
- Cập nhật chức năng xuất file Word (.docx) để xuất cả Slide 1 và Slide 2 thành tài liệu hoàn chỉnh.

---

## 2. Mô hình Dữ liệu (Data Model)
Tạo file `src/data/outpatientReport.ts`:
```ts
export type ClinicItem = {
  id: string;
  name: string;
  total: number;
  admitted: number;
};

export type OutpatientReportData = {
  general: {
    totalAndAdmitted: string; // "203/19"
    insurance: number; // Bảo hiểm y tế: 194
    service: number; // Dịch vụ: 6
    onDemand: number; // Khám yêu cầu: 3
    diabetes: number; // Đái tháo đường: 32
    hypertension: number; // Tăng huyết áp: 34
    copd: number; // COPD: 2
    traditionalRehab: number; // ĐT ngoại trú YHCT - PHCN: 23
    transferred: number; // Chuyển viện: 2
  };
  internalClinics: ClinicItem[]; // PK 201, 204, 202, 205, 308, 309
  specialtyClinics: ClinicItem[]; // PK Ngoại, Sản, Nhi, TMH, Mắt, RHM, YHCT, Cấp cứu
};
```

---

## 3. Quy tắc Tính toán Tự động
1. **Công thức tính tỷ lệ %**:
   - `calculateRate(admitted: number, total: number): string`
   - Nếu `total === 0` -> trả về `"0"`
   - Tỷ lệ: `(admitted / total) * 100`, làm tròn 2 chữ số thập phân, thay dấu `.` bằng dấu `,` (ví dụ `1/12` thành `8,33`, `1/16` thành `6,25`, `1/8` thành `12,5`).
2. **Cộng dồn dòng Tổng PK Nội**:
   - `total = sum(internalClinics.total)`
   - `admitted = sum(internalClinics.admitted)`
   - `% = calculateRate(admitted, total)`

---

## 4. Giao diện Người dùng (UI/UX)
1. **Thanh bên (Sidebar)**:
   - Kích hoạt nút Slide 2 (bỏ disabled, có thumbnail preview nhỏ).
   - Cho phép click chọn giữa Slide 1 và Slide 2, hiển thị rõ trang hiện tại `1 / 32` hoặc `2 / 32`.
2. **Slide Preview 2**:
   - Bố cục bảng chia 2 cột lớn:
     - Cột trái: Chỉ tiêu chung ngoại trú.
     - Cột phải: Bảng chi tiết phòng khám với header xanh đậm, các dòng xen kẽ dễ nhìn.
3. **Editor Panel**:
   - Hiển thị theo slide đang chọn: nếu đang ở Slide 1 -> EditorPanel 1; nếu đang ở Slide 2 -> EditorPanel 2.
   - Các ô nhập số nhanh gọn, tự động cập nhật ngay lập tức sang bảng xem trước.
4. **Xuất Word**:
   - Cập nhật `exportWord.ts` thêm mục **II. TÌNH HÌNH NGƯỜI BỆNH NGOẠI TRÚ** với bảng tương ứng.
