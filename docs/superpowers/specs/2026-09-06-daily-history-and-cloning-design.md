# Thiết kế Tính năng Quản lý Báo cáo Theo Ngày Trực & Kế thừa Dữ liệu (Daily History & Cloning)

## 1. Mục tiêu và Bối cảnh
- **Vấn đề**: Hiện tại ứng dụng chỉ lưu một phiên bản báo cáo duy nhất trong `localStorage`. Khi sang ngày mới, người dùng phải ghi đè hoặc nếu cần xem lại, sửa lỗi số liệu của các ngày trước (ví dụ ngày 03/09) thì không có cách nào truy xuất.
- **Giải pháp**:
  - Quản lý dữ liệu báo cáo độc lập theo từng ngày trực (`YYYY-MM-DD`).
  - Hỗ trợ bộ chọn ngày trực trên thanh Topbar (`[◀] [📅 YYYY-MM-DD] [▶] [Hôm nay]`).
  - Khi chuyển sang ngày mới chưa có dữ liệu: Cho phép **"Sao chép kế thừa từ ngày gần nhất"** (tự động chuyển "Hiện có" thành "Cũ" ở bảng nội trú, giữ danh sách theo dõi) hoặc **"Tạo ngày mới từ mẫu mặc định"**.
  - Cho phép chỉnh sửa và lưu độc lập từng ngày trực.
  - Hỗ trợ sao lưu (Export JSON) toàn bộ lịch sử ra file và phục hồi (Import JSON) khi cần chuyển máy tính.

---

## 2. Mô hình Dữ liệu (Data Model)

### A. Gói dữ liệu ngày trực (`DailyGiaoBanBundle`)
Tập hợp toàn bộ dữ liệu của tất cả các slide trong 1 ngày:
```ts
export type DailyGiaoBanBundle = {
  date: string; // Định dạng "YYYY-MM-DD"
  report: ReportData; // Slide 1: Kíp trực
  outpatient: OutpatientReportData; // Slide 2: Ngoại trú
  afterHours: AfterHoursReportData; // Slide 3: Khám ngoài giờ
  inpatient: InpatientReportData; // Slide 4: Nội trú
  freeTextSlides: FreeTextSlideData[]; // Slide 5..: Văn bản tự do
  soapSlides: SoapSlideData[]; // Slide 6..: Ca bệnh SOAP
  monitoring: MonitoringReportData; // Slide 8: Bệnh nhân theo dõi
  patientCaseTableSlides: PatientCaseTableSlideData[]; // Slide 9: Ca bệnh dạng bảng 6 cột
  updatedAt: string; // ISO timestamp
};
```

### B. Cấu trúc lưu trữ trong LocalStorage
1. `giao-ban-active-date-v1`: Chuỗi ngày đang chọn (ví dụ: `"2026-09-06"`).
2. `giao-ban-dates-index-v1`: Danh sách các ngày đã có báo cáo: `string[]` (ví dụ `["2026-09-03", "2026-09-05", "2026-09-06"]`).
3. `giao-ban-bundle-{YYYY-MM-DD}`: Chứa JSON của `DailyGiaoBanBundle` cho ngày tương ứng.

### C. Tự động chuyển đổi dữ liệu hiện tại (Auto-migration)
Khi tính năng mới khởi chạy lần đầu:
- Nếu máy tính đã có dữ liệu ở các key cũ (`giao-ban-slide-1-v1`, `giao-ban-slide-2-v1`...), hệ thống sẽ tự động đóng gói dữ liệu đó vào ngày hôm nay (`new Date()` hoặc ngày ghi trong `report.reportDate`) thành một `DailyGiaoBanBundle`, tránh hoàn toàn việc mất mát dữ liệu đang làm dở của người dùng.

---

## 3. Quy trình Nghiệp vụ (Workflows)

### Quy trình 1: Chuyển đổi ngày trực
1. Người dùng chọn một ngày trên ô lịch hoặc bấm nút `[◀ Hôm trước]` / `[Hôm sau ▶]`.
2. Nếu có thay đổi chưa lưu ở ngày hiện tại: Hiển thị thông báo nhắc lưu hoặc tự động lưu trước khi chuyển ngày.
3. Nếu ngày đích **đã có dữ liệu**:
   - Tải `DailyGiaoBanBundle` của ngày đó và cập nhật state của toàn bộ các slide.
   - Cập nhật thanh trạng thái: `Đã nạp báo cáo ngày DD/MM/YYYY`.
4. Nếu ngày đích **chưa có dữ liệu**:
   - Hiển thị hộp thoại/thanh chọn phương thức khởi tạo:
     - **Lựa chọn 1: Sao chép từ ngày có dữ liệu gần nhất (Khuyến nghị)**.
     - **Lựa chọn 2: Tạo báo cáo mới từ mẫu mặc định**.

### Quy trình 2: Kế thừa thông minh khi Sao chép (Smart Clone)
Khi sao chép từ ngày $D_{old}$ sang ngày $D_{new}$:
1. **Slide 1 (Thông tin trực)**: Tự động đổi `reportDate` sang $D_{new}$. Giữ lại kíp trực hoặc cho phép sửa.
2. **Slide 2 (Ngoại trú)**: Reset số liệu khám/vào viện về 0 hoặc giữ nguyên danh sách phòng khám.
3. **Slide 3 (Khám ngoài giờ)**: Reset số liệu về 0.
4. **Slide 4 (Nội trú - Quan trọng)**:
   - Với mỗi khoa:
     - Số `Cũ` của ngày mới = Số `Hiện có` của ngày cũ ($Old_{new} = Current_{old}$).
     - Các số `Vào`, `Ra`, `Chuyển viện`, `Tử vong` reset về `0`.
     - Số `Giường thực kê` giữ nguyên.
     - Tự động tính toán lại `Hiện có` và `Thừa/Thiếu`.
5. **Slide 5, 6, 8, 9 (Theo dõi, SOAP, Bảng ca bệnh)**: Kế thừa danh sách bệnh nhân và khoa theo dõi từ ngày cũ để kíp mới tiếp tục theo dõi diễn biến tiếp theo.

### Quy trình 3: Sao lưu và Phục hồi File (.json)
- **Nút "Xuất sao lưu"**: Xuất file `giao-ban-backup-YYYY-MM-DD.json` chứa toàn bộ `dates-index` và tất cả các `DailyGiaoBanBundle`.
- **Nút "Nhập sao lưu"**: Người dùng chọn file JSON ➔ kiểm tra định dạng hợp lệ ➔ nạp toàn bộ lịch sử vào trình duyệt ➔ chuyển sang ngày mới nhất trong file sao lưu.

---

## 4. Thiết kế Giao diện Người dùng (UI Components)

### Component: `DateSelectorBar` (Tích hợp trên Topbar)
- Nằm cạnh logo/tiêu đề thương hiệu.
- Bao gồm:
  - Nút mũi tên chuyển nhanh `[◀]` và `[▶]`.
  - Ô chọn ngày HTML5 `<input type="date" value={currentDate} />` được styled đẹp mắt theo tông màu xanh tím than của Topbar.
  - Nút `[Hôm nay]`.
  - Dấu chấm trạng thái: Xanh lá cây nếu ngày này đã được lưu trong kho dữ liệu.
  - Dropdown/Menu nút quản lý:
    - `[📋 Sao chép sang ngày khác]`
    - `[💾 Tải file sao lưu (.json)]`
    - `[📂 Mở file sao lưu]`

### Modal / Prompt: `UninitializedDateModal`
- Xuất hiện khi chọn một ngày chưa từng lập báo cáo.
- Nút bấm to, rõ ràng:
  - `📋 Kế thừa từ ngày [DD/MM/YYYY]` (với tóm tắt: Tự động chuyển BN hiện có sang cũ).
  - `✨ Khởi tạo mẫu mặc định`.

---

## 5. Kế hoạch Kiểm thử & Xác nhận
1. **Kiểm tra Auto-migration**: Dữ liệu hiện tại khi mở web được bảo toàn nguyên vẹn cho ngày hôm nay.
2. **Kiểm tra Chuyển ngày**:
   - Chuyển về 2 ngày trước, sửa số liệu bất kỳ, bấm Lưu ➔ chỉ ngày đó thay đổi.
   - Quay lại ngày hôm nay ➔ số liệu ngày hôm nay vẫn giữ nguyên.
3. **Kiểm tra Sao chép kế thừa**:
   - Tạo ngày mới từ ngày có sẵn ➔ kiểm tra cột "Cũ" nội trú bằng chính xác cột "Hiện có" của ngày trước.
4. **Kiểm tra Backup/Restore**:
   - Xuất file `.json` ➔ Xóa dữ liệu ➔ Nhập lại file ➔ Tất cả các ngày được phục hồi đầy đủ.
5. **Kiểm tra Xuất Word**:
   - Ở bất kỳ ngày nào đang chọn, bấm "Xuất Word" thì file `.docx` tải về đúng ngày và đúng số liệu của ngày đó.
