# Giao ban web – màn hình 1

Đây là bản prototype đầu tiên cho màn hình 1 của hệ thống báo cáo giao ban.

## Chức năng hiện có

- Giao diện dạng trình biên tập slide, tỷ lệ 16:9.
- Slide 1 mô phỏng mẫu PowerPoint bạn cung cấp.
- Nhập ngày giao ban.
- Nhập/sửa danh sách bác sĩ, điều dưỡng, xét nghiệm.
- Nhập Dược, XQuang, Hành chính.
- Preview cập nhật ngay khi gõ.
- Lưu tạm bằng `localStorage` trên trình duyệt.
- Nút In / PDF dùng chức năng Print của trình duyệt.
- Chưa có backend, PostgreSQL, đăng nhập, file storage hay 31 slide còn lại.

## Chạy project

Yêu cầu Node.js 20+.

```bash
npm install
npm run dev
```

Sau đó mở URL Vite hiển thị trong terminal.

## Build production

```bash
npm run build
npm run preview
```

## Bước tiếp theo

Khi màn hình 1 được duyệt về bố cục, có thể tách phần dữ liệu thành model/report schema, rồi mới thêm backend + PostgreSQL và các slide tiếp theo.
