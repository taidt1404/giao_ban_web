# Kế hoạch Triển khai: Slide 2 - Tình Hình Người Bệnh Ngoại Trú

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm Slide 2 (Tình hình người bệnh ngoại trú) với bảng số liệu tự động tính tỷ lệ %, chuyển đổi qua lại giữa 2 slide, form nhập liệu tương ứng và xuất ra file Word.

**Architecture:** Mở rộng mô hình dữ liệu đa slide trong `App.tsx`. Tạo component `Slide2Preview.tsx` hiển thị bảng 16:9 sắc nét, component `EditorPanel2.tsx` nhập liệu, và cập nhật `exportWord.ts` thêm bảng Ngoại trú vào file Word.

**Tech Stack:** React 19, TypeScript, Vite, `docx`, Lucide React.

---

### Task 1: Định nghĩa mô hình dữ liệu và dữ liệu mẫu Slide 2 (`src/data/outpatientReport.ts`)
- [ ] **Step 1:** Tạo file `src/data/outpatientReport.ts` với đầy đủ số liệu mặc định như hình mẫu (203/19, BHYT 194, PK Nội 201..309, PK Ngoại, Sản, Nhi, TMH, Mắt, RHM, YHCT, Cấp cứu).
- [ ] **Step 2:** Viết hàm tiện ích tính % `calculateRate(admitted, total)` tự động format dấu phẩy.

### Task 2: Tạo giao diện hiển thị Slide 2 (`src/components/Slide2Preview.tsx`)
- [ ] **Step 1:** Xây dựng component `Slide2Preview.tsx` tái hiện chính xác bảng màu xanh như trong ảnh mẫu:
  - Header xanh dương đậm, chữ trắng.
  - Cột trái: Chỉ số chung (Tổng số/vào viện, BHYT, Dịch vụ, Khám yêu cầu, ĐTĐ, THA, COPD, YHCT-PHCN, Chuyển viện).
  - Cột phải: Khối PK Nội (có dòng Tổng tự động cộng dồn, danh sách PK 201..309) và các chuyên khoa Ngoại, Sản, Nhi, TMH, Mắt, RHM, YHCT, Cấp cứu.
  - Cột Tổng % tự động tính.

### Task 3: Tạo bảng nhập liệu cho Slide 2 (`src/components/EditorPanel2.tsx`)
- [ ] **Step 1:** Xây dựng `EditorPanel2.tsx` cho phép nhập nhanh các chỉ số chung và từng phòng khám (Tổng số, Vào viện).
- [ ] **Step 2:** Hiển thị preview số % ngay bên cạnh ô nhập để người dùng tiện theo dõi.

### Task 4: Nâng cấp Sidebar, Điều hướng Slide và Trình chiếu trong `App.tsx` & `styles.css`
- [ ] **Step 1:** Thêm state `activeSlide: 1 | 2` trong `App.tsx`.
- [ ] **Step 2:** Kích hoạt nút Slide 2 trên sidebar (bỏ disabled, có thumbnail nhỏ của Slide 2).
- [ ] **Step 3:** Chuyển đổi hiển thị slide tương ứng (khi ở Slide 1 hiện SlidePreview, khi ở Slide 2 hiện Slide2Preview).
- [ ] **Step 4:** Chuyển đổi panel nhập liệu tương ứng.
- [ ] **Step 5:** Cập nhật CSS hiển thị bảng Slide 2 sắc nét, căn giữa, co giãn chuẩn tỷ lệ 16:9.

### Task 5: Cập nhật chức năng Xuất Word (`src/utils/exportWord.ts`)
- [ ] **Step 1:** Thêm bảng **II. TÌNH HÌNH NGƯỜI BỆNH NGOẠI TRÚ** vào tài liệu Word với định dạng bảng kẻ viền đầy đủ các cột và màu header xanh dương chuyên nghiệp.

### Task 6: Kiểm tra và Build (`npm run build`)
- [ ] **Step 1:** Chạy `npm run build` để xác nhận không có lỗi TypeScript/bundle.
- [ ] **Step 2:** Kiểm tra thao tác chuyển slide, tự động tính %, và tải file Word.
