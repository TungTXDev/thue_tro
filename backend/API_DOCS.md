# API Documentation - Thuê Phòng Sinh Viên

**Base URL:** `http://localhost:4000/api`

---

## 🔐 1. Auth API (`/api/auth`)

### 1.1 Đăng ký
- **Endpoint:** `POST /auth/register`
- **Auth required:** Không
- **Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "nva@gmail.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOi..."
  }
}
```

### 1.2 Đăng nhập
- **Endpoint:** `POST /auth/login`
- **Auth required:** Không
- **Body:**
```json
{
  "email": "nva@gmail.com",
  "password": "password123"
}
```
- **Response:** (Giống đăng ký)

### 1.3 Lấy thông tin tài khoản hiện tại
- **Endpoint:** `GET /auth/me`
- **Auth required:** Có (Token)
- **Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin thành công",
  "data": { "user": { ... } }
}
```

---

## 👤 2. User API (`/api/users`)

### 2.1 Lấy danh sách người dùng
- **Endpoint:** `GET /users`
- **Auth required:** Có (Admin)

### 2.2 Xem chi tiết người dùng
- **Endpoint:** `GET /users/:id`
- **Auth required:** Có (Admin hoặc chính chủ)

### 2.3 Khóa/Mở khóa tài khoản
- **Endpoint:** `PATCH /users/:id/status`
- **Auth required:** Có (Admin)
- **Body:**
```json
{ "status": "blocked" }
```

---

## 🏠 3. Room API (`/api/rooms`)

### 3.1 Lấy danh sách phòng
- **Endpoint:** `GET /rooms`
- **Auth required:** Không
- **Query Params:** `?search=...&category=...&district=...&minPrice=...&maxPrice=...`

### 3.2 Lấy chi tiết phòng
- **Endpoint:** `GET /rooms/:id`
- **Auth required:** Không

### 3.3 Thêm phòng mới
- **Endpoint:** `POST /rooms`
- **Auth required:** Có (Admin)
- **Body:**
```json
{
  "title": "Phòng VIP",
  "category": "KTX",
  "price": 2500000,
  "district": "Quận 1",
  "image": "url",
  "description": "Mô tả",
  "amenities": ["Wifi", "Máy lạnh"]
}
```

### 3.4 Sửa phòng
- **Endpoint:** `PUT /rooms/:id`
- **Auth required:** Có (Admin)
- **Body:** Bất kỳ trường nào cần cập nhật.

### 3.5 Xóa phòng (Soft Delete)
- **Endpoint:** `DELETE /rooms/:id`
- **Auth required:** Có (Admin)

### 3.6 Tạo dữ liệu phòng mẫu (Seed)
- **Endpoint:** `POST /rooms/seed`
- **Auth required:** Có (Admin)

---

## ⭐ 4. Review API (`/api/reviews`)

### 4.1 Lấy đánh giá của một phòng
- **Endpoint:** `GET /reviews/room/:roomId`
- **Auth required:** Không

### 4.2 Thêm đánh giá
- **Endpoint:** `POST /reviews`
- **Auth required:** Tuỳ chọn (Token để lấy tên, không thì "Ẩn danh")
- **Body:**
```json
{
  "roomId": "id_cua_phong",
  "stars": 5,
  "content": "Phòng rất sạch đẹp"
}
```

---

## 🎫 5. Coupon API (`/api/coupons`)

### 5.1 Lấy danh sách mã giảm giá
- **Endpoint:** `GET /coupons`
- **Auth required:** Có (Admin)

### 5.2 Tạo mã mới
- **Endpoint:** `POST /coupons`
- **Auth required:** Có (Admin)
- **Body:**
```json
{ "code": "SALE50", "value": 50000 }
```

### 5.3 Áp dụng mã giảm giá
- **Endpoint:** `POST /coupons/apply`
- **Auth required:** Tuỳ chọn
- **Body:**
```json
{ "code": "SALE50", "roomPrice": 2000000 }
```
- **Response:** Trả về số tiền giảm và giá cuối cùng (`finalPrice`).

### 5.4 Bật/tắt mã
- **Endpoint:** `PATCH /coupons/:id/toggle`
- **Auth required:** Có (Admin)

### 5.5 Xóa mã giảm giá
- **Endpoint:** `DELETE /coupons/:id`
- **Auth required:** Có (Admin)

---

## 🛒 6. Order API (`/api/orders`)

### 6.1 Tạo đơn đặt phòng
- **Endpoint:** `POST /orders`
- **Auth required:** Tuỳ chọn
- **Body:**
```json
{
  "roomId": "...",
  "roomName": "Phòng VIP",
  "originalPrice": 2000000,
  "discount": 50000,
  "couponCode": "SALE50",
  "pricePaid": 1950000,
  "paymentMethod": "cash"
}
```

### 6.2 Xem danh sách đơn hàng
- **Endpoint:** `GET /orders`
- **Auth required:** Có (Admin)

### 6.3 Xóa lịch sử đơn hàng
- **Endpoint:** `DELETE /orders/clear`
- **Auth required:** Có (Admin)

---

## 📊 7. Admin Dashboard API (`/api/admin`)

### 7.1 Thống kê tổng quan
- **Endpoint:** `GET /admin/dashboard`
- **Auth required:** Có (Admin)
- **Response:** Trả về tổng doanh thu, số phòng, số lượng đơn, v.v.

### 7.2 Thống kê doanh thu
- **Endpoint:** `GET /admin/revenue`
- **Auth required:** Có (Admin)

### 7.3 Lấy đơn hàng (Alias)
- **Endpoint:** `GET /admin/orders`
- **Auth required:** Có (Admin)

### 7.4 Lấy danh sách Coupon (Alias)
- **Endpoint:** `GET /admin/coupons`
- **Auth required:** Có (Admin)
