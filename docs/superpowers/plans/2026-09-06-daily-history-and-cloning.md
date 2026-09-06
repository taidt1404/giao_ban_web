# Kế hoạch Triển khai Tính năng Quản lý Báo cáo Theo Ngày & Kế thừa Dữ liệu

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hệ thống quản lý báo cáo giao ban độc lập theo từng ngày trực (`YYYY-MM-DD`), có thanh chọn ngày trên Topbar, kế thừa thông minh khi sao chép ngày cũ sang ngày mới (chuyển "Hiện có" thành "Cũ"), và sao lưu/phục hồi file JSON.

**Architecture:**
- Tạo module `src/utils/dailyStorage.ts` đóng gói mô hình `DailyGiaoBanBundle`, quản lý danh mục ngày `giao-ban-dates-index-v1`, auto-migration dữ liệu hiện tại, smart clone kế thừa số liệu nội trú, và import/export JSON.
- Tạo component `DateSelectorBar.tsx` gắn vào thanh `topbar` trong `src/App.tsx`.
- Tạo component modal `UninitializedDateModal.tsx` để hỏi người dùng khi chuyển tới một ngày chưa có báo cáo.
- Tích hợp cập nhật state và lưu trữ đồng bộ trong `src/App.tsx`.

**Tech Stack:** React 19, TypeScript, Vite, Lucide Icons, LocalStorage API, docx.

## Global Constraints
- Không làm mất mát bất kỳ dữ liệu nào người dùng đã nhập từ trước tới nay (tự động gom vào ngày hôm nay).
- Mọi font chữ của UI mới phải dùng `"Times New Roman", Times, serif`.
- Tuân thủ cấu trúc A4 dọc khi xuất Word cho ngày được chọn.

---

### Task 1: Tạo Module `src/utils/dailyStorage.ts`

**Files:**
- Create: `src/utils/dailyStorage.ts`

**Interfaces:**
- Produces:
  - `export type DailyGiaoBanBundle`
  - `export function getTodayString(): string`
  - `export function getSavedDateList(): string[]`
  - `export function loadDailyBundle(dateStr: string): { bundle: DailyGiaoBanBundle; isNewlyCreated: boolean }`
  - `export function saveDailyBundle(bundle: DailyGiaoBanBundle): void`
  - `export function cloneBundleToDate(sourceBundle: DailyGiaoBanBundle, targetDateStr: string): DailyGiaoBanBundle`
  - `export function exportAllDataAsJson(): string`
  - `export function importAllDataFromJson(jsonStr: string): { success: boolean; importedCount: number; latestDate?: string }`

- [ ] **Step 1: Viết mã nguồn cho `src/utils/dailyStorage.ts`**
  - Định nghĩa đầy đủ interface `DailyGiaoBanBundle` tập hợp tất cả dữ liệu của 9 slide.
  - Xây dựng logic Auto-migration: nếu chưa có bundle của ngày hôm nay, tự động đọc từ các key `giao-ban-slide-1-v1`, `giao-ban-slide-2-v1`... gom lại thành bundle ban đầu.
  - Xây dựng logic `cloneBundleToDate`:
    - Đổi ngày `reportDate` trong Slide 1 sang `targetDateStr`.
    - Với Slide 4 (Nội trú): Lấy `currentPatients` (Hiện có) của ngày cũ gán vào `oldPatients` (Cũ) của ngày mới; reset `admitted`, `discharged`, `transferred`, `deceased` về `0`.
    - Giữ nguyên cấu trúc phòng khám, danh sách khoa theo dõi và ca bệnh.
  - Xây dựng logic export/import JSON file để sao lưu.

- [ ] **Step 2: Kiểm tra biên dịch TypeScript**
  - Chạy `npx tsc --noEmit` để đảm bảo kiểu dữ liệu chuẩn xác 100%.

- [ ] **Step 3: Commit**
  - `git add src/utils/dailyStorage.ts && git commit -m "feat: dailyStorage module with bundle, smart clone and auto-migration"`

---

### Task 2: Tạo Component `DateSelectorBar.tsx`

**Files:**
- Create: `src/components/DateSelectorBar.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `getTodayString`, `getSavedDateList` từ `dailyStorage.ts`.
- Props:
  ```ts
  type DateSelectorBarProps = {
    currentDate: string;
    savedDates: string[];
    onSelectDate: (date: string) => void;
    onExportBackup: () => void;
    onImportBackup: (file: File) => void;
    onCloneToDate: () => void;
  };
  ```

- [ ] **Step 1: Viết component `DateSelectorBar.tsx`**
  - Render nút `[◀]` lùi 1 ngày, nút `[▶]` tiến 1 ngày, nút `[Hôm nay]`.
  - Render ô `<input type="date" value={currentDate} />` màu sắc hài hòa với topbar.
  - Hiển thị chấm tròn xanh nếu ngày đang chọn đã có dữ liệu lưu trữ.
  - Nút menu thao tác: Sao lưu file JSON, Mở file sao lưu, Sao chép ngày này.

- [ ] **Step 2: Thêm style CSS cho `DateSelectorBar` trong `src/styles.css`**
  - Dùng font `Times New Roman`, màu sắc xanh tím than tương thích thanh topbar.

- [ ] **Step 3: Commit**
  - `git add src/components/DateSelectorBar.tsx src/styles.css && git commit -m "feat: DateSelectorBar component on topbar"`

---

### Task 3: Tạo Modal `UninitializedDateModal.tsx`

**Files:**
- Create: `src/components/UninitializedDateModal.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Props:
  ```ts
  type Props = {
    targetDate: string;
    closestDate?: string;
    onConfirmClone: (sourceDate: string) => void;
    onConfirmDefault: () => void;
    onCancel: () => void;
  };
  ```

- [ ] **Step 1: Xây dựng modal `UninitializedDateModal.tsx`**
  - Xuất hiện khi người dùng chuyển sang ngày chưa từng có báo cáo.
  - Nút 1: "📋 Sao chép kế thừa từ ngày [closestDate]" (giải thích rõ: tự động chuyển BN hiện có sang BN cũ).
  - Nút 2: "✨ Bắt đầu bằng mẫu trắng mặc định".
  - Nút 3: "Hủy bỏ" (quay lại ngày trước đó).

- [ ] **Step 2: Thêm style CSS cho Modal trong `src/styles.css`**

- [ ] **Step 3: Commit**
  - `git add src/components/UninitializedDateModal.tsx src/styles.css && git commit -m "feat: UninitializedDateModal for choosing initialization strategy"`

---

### Task 4: Tích hợp vào `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Tái cấu trúc state trong `App.tsx`**
  - Thêm state `currentDate`, `savedDates`, `uninitializedTargetDate`.
  - Thay vì lưu các key rời rạc, hàm `handleSave` gọi `saveDailyBundle(...)`.
  - Hàm `handleSelectDate(newDate)`:
    - Nếu ngày mới đã có dữ liệu: tải bundle và gán vào các state slide tương ứng.
    - Nếu ngày mới chưa có dữ liệu: mở `UninitializedDateModal`.
  - Xử lý các sự kiện `onConfirmClone`, `onConfirmDefault`, `onExportBackup`, `onImportBackup`.
  - Đảm bảo `handleExportWord` xuất đúng số liệu của ngày `currentDate` đang chọn.

- [ ] **Step 2: Kiểm tra biên dịch Vite & TypeScript**
  - Chạy `npm run build` để xác nhận không có bất kỳ lỗi nào.

- [ ] **Step 3: Commit**
  - `git add src/App.tsx && git commit -m "feat: integrate daily history and smart clone into App.tsx"`

---

### Task 5: Kiểm thử và Hoàn thiện

- [ ] **Step 1: Kiểm thử Auto-migration**
  - Tải lại trang web ➔ dữ liệu trước đó vẫn nguyên vẹn ở ngày hôm nay.
- [ ] **Step 2: Kiểm thử Chuyển ngày & Sửa ngày cũ**
  - Chọn ngày lùi 2 ngày ➔ sửa thông tin kíp trực ➔ bấm Lưu.
  - Chuyển về ngày hôm nay ➔ thông tin ngày hôm nay không bị ảnh hưởng.
  - Chuyển lại ngày cũ ➔ thông tin đã sửa vẫn còn nguyên.
- [ ] **Step 3: Kiểm thử Kế thừa Nội trú khi Clone**
  - Tạo ngày mới từ ngày có sẵn ➔ kiểm tra cột "Cũ" ở Slide 4 bằng đúng cột "Hiện có" của ngày trước.
- [ ] **Step 4: Kiểm thử Sao lưu & Phục hồi JSON**
  - Bấm tải file backup `.json`. Thử nghiệm nhập lại file.
- [ ] **Step 5: Đẩy toàn bộ lên GitHub**
  - `git push origin main`
