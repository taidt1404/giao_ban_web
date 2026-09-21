# Thiết kế tính năng: Khóa bảo vệ và Cảnh báo chỉnh sửa báo cáo ngày cũ

## 1. Mục tiêu
Ngăn ngừa rủi ro người dùng hoặc nhân viên trực vô tình chỉnh sửa, làm thay đổi hoặc ghi đè mất dữ liệu báo cáo giao ban của các ngày trong quá khứ trên máy chủ lưu trữ tập trung.

## 2. Phạm vi & Nguyên tắc hoạt động
- **Phân loại ngày cũ**: Bất kỳ ngày nào nhỏ hơn ngày hiện tại theo thời gian thực (`currentDate < todayStr`, định dạng `YYYY-MM-DD`).
- **Mặc định khi mở ngày cũ**: Luôn kích hoạt chế độ **Chỉ đọc (Read-only / Khóa chỉnh sửa)**.
- **Mở khóa có chủ đích**: Người dùng chỉ có thể sửa dữ liệu ngày cũ khi chủ động bấm "Mở khóa chỉnh sửa" và xác nhận hộp thoại cảnh báo rủi ro ghi đè dữ liệu lịch sử.
- **Bảo toàn chức năng tra cứu**: Trong chế độ khóa, các tính năng Trình chiếu (F5), Xuất Word (.docx), In/PDF và chuyển slide vẫn hoạt động 100% bình thường.
- **Không tự động lưu đè khi xem**: Nếu người dùng đang xem một ngày cũ ở trạng thái bị khóa rồi chuyển sang ngày khác, hệ thống không tự động lưu đè dữ liệu lên server.

## 3. Thành phần giao diện & Tương tác

### 3.1. Thanh cảnh báo ngày cũ (`PastDateWarningBanner`)
- Vị trí: Đặt ngay dưới thanh Topbar, phía trên vùng làm việc chính.
- Hai trạng thái:
  1. **Trạng thái Khóa (`isLocked = true`)**:
     - Giao diện: Nền màu vàng cam nhẹ (`#fef3c7`), viền hổ phách (`#f59e0b`), chữ cảnh báo đậm rõ.
     - Biểu tượng: `Lock` (ổ khóa).
     - Nội dung: *"Bạn đang xem báo cáo ngày cũ (DD/MM/YYYY). Chế độ bảo vệ: Chỉ đọc (không thể sửa) để tránh ghi đè dữ liệu lịch sử."*
     - Nút hành động: `Mở khóa chỉnh sửa` (Icon `Unlock`). Khi nhấn, hiển thị hộp thoại xác nhận:
       > *"Bạn đang chuẩn bị chỉnh sửa báo cáo của ngày cũ (DD/MM/YYYY). Mọi thay đổi sẽ ghi đè lên dữ liệu lịch sử trên máy chủ. Bạn có chắc chắn muốn mở khóa để chỉnh sửa không?"*
       - Nếu nhấn "Hủy": Giữ nguyên trạng thái khóa.
       - Nếu nhấn "Đồng ý": Chuyển sang trạng thái Mở khóa (`isLocked = false`).
  2. **Trạng thái Đã mở khóa (`isLocked = false` trên ngày cũ)**:
     - Giao diện: Nền cam cảnh báo (`#ffedd5`), viền cam đậm (`#ea580c`).
     - Biểu tượng: `AlertTriangle` (cảnh báo nguy cơ).
     - Nội dung: *"Đang cho phép chỉnh sửa báo cáo ngày cũ (DD/MM/YYYY). Hãy cẩn thận khi thay đổi dữ liệu!"*
     - Nút hành động: `Khóa lại` (Icon `Lock`). Cho phép người dùng chủ động khóa lại ngay lập tức.

### 3.2. Kiểm soát các khu vực nhập liệu & Nút chức năng
Khi `isLocked = true`:
- **Cột Editor bên phải (`right-panel`)**:
  - Toàn bộ form nhập liệu bị vô hiệu hóa (`pointer-events: none; opacity: 0.65`).
  - Phía trên đỉnh panel hiển thị huy hiệu nhỏ: *"🔒 Đang khóa chỉnh sửa"*.
- **Vùng Slide Preview (Canvas)**:
  - Vô hiệu hóa các thao tác sửa trực tiếp trên bảng biểu (Slide 4, SOAP, Bảng ca bệnh).
- **Thanh công cụ Topbar**:
  - Nút **"Lưu báo cáo"**: Vô hiệu hóa (`disabled`), đổi tooltip: *"Báo cáo ngày cũ đang khóa, hãy mở khóa nếu muốn lưu"*.
  - Nút **"Khôi phục mẫu"**: Vô hiệu hóa (`disabled`).
  - Các nút: **"Trình chiếu (F5)"**, **"Xuất Word"**, **"In / PDF"**: Hoạt động bình thường.
- **Thanh chọn ngày (`DateSelectorBar`)**:
  - Khi chuyển ngày: Nếu ngày hiện tại đang bị khóa (`isLocked === true`), bỏ qua bước tự động lưu đè (`saveDailyBundle`), chỉ tải dữ liệu của ngày mới.
  - Sau khi chuyển sang ngày mới: Tự động đánh giá lại nếu ngày mới là ngày cũ thì bật khóa (`isLocked = true`), nếu là ngày hôm nay/tương lai thì mở bình thường (`isLocked = false`).

## 4. Kế hoạch xác minh (Verification Plan)
1. Mở ngày hôm nay (`todayStr`): Kiểm tra giao diện bình thường, không có thanh cảnh báo, được phép chỉnh sửa và lưu.
2. Chọn một ngày trong quá khứ:
   - Thanh cảnh báo màu vàng xuất hiện báo hiệu chế độ Chỉ đọc.
   - Cột Editor bên phải bị khóa không gõ được.
   - Nút Lưu báo cáo và Khôi phục mẫu bị vô hiệu hóa.
   - Trình chiếu F5 và Xuất Word hoạt động bình thường.
3. Bấm "Mở khóa chỉnh sửa":
   - Hộp thoại cảnh báo xuất hiện.
   - Bấm Hủy: Vẫn bị khóa.
   - Bấm Đồng ý: Mở khóa thành công, cột Editor cho phép gõ phím, nút Lưu sáng lên.
   - Bấm "Khóa lại": Trở về trạng thái khóa an toàn.
4. Chuyển từ ngày cũ sang ngày khác: Kiểm tra không làm hỏng dữ liệu và ngày cũ không bị ghi đè ngầm.
5. Kiểm tra TypeScript build (`npm run build`) không có lỗi.
