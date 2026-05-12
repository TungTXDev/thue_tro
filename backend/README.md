# Backend API - Hệ thống Thuê Phòng Sinh Viên

Đây là mã nguồn Backend cho hệ thống Thuê Phòng Sinh Viên, cung cấp các API RESTful phục vụ cho ứng dụng giao diện người dùng. Dự án được thiết kế chuẩn mực theo mô hình MVC, thân thiện với người mới học backend.

## 🚀 Công Nghệ Sử Dụng
- **Node.js & Express.js:** Framework xây dựng API.
- **TypeScript:** Ngôn ngữ lập trình chính, giúp code an toàn và dễ bảo trì.
- **MongoDB & Mongoose:** Cơ sở dữ liệu NoSQL linh hoạt.
- **Bcrypt:** Mã hóa mật khẩu người dùng.
- **JSON Web Token (JWT):** Quản lý phiên đăng nhập và phân quyền.

## 📂 Cấu Trúc Thư Mục
```text
backend/
├── src/
│   ├── config/        # Kết nối Database và biến môi trường
│   ├── controllers/   # Xử lý logic từng endpoint (Auth, Room, User, Order...)
│   ├── middlewares/   # Các hàm trung gian (requireAuth, requireAdmin...)
│   ├── models/        # Định nghĩa cấu trúc dữ liệu (Mongoose Schema)
│   ├── routes/        # Định tuyến các API endpoints
│   ├── types/         # Khai báo các type mở rộng cho TypeScript
│   ├── utils/         # Hàm hỗ trợ (Format response, Seed data...)
│   ├── app.ts         # Khởi tạo và cấu hình Express app
│   └── server.ts      # Điểm bắt đầu (Entry point), chạy server
├── package.json       # Quản lý thư viện
└── tsconfig.json      # Cấu hình TypeScript
```

## 🛠 Hướng Dẫn Cài Đặt & Chạy Server

### 1. Cài Đặt
```bash
npm install
```

### 2. Cấu Hình Biến Môi Trường
Tạo file `.env` ở thư mục `backend/` dựa theo file `.env.example`:
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/thuephongsv
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://127.0.0.1:5500
```
> **⚠️ CẢNH BÁO BẢO MẬT:** Tuyệt đối không commit file `.env` lên GitHub (đã được cấu hình trong `.gitignore`). Luôn dùng một chuỗi ngẫu nhiên phức tạp cho `JWT_SECRET`.

### 3. Tạo Dữ Liệu Mẫu (Seeding)
Lệnh này sẽ tự động thêm 1 tài khoản Admin và 40 phòng mẫu, kèm mã giảm giá:
```bash
npm run seed
```

### 4. Chạy Server ở Chế Độ Development
Sử dụng thư viện `tsx` để tự động khởi động lại server mỗi khi code thay đổi:
```bash
npm run dev
```

### 5. Build & Chạy ở Chế Độ Production
```bash
npm run build
npm start
```

## 🔑 Tài Khoản Admin Demo
Sau khi chạy seed, bạn có thể đăng nhập bằng tài khoản quản trị sau để lấy Token truy cập các API phân quyền:
- **Email:** `Vu69@gmail.com`
- **Mật khẩu:** `admin123` *(Đã được băm an toàn trong Database)*
- **Role:** `admin`

## 🧪 Hướng Dẫn Test API
1. Xem chi tiết danh sách các API tại file [API_DOCS.md](./API_DOCS.md).
2. Tải và sử dụng công cụ như **Postman** hoặc **Thunder Client** (VS Code Extension).
3. **Đăng nhập** (`POST /api/auth/login`) bằng tài khoản trên để nhận chuỗi `token`.
4. Khi test các tính năng của Admin, hãy thêm Header:
   - **Key:** `Authorization`
   - **Value:** `Bearer <chuỗi_token>`

## 🌱 Hướng Phát Triển Tiếp Theo
1. **Kết nối Frontend:** Đổi logic dùng localStorage trên Frontend sang sử dụng `fetch/axios` gọi tới các API này.
2. **Upload Ảnh:** Thay vì dùng URL ảnh có sẵn, có thể tích hợp Multer và Cloudinary để admin tự upload ảnh thực tế.
3. **Thanh Toán Online:** Tích hợp Stripe, VNPay hoặc Momo vào quy trình thanh toán (Booking).
4. **Chat Socket.io:** Nâng cấp hệ thống Chat AI hiện tại thành tính năng trò chuyện Real-time.
