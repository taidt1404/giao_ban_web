# Tài liệu Thiết kế: Mở Rộng Slide 2 — Bổ Sung PK 307, Viêm Gan B & Nút Thêm Phòng Khám / Chỉ Số Động

## 1. Mục tiêu
Nâng cấp **Slide 2 (I. TÌNH HÌNH NGƯỜI BỆNH NGOẠI TRÚ)** nhằm:
1. Thêm mặc định **PK 307** vào nhóm **PK Nội** (xếp giữa PK 210 và PK 308).
2. Thêm mặc định chỉ số **Viêm Gan B** vào danh sách **Chỉ số chung ngoại trú** (ngay sau COPD).
3. Hỗ trợ người dùng chủ động:
   - Thêm / sửa tên / xóa phòng khám trong **Nhóm PK Nội** và **Các chuyên khoa khác**.
   - Thêm / sửa tên / xóa chỉ số trong **Chỉ số chung ngoại trú**.
4. Chuyển đổi bảng hiển thị Slide 2 từ layout cố định (hardcoded) sang **cơ chế dựng hàng linh hoạt (Dynamic Row Mapping)**, tự động căn chỉnh tỷ lệ hàng, đảm bảo tính thẩm mỹ trên khung 16:9 và xuất Word (.docx) đồng bộ chuẩn xác.

---

## 2. Mô hình Dữ liệu (Data Model)

### File: `src/data/outpatientReport.ts`
```ts
export type ClinicItem = {
  id: string;
  name: string;
  total: number;
  admitted: number;
  isCustom?: boolean; // Đánh dấu phòng khám do người dùng tự thêm
};

export type CustomGeneralStatItem = {
  id: string;
  name: string;
  value: number;
};

export type OutpatientGeneralStats = {
  totalAndAdmitted: string; // VD: "203/19"
  insurance: number; // Bảo hiểm y tế
  service: number; // Dịch vụ
  onDemand: number; // Khám yêu cầu
  diabetes: number; // Đái tháo đường
  hypertension: number; // Tăng huyết áp
  copd: number; // COPD
  hepatitisB?: number; // MỚI: Viêm Gan B (mặc định 0)
  traditionalRehab: number; // Điều trị ngoại trú YHCT - PHCN
  transferred: number; // Chuyển viện
  customStats?: CustomGeneralStatItem[]; // MỚI: Chỉ số người dùng tự thêm
};

export type OutpatientReportData = {
  general: OutpatientGeneralStats;
  internalClinics: ClinicItem[];
  specialtyClinics: ClinicItem[];
};
```

### Thứ tự chuẩn phòng khám Nội trong `src/utils/dailyStorage.ts`
```ts
const standardOrder = [
  { id: 'pk201', name: 'PK 201' },
  { id: 'pk202', name: 'PK 202' },
  { id: 'pk204', name: 'PK 204' },
  { id: 'pk205', name: 'PK 205' },
  { id: 'pk210', name: 'PK 210' },
  { id: 'pk307', name: 'PK 307' }, // MỚI
  { id: 'pk308', name: 'PK 308' },
  { id: 'pk309', name: 'PK 309' },
];
```
Các phòng khám do người dùng thêm tự do (`isCustom: true` hoặc không thuộc `standardOrder`) sẽ được giữ nguyên ở cuối danh sách `internalClinics`.

---

## 3. Quy tắc Hiển thị Bảng Slide 2 (Dynamic Row Mapping)

### Bố cục 2 cột song song:
1. **Cột trái (Chỉ số chung ngoại trú)**:
   - Dòng 0: Tổng số / vào viện
   - Dòng 1: Bảo hiểm y tế
   - Dòng 2: Dịch vụ
   - Dòng 3: Khám yêu cầu
   - Dòng 4: Đái tháo đường
   - Dòng 5: Tăng huyết áp
   - Dòng 6: COPD
   - Dòng 7: Viêm Gan B
   - Dòng 8: Điều trị ngoại trú YHCT - PHCN
   - Dòng 9: Chuyển viện
   - Dòng 10..N: Các chỉ số tự thêm (`customStats`)
   - Các dòng còn lại phía dưới (nếu tổng số dòng bên phải nhiều hơn bên trái): Phủ bằng một ô trống liền khối màu xám nhạt (`cell-empty-block`) với `rowSpan = tổng_dòng - số_chỉ_số_trái`.

2. **Cột phải (Phòng khám ngoại trú)**:
   - **Nhóm PK Nội**:
     - Ô gộp `PK Nội` có `rowSpan = 1 + internalClinics.length`.
     - Dòng 0 của nhóm: Dòng "Tổng" (cộng dồn tự động tổng số, vào viện và tính tỷ lệ %).
     - Dòng 1 đến `N`: Từng phòng khám trong `internalClinics` (PK 201, 202, 204, 205, 210, 307, 308, 309...).
   - **Nhóm Các chuyên khoa khác**:
     - Nối tiếp ngay sau nhóm PK Nội, mỗi phòng khám 1 dòng (PK Ngoại, Sản, Nhi, TMH, Mắt, RHM, YHCT, Cấp cứu...).

3. **Tính thích ứng chiều cao**:
   - Tối ưu padding và font-size bằng CSS clamp để khi thêm từ 1–4 dòng mới, bảng vẫn nằm trọn vẹn trong tỷ lệ slide 16:9 mà không bị tràn màn hình hay xuất hiện thanh cuộn xấu.

---

## 4. Giao diện Nhập liệu (Editor Panel Slide 2)

1. **Phần 1: Chỉ số chung ngoại trú**:
   - Thêm nút `+ Thêm chỉ số` ở góc phải tiêu đề.
   - Thêm ô nhập số cho **Viêm Gan B**.
   - Nếu có chỉ số tự thêm: Hiển thị dạng danh sách có ô đổi tên chỉ số, ô nhập số lượng và nút icon thùng rác để xóa.

2. **Phần 2: Nhóm PK Nội**:
   - Thêm nút `+ Thêm phòng khám` ở góc phải tiêu đề.
   - Khi bấm, một phòng khám mới được thêm vào danh sách với tên mặc định (VD: `PK mới`), có thể đổi tên trực tiếp, nhập Tổng / Vào viện (tự tính % và cộng dồn vào Tổng PK Nội), kèm nút xóa.

3. **Phần 3: Các chuyên khoa khác**:
   - Thêm nút `+ Thêm chuyên khoa` để linh hoạt mở rộng trong tương lai nếu bệnh viện có thêm khoa mới (Ung bướu, Da liễu, v.v.).

---

## 5. Xuất Báo cáo Word (`src/utils/exportWord.ts`)

- Cập nhật hàm xuất Word để duyệt lặp động qua danh sách `internalClinics`, `specialtyClinics` và `general` (bao gồm Viêm Gan B và `customStats`).
- Cột `PK Nội` tự động tính `verticalMerge` theo số lượng phòng khám thực tế.
- Bảng Word xuất ra đồng bộ 100% với những gì hiển thị trên màn hình Slide 2.

---

## 6. Tính Tương Thích & An Toàn Dữ Liệu
- **Tương thích ngược (Backward Compatibility)**: Khi tải các ngày trực cũ trong `server-data/bundles/` hoặc `localStorage`, hàm `ensureOutpatientClinics` sẽ tự động bổ sung `PK 307` (giá trị 0), và nếu `hepatitisB` chưa tồn tại sẽ mặc định là `0`, không gây lỗi render hay vỡ dữ liệu.
- **Nhân bản ngày trực mới (Cloning)**: Hàm nhân bản ngày trực `cloneBundleForNewDate` sẽ giữ nguyên danh sách các phòng khám / chỉ số tùy biến và reset số liệu về `0` cho ca trực mới.
