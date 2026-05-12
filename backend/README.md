# Backend API - Student Room Rental System

This is the backend source code for the student room rental system. It provides RESTful APIs for the frontend application and follows a simple MVC-style structure that is approachable for backend beginners.

## Tech Stack
- **Node.js & Express.js:** API framework.
- **TypeScript:** Main programming language for safer, more maintainable code.
- **MongoDB & Mongoose:** Flexible NoSQL database and ODM.
- **Bcrypt:** Password hashing.
- **JSON Web Token (JWT):** Authentication and role-based access.

## Folder Structure

```text
backend/
├── src/
│   ├── config/        # Database connection and environment config
│   ├── controllers/   # Endpoint logic for Auth, Room, User, Order, etc.
│   ├── middlewares/   # Middleware such as requireAuth and requireAdmin
│   ├── models/        # Mongoose schemas and models
│   ├── routes/        # API route definitions
│   ├── types/         # TypeScript type extensions
│   ├── utils/         # Helpers such as responses and seed data
│   ├── app.ts         # Express app setup
│   └── server.ts      # Entry point that starts the server
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Setup And Run

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in `backend/` based on `.env.example`:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/thuephongsv
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://127.0.0.1:5500
```

Security note: do not commit `.env` to GitHub. Use a strong random value for `JWT_SECRET`.

### 3. Seed Demo Data

This command creates one admin account, sample rooms, coupons, reviews, and orders:

```bash
npm run seed
```

### 4. Run In Development

The development script uses `tsx` and restarts automatically when source files change:

```bash
npm run dev
```

### 5. Build And Run In Production

```bash
npm run build
npm start
```

## Demo Admin Account

After running the seed command, use this admin account to log in and get a token for protected API routes:

- **Email:** `Vu69@gmail.com`
- **Password:** `admin123`
- **Role:** `admin`

## API Testing

1. See the endpoint list in [API_DOCS.md](./API_DOCS.md).
2. Use a tool such as **Postman** or **Thunder Client**.
3. Log in with `POST /api/auth/login` using the demo admin account above.
4. For admin endpoints, include this header:
   - **Key:** `Authorization`
   - **Value:** `Bearer <token>`

## Future Improvements

1. **Frontend Integration:** Replace localStorage fallback logic with API calls for all flows.
2. **Image Upload:** Add Multer and Cloudinary so admins can upload real room images.
3. **Online Payments:** Integrate Stripe, VNPay, or Momo into the booking flow.
4. **Realtime Chat:** Upgrade the simulated AI chat into a Socket.io-based realtime chat feature.
