# Kế hoạch Triển khai: Mở Rộng Slide 2 Ngoại Trú (PK 307, Viêm Gan B, Thêm Động PK & Chỉ Số)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bổ sung mặc định PK 307 và Viêm Gan B vào Slide 2, đồng thời trang bị nút "+ Thêm" cho Chỉ số chung ngoại trú, Nhóm PK Nội và Các chuyên khoa khác, tự động căn chỉnh bảng 16:9 và đồng bộ xuất Word.

**Architecture:** Mở rộng mô hình dữ liệu `OutpatientReportData` hỗ trợ các phòng khám và chỉ số tùy biến; chuyển đổi `Slide2Preview.tsx` sang cơ chế dynamic row pairing thay vì các dòng cứng (hardcoded); cập nhật `EditorPanel2.tsx` với các nút thêm/xóa linh hoạt; đồng bộ xuất Word trong `exportWord.ts`.

**Tech Stack:** React 19, TypeScript, Vite, docx (Word export), CSS Modules/Vanilla CSS.

## Global Constraints

- Tuân thủ thứ tự phòng khám chuẩn trong `ensureOutpatientClinics`: PK 201 -> 202 -> 204 -> 205 -> 210 -> 307 -> 308 -> 309.
- Đảm bảo tương thích ngược 100% với các bundle ngày trực đã lưu trong `localStorage` và `server-data/bundles/`.
- Không làm vỡ layout 16:9 của Slide 2 (sử dụng CSS clamp và auto cell-empty-block).
- Kiểm tra typecheck thành công với `npm run build`.

---

### Task 1: Cập nhật Data Model và Logic Lưu trữ
**Files:**
- Modify: `src/data/outpatientReport.ts`
- Modify: `src/utils/dailyStorage.ts`

- [x] **Step 1: Mở rộng types trong `src/data/outpatientReport.ts`**
- [x] **Step 2: Cập nhật `ensureOutpatientClinics` & `cloneBundleForNewDate` trong `src/utils/dailyStorage.ts`**
- [x] **Step 3: Chạy typecheck kiểm tra Task 1**

---

### Task 2: Cập nhật Giao diện Slide 2 Preview với Dynamic Rows
**Files:**
- Modify: `src/components/Slide2Preview.tsx`
- Modify: `src/styles.css`

- [x] **Step 1: Tái cấu trúc logic dựng hàng trong `src/components/Slide2Preview.tsx`**
- [x] **Step 2: Tối ưu CSS trong `src/styles.css`**

---

### Task 3: Cập nhật Giao diện Nhập liệu Editor Panel 2
**Files:**
- Modify: `src/components/EditorPanel2.tsx`
- Modify: `src/styles.css`

- [x] **Step 1: Cập nhật Phần 1 (Chỉ số chung ngoại trú)**
- [x] **Step 2: Cập nhật Phần 2 (Nhóm PK Nội)**
- [x] **Step 3: Cập nhật Phần 3 (Các chuyên khoa khác)**
- [x] **Step 4: Thêm CSS cho các nút thêm/xóa trong `src/styles.css`**

---

### Task 4: Đồng bộ Xuất Báo cáo Word
**Files:**
- Modify: `src/utils/exportWord.ts`

- [x] **Step 1: Cập nhật hàm xuất Word cho Slide 2**

---

### Task 5: Kiểm tra và Xác thực Hoàn tất
- [x] **Step 1: Chạy build typecheck toàn diện**
- [x] **Step 2: Xác thực giao diện và chức năng**
