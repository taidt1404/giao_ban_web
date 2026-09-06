# Tài liệu Thiết kế: Chế độ Trình chiếu và Xuất Báo cáo Word

## 1. Tổng quan
Hệ thống báo cáo giao ban web hiện tại hỗ trợ nhập liệu và xem trước Slide 1 (Thông tin kíp trực). Tài liệu này thiết kế 2 tính năng mới:
1. **Chế độ trình chiếu (Presentation / Fullscreen Mode)**: Cho phép ẩn bảng nhập liệu và sidebar để phóng to toàn màn hình slide 16:9 phục vụ trình chiếu giao ban qua máy chiếu/màn hình lớn.
2. **Xuất file Word (.docx) khổ A4 dọc**: Xuất nội dung báo cáo giao ban thành file Microsoft Word chuẩn văn bản hành chính Việt Nam để lưu trữ và in ấn.

---

## 2. Chi tiết tính năng

### 2.1. Chế độ Trình chiếu (Presentation Mode)
- **Kích hoạt**:
  - Nút bấm **"Trình chiếu"** trên thanh công cụ Canvas toolbar và Topbar (icon `Maximize` hoặc `Play`).
  - Phím tắt: Bấm **F5** khi đang ở ứng dụng để vào chế độ trình chiếu.
- **Trạng thái khi trình chiếu**:
  - Kích hoạt trình duyệt sang Fullscreen qua `document.documentElement.requestFullscreen()`.
  - Ẩn hoàn toàn Topbar, thanh chọn slide bên trái (`slide-sidebar`), và panel nhập liệu bên phải (`right-panel`).
  - Slide preview được căn giữa màn hình với kích thước tối ưu theo tỷ lệ 16:9 (`transform: scale(...)` hoặc `max-width: 95vw; max-height: 95vh`).
  - Nền chuyển sang màu đen/tối chuyên nghiệp chuẩn phòng họp.
- **Thoát trình chiếu**:
  - Nhấn phím **Esc** (hoặc `F11` tùy trình duyệt).
  - Hoặc click nút nổi mờ **"Thoát trình chiếu (Esc)"** ở góc trên bên phải màn hình.
- **Tính năng phụ - Ẩn/Hiện Panel nhập liệu (Toggle Editor)**:
  - Bổ sung nút thu gọn/mở rộng panel bên phải để tiện làm việc khi không muốn vào chế độ toàn màn hình.

### 2.2. Chức năng Xuất file Word (.docx)
- **Thư viện sử dụng**:
  - `docx`: Tạo tài liệu Word chuẩn Office Open XML trực tiếp trên trình duyệt.
- **Bố cục văn bản A4 dọc (Portrait)**:
  - **Khổ giấy & Căn lề**: A4 (210mm x 297mm), Margins: Trên 2cm, Dưới 2cm, Trái 2.5cm, Phải 1.5cm (theo Nghị định 30/2020/NĐ-CP về thể thức văn bản hành chính).
  - **Phông chữ**: Times New Roman, cỡ chữ chuẩn 13pt - 14pt, giãn dòng 1.2 - 1.3 lines.
  - **Header hai bên (Table 1 hàng, 2 cột không viền)**:
    - Cột trái: CÔNG TY CP BỆNH VIỆN HÙNG CƯỜNG / **BỆNH VIỆN ĐA KHOA HÙNG CƯỜNG**
    - Cột phải: **CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM** / **Độc lập - Tự do - Hạnh phúc**
  - **Tiêu đề chính**:
    - **BÁO CÁO GIAO BAN** (In hoa, đậm, căn giữa, cỡ 15pt)
    - *Ngày ... tháng ... năm ...* (In nghiêng, căn giữa, cỡ 13pt)
  - **Nội dung thành phần kíp trực**:
    - **Bác sĩ trực**: Phong – Đức – Hợi – Nga – Khiêm
    - **Điều dưỡng trực**: Phương C – Trang C – Nga (Nội) – ...
    - **Dược**: Phương Anh
    - **Chẩn đoán hình ảnh (X-Quang)**: Mạnh
    - **Xét nghiệm**: Đức – Sơn
    - **Hành chính**: Long
  - **Phần chân trang / Ký nhận (Table 1 hàng, 2 cột không viền)**:
    - Cột trái: **NGƯỜI BÁO CÁO** *(Ký, ghi rõ họ tên)*
    - Cột phải: **LÃNH ĐẠO TRỰC BỆNH VIỆN** *(Ký, ghi rõ họ tên)*
- **Tên file tải về**: `Bao-cao-giao-ban-YYYY-MM-DD.docx`.

---

## 3. Kiến trúc kỹ thuật và Tương thích
1. **Quản lý trạng thái Trình chiếu**:
   - Thêm state `isFullscreen` trong `App.tsx`.
   - Lắng nghe sự kiện `fullscreenchange` từ `document` để đồng bộ khi người dùng ấn Esc từ bàn phím.
2. **Module xuất Word**:
   - Tạo file tiện ích mới: `src/utils/exportWord.ts`.
   - Nhận vào `ReportData` và sinh `Blob` file `.docx`, sau đó tải xuống thông qua URL tạm thời (`URL.createObjectURL(blob)`).
3. **Hiệu chỉnh CSS**:
   - Thêm class `.fullscreen-mode` cho layout toàn màn hình.
   - Thêm CSS cho nút toggle panel và nút thoát trình chiếu.
