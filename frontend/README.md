# Student Room And Apartment Rental Frontend

This is a frontend demo for a student room and serviced-apartment rental platform. The project focuses on a clear, modern user experience and includes basic admin features for landlords.

## Tech Stack
- **HTML5** for semantic page structure
- **CSS3** with Flexbox, Grid, and custom properties
- **Bootstrap 5** for grid, forms, buttons, cards, and responsive tables
- **Bootstrap Icons** for UI icons
- **Vanilla JavaScript** for DOM interactions and events
- **Browser localStorage** as the offline demo data store

## Folder Structure

The frontend is split into small modules for easier maintenance and extension:

```text
frontend/
│
├── index.html       # Home page: room list, search, register/login
├── detail.html      # Room detail page: room info, reviews, booking
├── admin.html       # Admin page: revenue, orders, coupons
│
├── css/             # UI styles
│   ├── base.css           # Shared colors, typography, and resets
│   ├── layout.css         # Header, footer, and main containers
│   ├── components.css     # Buttons, cards, forms, modal, table styles
│   ├── index.css          # Home page styles
│   ├── detail.css         # Detail page styles
│   └── admin.css          # Admin page styles
│
└── js/              # Frontend logic modules
    ├── core/              # Shared utilities
    │   ├── storage.js     # localStorage helpers
    │   └── utils.js       # Formatting, escaping, query params, dates
    │
    ├── data/              # Demo data
    │   └── rooms.js       # Initial room data generation
    │
    ├── features/          # Application features
    │   ├── auth.js        # Register, login, role checks, header state
    │   ├── chat.js        # Simulated AI chat widget
    │   ├── rooms.js       # Room rendering, search, and filtering
    │   ├── booking.js     # Booking modal and payment flow
    │   ├── reviews.js     # Room reviews
    │   └── coupons.js     # Coupon apply/create logic
    │
    └── pages/             # Page initializers
        ├── index.js
        ├── detail.js
        └── admin.js
```

## Run The Project

1. Recommended: use the **Live Server** extension in VS Code.
2. Open the `frontend/` directory in VS Code.
3. Right-click `index.html` and choose **Open with Live Server**.
4. The website will open at `http://127.0.0.1:5500`.

## Demo Admin Account And Testing

### Frontend Demo
The app includes an `admin.html` page for management. Access is restricted by demo-only client-side checks.

- **Open Admin**: register or log in with a name containing **"Vũ"** or with the email **"Vu69@gmail.com"**. After login, the **Quản lý** link appears in the header.
- **Create Coupon**: go to Admin, find "Tạo Mã Giảm Giá Mới", enter a code such as `VIP99` and a discount amount, then click Add.
- **Book A Room**: log in, open a room detail page, click "Đặt phòng ngay", select a payment method, optionally apply a coupon, then confirm. Use the admin account to view the created order.

### Backend API
For API endpoints that require admin access, such as `GET /api/users`, log in with this seeded demo account:

- **Email**: `Vu69@gmail.com`
- **Password**: `admin123`
- **Role**: `admin`

This account is created by `npm run seed` in the backend and is intended only for demo/testing.

## Main Features
- View generated room listings.
- Search and filter rooms by location, price, or type.
- Register and log in from the client UI.
- Use a simulated AI chat widget.
- View room detail pages with images, price, and amenities.
- Book a room with cash or QR payment flow.
- Apply discount coupons during booking.
- Add and view room reviews.
- Use an admin dashboard for revenue, orders, coupons, and order cleanup.

## Important Notes
- This frontend is a learning/demo project.
- Offline demo data is stored in browser `localStorage`.
- To reset data, open DevTools, go to **Application** -> **Local Storage**, clear the current origin, then reload the page.
- The frontend can call the backend API when the server is running; otherwise, it falls back to localStorage.
- Admin protection in the frontend is demo-only and should not be used as real security.

## Future Improvements
- Connect all frontend flows fully to the backend API.
- Replace localStorage with MongoDB-backed data.
- Improve authentication and authorization with JWT-based server checks.
- Add landlord-specific room management.
- Integrate real payment providers such as VNPay or Momo.
