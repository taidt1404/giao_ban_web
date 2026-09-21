# Kế hoạch triển khai: Khóa bảo vệ và Cảnh báo chỉnh sửa báo cáo ngày cũ

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ngăn chặn việc sửa nhầm và tự động ghi đè dữ liệu báo cáo của các ngày trong quá khứ thông qua chế độ Chỉ đọc (Read-only) mặc định, thanh cảnh báo và nút mở khóa chủ động.

**Architecture:** Tạo component `PastDateWarningBanner` quản lý giao diện cảnh báo và kích hoạt modal/hộp thoại mở khóa. Trong `App.tsx`, quản lý trạng thái `isDateLocked` dựa trên việc so sánh `currentDate < todayStr`. Khi `isDateLocked = true`, vô hiệu hóa panel soạn thảo, tắt các nút lưu/khôi phục mẫu, và ngăn chặn việc tự động lưu đè khi chuyển ngày.

**Tech Stack:** React 19, TypeScript, Lucide React icons, CSS Vanilla.

## Global Constraints
- Tuân thủ cấu trúc lưu trữ hiện tại (`dailyStorage.ts` và `lan-server.js`).
- Không phá vỡ chức năng Trình chiếu (F5), Xuất Word, In/PDF trên các ngày cũ.
- TypeScript build (`npm run build`) phải hoàn thành không có lỗi (`tsc -b && vite build`).

---

### Task 1: Tạo component `PastDateWarningBanner.tsx`

**Files:**
- Create: `src/components/PastDateWarningBanner.tsx`

**Interfaces:**
- Consumes:
  ```typescript
  type PastDateWarningBannerProps = {
    currentDate: string;
    isLocked: boolean;
    onUnlock: () => void;
    onLock: () => void;
  };
  ```
- Produces: `PastDateWarningBanner` component hiển thị cảnh báo màu vàng khi `isLocked === true` (với nút "Mở khóa chỉnh sửa") và màu cam khi `isLocked === false` (với nút "Khóa lại").

- [ ] **Step 1: Tạo file `src/components/PastDateWarningBanner.tsx`**
Viết mã component `PastDateWarningBanner` với các icon `Lock`, `Unlock`, `AlertTriangle` từ `lucide-react`, hiển thị định dạng ngày `formatDisplayDate(currentDate)`. Khi click "Mở khóa chỉnh sửa", gọi xác nhận trước khi thực thi `onUnlock()`.

---

### Task 2: Thêm định kiểu CSS cho Banner cảnh báo và trạng thái Khóa

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Thêm CSS cho `.past-date-banner`, `.right-panel.is-locked`, và huy hiệu khóa**
Định nghĩa class `.past-date-banner` với 2 biến thể `.banner-locked` (vàng/amber) và `.banner-unlocked` (cam/đỏ).
Thêm class `.right-panel.is-locked` với `pointer-events: none`, `opacity: 0.65`, và hiển thị thông báo khóa ở đầu panel.

---

### Task 3: Tích hợp logic Khóa và Banner vào `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Quản lý state `isDateLocked`**
- Xác định ngày cũ: `const isPastDate = currentDate < getTodayString();`
- Khởi tạo state: `const [isDateLocked, setIsDateLocked] = useState<boolean>(() => initialBundle.date < getTodayString());`
- Cập nhật trong `handleSelectDate`: Khi đổi ngày, nếu ngày cũ đang bị khóa (`isDateLocked`), bỏ qua `saveDailyBundle(currentBundle)`. Khi nạp ngày mới `newDateStr`, đặt `setIsDateLocked(newDateStr < getTodayString())`.

- [ ] **Step 2: Bảo vệ các nút chức năng và khu vực nhập liệu**
- Trong Topbar: disable nút "Lưu báo cáo" và "Khôi phục mẫu" khi `isDateLocked`.
- Render `<PastDateWarningBanner />` ngay dưới `<header className="topbar">` khi `isPastDate`.
- Thêm class `is-locked` vào `<aside className="right-panel">` khi `isDateLocked`.
- Tắt quyền `onChange` trực tiếp trên canvas (Slide 4, SOAP, Case Table) khi `isDateLocked`.

---

### Task 4: Kiểm tra và hoàn thiện

**Files:**
- Build check: `npm run build`

- [ ] **Step 1: Chạy `npm run build` kiểm tra typecheck và bundle**
- [ ] **Step 2: Xác minh hành vi giao diện**
