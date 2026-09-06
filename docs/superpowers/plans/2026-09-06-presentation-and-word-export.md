# Chế độ Trình chiếu và Xuất Báo cáo Word Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm chế độ trình chiếu toàn màn hình (Presentation/Fullscreen) và chức năng tải file Word (.docx) khổ A4 dọc chuẩn hành chính cho ứng dụng báo cáo giao ban web.

**Architecture:** Sử dụng Fullscreen API của trình duyệt kết hợp CSS fullscreen layout cho chế độ trình chiếu. Tạo module tiện ích `exportWord.ts` sử dụng thư viện `docx` để sinh tài liệu Word `.docx` tương thích Office hoàn toàn phía client.

**Tech Stack:** React 19, TypeScript, Vite, `docx` (npm package), Lucide React.

## Global Constraints
- Khổ giấy Word: A4 dọc, font Times New Roman, định dạng văn bản chuẩn hành chính y tế.
- Chế độ trình chiếu: Hỗ trợ F5 / Fullscreen button, phím Esc để thoát, tự động fit khung 16:9 căn giữa màn hình.
- 100% Client-side, không yêu cầu server backend.

---

### Task 1: Cài đặt thư viện `docx`

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: Thư viện `docx` sẵn sàng để import `Document`, `Paragraph`, `TextRun`, `Table`, `TableRow`, `TableCell`, `Packer`, v.v.

- [ ] **Step 1: Cài đặt gói `docx`**
Chạy: `npm install docx`

- [ ] **Step 2: Kiểm tra `package.json`**
Xác nhận `docx` đã xuất hiện trong danh sách dependencies.

---

### Task 2: Xây dựng module tiện ích xuất file Word (`src/utils/exportWord.ts`)

**Files:**
- Create: `src/utils/exportWord.ts`

**Interfaces:**
- Consumes: `ReportData` từ `src/data/defaultReport.ts`
- Produces: `export async function downloadGiaoBanWord(report: ReportData): Promise<void>`

- [ ] **Step 1: Tạo file `src/utils/exportWord.ts` với đầy đủ cấu trúc văn bản A4 dọc**
  - Header: 2 cột (Cột trái: Đơn vị Bệnh viện Hùng Cường, Cột phải: Quốc hiệu Tiêu ngữ)
  - Tiêu đề: BÁO CÁO GIAO BAN NGÀY ... THÁNG ... NĂM ...
  - Thành phần trực: Bác sĩ trực, Điều dưỡng trực, Dược, X-Quang, Xét nghiệm, Hành chính
  - Chân trang: Người báo cáo / Lãnh đạo trực bệnh viện
  - Tải file về máy với tên `Bao-cao-giao-ban-YYYY-MM-DD.docx`.

- [ ] **Step 2: Kiểm tra biên dịch TypeScript**
Chạy: `npx tsc --noEmit`
Xác nhận không có lỗi kiểu dữ liệu.

---

### Task 3: Thêm Chế độ Trình chiếu & Nút Tải Word vào UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `downloadGiaoBanWord` từ `src/utils/exportWord.ts`
- Produces: UI hỗ trợ nút "Trình chiếu" (F5), nút "Tải Word", nút "Ẩn/Hiện Panel", và giao diện Fullscreen chuyên nghiệp.

- [ ] **Step 1: Cập nhật `src/styles.css`**
  - Thêm CSS cho `.presentation-mode` (toàn màn hình nền tối, ẩn topbar và sidebar, slide scale căn giữa).
  - Thêm CSS cho nút nổi thoát trình chiếu `.exit-fullscreen-button`.
  - Thêm CSS cho nút thu gọn panel `.panel-toggle-button` và trạng thái `.editor-collapsed`.

- [ ] **Step 2: Cập nhật `src/App.tsx`**
  - Thêm state `isFullscreen` và `isEditorCollapsed`.
  - Thêm lắng nghe sự kiện `fullscreenchange` và phím tắt `F5` / `Esc`.
  - Thêm nút "Trình chiếu" (Icon `Maximize`) và nút "Tải Word" (Icon `Download`) trên toolbar và header.
  - Gắn sự kiện `handleExportWord` gọi `downloadGiaoBanWord(report)`.

---

### Task 4: Kiểm tra và hoàn tất (Verification)

**Files:**
- Verify: Toàn bộ mã nguồn

- [ ] **Step 1: Chạy `npm run build`**
Chạy: `npm run build`
Kỳ vọng: Build thành công không có lỗi TypeScript hay Vite bundler.

- [ ] **Step 2: Kiểm tra thực tế tính năng**
  - Kiểm tra nút "Trình chiếu" hoạt động toàn màn hình.
  - Kiểm tra bấm Esc hoặc nút thoát quay lại bình thường.
  - Kiểm tra nút "Tải Word" tạo và tải file `.docx` đúng chuẩn.
