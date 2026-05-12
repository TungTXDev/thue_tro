# Hệ thống Thuê Phòng & Căn Hộ ✨ Cho Sinh Viên Mới

Một dự án frontend website mô phỏng nền tảng tìm kiếm và thuê phòng trọ, căn hộ dịch vụ dành cho sinh viên. Dự án hướng tới trải nghiệm người dùng hiện đại, rõ ràng, dễ sử dụng, đồng thời cung cấp tính năng quản lý cơ bản cho chủ nhà (admin).

## 🚀 Công Nghệ Sử Dụng
- **HTML5** (Semantics layout)
- **CSS3** (Flexbox, Grid, Custom Properties, không dùng thư viện ngoài)
- **JavaScript thuần** (Vanilla JS, thao tác DOM, Events)
- **Cơ sở dữ liệu**: Trình duyệt `localStorage` (lưu trữ không cần backend)

## 📂 Cấu Trúc Thư Mục

Dự án được chia thành các module rõ ràng nhằm dễ dàng bảo trì và mở rộng:

```text
frontend/
│
├── index.html       # Trang chủ: Danh sách phòng, tìm kiếm, đăng ký/đăng nhập
├── detail.html      # Trang chi tiết phòng: Thông tin, đánh giá, đặt phòng
├── admin.html       # Trang quản trị: Doanh thu, đơn hàng, mã giảm giá
│
├── css/             # Thư mục chứa các file giao diện
│   ├── base.css           # Cài đặt màu sắc, font chữ chung
│   ├── layout.css         # Bố cục Header, Footer, Container chính
│   ├── components.css     # Style các nút bấm, thẻ phòng, form nhập
│   ├── index.css          # Style riêng cho Trang chủ
│   ├── detail.css         # Style riêng cho Trang chi tiết
│   └── admin.css          # Style riêng cho Trang quản trị
│
└── js/              # Thư mục chứa các module xử lý logic
    ├── core/              # Các hàm lõi tiện ích chung
    │   ├── storage.js     # Chuyên xử lý lưu/đọc dữ liệu localStorage
    │   └── utils.js       # Các hàm tiện ích (format tiền, escapeHTML, lấy param...)
    │
    ├── data/              # Quản lý dữ liệu mẫu
    │   └── rooms.js       # Sinh dữ liệu phòng trọ ban đầu nếu chưa có
    │
    ├── features/          # Chứa các chức năng của ứng dụng
    │   ├── auth.js        # Đăng ký, đăng nhập, phân quyền, cập nhật header
    │   ├── chat.js        # Khung chat trợ lý AI mô phỏng
    │   ├── rooms.js       # Logic hiển thị và lọc/tìm kiếm danh sách phòng
    │   ├── booking.js     # Đặt phòng, modal thanh toán
    │   ├── reviews.js     # Hiển thị và thêm đánh giá phòng
    │   └── coupons.js     # Xử lý nhập/tạo mã giảm giá
    │
    └── pages/             # Logic khởi tạo riêng cho từng trang HTML
        ├── index.js
        ├── detail.js
        └── admin.js
```

## 🛠 Cách Chạy Project

1. **Khuyến nghị**: Sử dụng Extension **Live Server** trong VS Code.
2. Mở thư mục `frontend/` trong VS Code.
3. Chuột phải vào file `index.html` và chọn **Open with Live Server**.
4. Website sẽ tự động mở trên trình duyệt tại `http://127.0.0.1:5500`.

## 🔑 Tài Khoản Admin Demo & Hướng Dẫn Test

### 1. Dành cho Frontend Demo (Trang Web)
Hệ thống có một trang `admin.html` dành riêng cho quản lý. Tuy nhiên, không phải ai cũng có thể truy cập được. 
- **Cách vào Admin**: Bạn cần đăng ký hoặc đăng nhập một tài khoản có Tên chứa chữ **"Vũ"** hoặc Email là **"Vu69@gmail.com"**. Sau khi đăng nhập, trên thanh menu sẽ xuất hiện nút **"Quản lý"** để vào trang Admin.
- **Cách tạo Coupon**: Vào trang Admin -> Tìm mục "Tạo Mã Giảm Giá Mới" -> Nhập mã (VD: VIP99) và số tiền giảm -> Nhấn Thêm.
- **Cách đặt phòng**: Đăng nhập (tài khoản bất kỳ) -> Xem chi tiết một phòng ở Trang chủ -> Nhấn "🚀 ĐẶT PHÒNG NGAY" -> Chọn phương thức thanh toán và nhập mã Coupon (nếu có) -> Xác nhận. Sau đó, vào Admin (bằng tài khoản Vũ) để xem đơn hàng vừa đặt.

### 2. Dành cho Backend API (Postman / Thunder Client)
Khi kiểm thử các API yêu cầu quyền Admin (như `GET /api/users`), hãy sử dụng tài khoản demo sau để đăng nhập lấy Token:
- **Email**: `Vu69@gmail.com`
- **Password**: `admin123`
- **Role**: `admin`
*(Lưu ý: Tài khoản này được tạo tự động khi chạy lệnh `npm run seed` và chỉ dùng cho mục đích demo)*

## ⭐ Các Chức Năng Chính
- **Xem danh sách phòng**: Dữ liệu phòng ngẫu nhiên được sinh ra ở lần đầu chạy.
- **Tìm kiếm/Lọc phòng**: Lọc theo khu vực, giá, hoặc loại phòng.
- **Đăng ký/Đăng nhập**: Xử lý logic phía client (không cần load lại trang).
- **Chat AI mô phỏng**: Khung chat hỗ trợ tự động trả lời.
- **Xem chi tiết phòng**: Hiển thị hình ảnh, giá thuê, tiện ích.
- **Đặt phòng**: Chọn phương thức thanh toán Tiền mặt hoặc Quét QR Code giữ chỗ.
- **Coupon**: Áp dụng mã giảm giá khi đặt phòng.
- **Review**: Cho phép người dùng viết đánh giá (lưu cho từng phòng).
- **Admin Dashboard**: Thống kê doanh thu, xem danh sách đơn đặt phòng, tạo mã giảm giá mới và làm sạch lịch sử.

## ⚠️ Lưu Ý Quan Trọng
- Dự án này là **Frontend Demo**, phục vụ mục đích học tập và trình diễn khả năng tổ chức mã (HTML/CSS/JS).
- Mọi dữ liệu (tài khoản, đánh giá, danh sách phòng, hóa đơn) đều được lưu tại **localStorage** của trình duyệt. 
- **Cách Reset Dữ Liệu**: Nhấn `F12` (Mở DevTools) -> Chọn tab `Application` -> Chọn `Local Storage` -> Chuột phải vào tên miền và chọn `Clear`. Tải lại trang (`F5`) để khôi phục dữ liệu phòng mẫu ban đầu.
- Chưa có backend (server) hay database thực sự.
- Bảo mật trang admin hiện chỉ là demo trên client-side (chuyển hướng người dùng nếu không đủ quyền).

## 🌱 Hướng Phát Triển Tương Lai
- 🔗 **Thêm Backend**: Chuyển đổi logic sang Node.js (Express) hoặc Python.
- 🗄️ **Thêm Database**: Sử dụng MongoDB hoặc MySQL thay cho localStorage.
- 🔐 **Bảo mật**: Triển khai JWT (JSON Web Tokens) cho đăng nhập và phân quyền thật.
- 👨‍💼 **Chức năng chủ nhà**: Cho phép nhiều chủ trọ khác nhau đăng tin và quản lý phòng của riêng họ.
- 💳 **Thanh toán thật**: Tích hợp các cổng thanh toán như VNPay, Momo.
