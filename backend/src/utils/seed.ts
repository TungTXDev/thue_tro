import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { env } from "../config/env";
import { connectDatabase } from "../config/database";
import { User } from "../models/user.model";
import { Room } from "../models/room.model";
import { Review } from "../models/review.model";
import { Coupon } from "../models/coupon.model";
import { Order } from "../models/order.model";

const seedData = async () => {
  try {
    console.log("Connecting to Database...");
    await connectDatabase();

    // 1. Seed Users
    const userCount = await User.countDocuments();
    let adminId: mongoose.Types.ObjectId;
    if (userCount === 0) {
      console.log("🌱 Seeding Users...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = await User.create({
        name: "Vũ Admin",
        email: "Vu69@gmail.com",
        password: hashedPassword,
        role: "admin",
      });
      adminId = admin._id as mongoose.Types.ObjectId;
      console.log("✅ Users seeded.");
    } else {
      console.log("⏭️ Users collection is not empty. Skipping User seeding.");
      const admin = await User.findOne({ email: "Vu69@gmail.com" });
      adminId = admin ? (admin._id as mongoose.Types.ObjectId) : new mongoose.Types.ObjectId();
    }

    // 2. Seed Rooms
    const roomCount = await Room.countDocuments();
    let sampleRoomIds: mongoose.Types.ObjectId[] = [];
    if (roomCount === 0) {
      console.log("🌱 Seeding Rooms...");
      const roomsToInsert = [];
      const categories = ["KTX", "Phòng trọ", "Chung cư mini", "Nhà nguyên căn"];
      const districts = ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Gò Vấp", "Thủ Đức"];
      const amenitiesList = ["Wifi", "Máy lạnh", "Tủ lạnh", "Máy giặt", "Chỗ để xe", "Bảo vệ 24/7"];

      for (let i = 1; i <= 40; i++) {
        const category = categories[i % categories.length];
        const district = districts[i % districts.length];
        const price = Math.floor(Math.random() * 3000000) + 1000000; // 1tr - 4tr

        // Random 3 amenities
        const randomAmenities = [...amenitiesList].sort(() => 0.5 - Math.random()).slice(0, 3);

        const randomImageIndex = (i % 15) + 1;

        roomsToInsert.push({
          title: `Phòng ${category} cao cấp ${i} tại ${district}`,
          category,
          price,
          district,
          image: `images/room${randomImageIndex}.jpg`,
          description: `Đây là một ${category} tuyệt vời tại ${district}. Căn phòng sạch sẽ, an ninh và đầy đủ tiện nghi cơ bản. Phù hợp cho sinh viên và người đi làm.`,
          amenities: randomAmenities,
          status: "available",
        });
      }

      const insertedRooms = await Room.insertMany(roomsToInsert);
      sampleRoomIds = insertedRooms.map(r => r._id as mongoose.Types.ObjectId);
      console.log("✅ Rooms seeded.");
    } else {
      console.log("⏭️ Rooms collection is not empty. Skipping Room seeding.");
      const rooms = await Room.find().limit(5);
      sampleRoomIds = rooms.map(r => r._id as mongoose.Types.ObjectId);
    }

    // 3. Seed Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log("🌱 Seeding Coupons...");
      await Coupon.insertMany([
        { code: "DIS500", value: 500000, active: true, usageLimit: 100 },
        { code: "HELLO2026", value: 200000, active: true, usageLimit: 500 },
        { code: "HOLARENTAL", value: 1000000, active: true, usageLimit: 50 },
      ]);
      console.log("✅ Coupons seeded.");
    } else {
      console.log("⏭️ Coupons collection is not empty. Skipping Coupon seeding.");
    }

    // 4. Seed Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0 && sampleRoomIds.length > 0) {
      console.log("🌱 Seeding Reviews...");
      const reviewsToInsert = [];
      for (let i = 0; i < 10; i++) {
        const roomId = sampleRoomIds[i % sampleRoomIds.length];
        reviewsToInsert.push({
          roomId,
          userId: adminId,
          userName: "Người dùng ẩn danh",
          stars: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          content: "Phòng rất đẹp và sạch sẽ, chủ nhà thân thiện. Tôi rất hài lòng khi thuê ở đây.",
        });
      }
      await Review.insertMany(reviewsToInsert);
      console.log("✅ Reviews seeded.");
    } else {
      console.log("⏭️ Reviews collection is not empty or no rooms available. Skipping Review seeding.");
    }

    // 5. Seed Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && sampleRoomIds.length > 0) {
      console.log("🌱 Seeding Orders...");
      const ordersToInsert = [];
      for (let i = 0; i < 5; i++) {
        const roomId = sampleRoomIds[i % sampleRoomIds.length];
        const room = await Room.findById(roomId);
        if (room) {
          ordersToInsert.push({
            userId: adminId,
            userName: "Vũ Admin",
            roomId: room._id,
            roomName: room.title,
            originalPrice: room.price,
            discount: 0,
            pricePaid: room.price,
            paymentMethod: "cash",
            status: "success",
          });
        }
      }
      await Order.insertMany(ordersToInsert);
      console.log("✅ Orders seeded.");
    } else {
      console.log("⏭️ Orders collection is not empty or no rooms available. Skipping Order seeding.");
    }

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
