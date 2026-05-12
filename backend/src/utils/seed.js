const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { connectDatabase } = require("../config/database");
const { User } = require("../models/user.model");
const { Room } = require("../models/room.model");
const { Review } = require("../models/review.model");
const { Coupon } = require("../models/coupon.model");
const { Order } = require("../models/order.model");

const seedData = async () => {
  try {
    console.log("Connecting to database...");
    await connectDatabase();

    console.log("Ensuring demo users...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const landlordPassword = await bcrypt.hash("landlord123", 10);

    const admin = await User.findOneAndUpdate(
      { email: "Vu69@gmail.com" },
      {
        name: "Vu Admin",
        email: "Vu69@gmail.com",
        password: adminPassword,
        role: "admin",
        status: "active",
      },
      { upsert: true, new: true }
    );

    const landlord = await User.findOneAndUpdate(
      { email: "landlord@example.com" },
      {
        name: "Minh Landlord",
        email: "landlord@example.com",
        password: landlordPassword,
        role: "landlord",
        status: "active",
      },
      { upsert: true, new: true }
    );

    const roomCount = await Room.countDocuments();
    let sampleRoomIds = [];

    if (roomCount === 0) {
      console.log("Seeding rooms...");
      const categories = ["KTX", "Phong tro", "Chung cu mini", "Nha nguyen can"];
      const districts = ["Quan 1", "Quan 3", "Quan 7", "Binh Thanh", "Go Vap", "Thu Duc"];
      const amenitiesList = ["Wifi", "May lanh", "Tu lanh", "May giat", "Cho de xe", "Bao ve 24/7"];
      const roomsToInsert = [];

      for (let i = 1; i <= 40; i++) {
        const category = categories[i % categories.length];
        const district = districts[i % districts.length];
        const randomAmenities = [...amenitiesList].sort(() => 0.5 - Math.random()).slice(0, 3);

        roomsToInsert.push({
          title: `${category} cao cap ${i} tai ${district}`,
          category,
          price: Math.floor(Math.random() * 3000000) + 1000000,
          district,
          image: `https://picsum.photos/seed/room${i}/800/600`,
          description: `Phong ${category} tai ${district}, sach se va day du tien nghi co ban.`,
          amenities: randomAmenities,
          ownerId: landlord._id,
          ownerName: landlord.name,
          status: "available",
        });
      }

      const insertedRooms = await Room.insertMany(roomsToInsert);
      sampleRoomIds = insertedRooms.map((room) => room._id);
    } else {
      const rooms = await Room.find().limit(5);
      sampleRoomIds = rooms.map((room) => room._id);
    }

    if ((await Coupon.countDocuments()) === 0) {
      console.log("Seeding coupons...");
      await Coupon.insertMany([
        { code: "DIS500", value: 500000, active: true, usageLimit: 100 },
        { code: "HELLO2026", value: 200000, active: true, usageLimit: 500 },
        { code: "HOLARENTAL", value: 1000000, active: true, usageLimit: 50 },
      ]);
    }

    if ((await Review.countDocuments()) === 0 && sampleRoomIds.length > 0) {
      console.log("Seeding reviews...");
      const reviewsToInsert = sampleRoomIds.slice(0, 10).map((roomId) => ({
        roomId,
        userId: admin._id,
        userName: "Demo User",
        stars: 5,
        content: "Phong sach se, vi tri tot va chu nha than thien.",
      }));
      await Review.insertMany(reviewsToInsert);
    }

    if ((await Order.countDocuments()) === 0 && sampleRoomIds.length > 0) {
      console.log("Seeding orders...");
      const ordersToInsert = [];

      for (const roomId of sampleRoomIds.slice(0, 5)) {
        const room = await Room.findById(roomId);
        if (!room) continue;

        ordersToInsert.push({
          userId: admin._id,
          userName: admin.name,
          roomId: room._id,
          roomName: room.title,
          landlordId: landlord._id,
          originalPrice: room.price,
          discount: 0,
          pricePaid: room.price,
          paymentMethod: "cash",
          status: "success",
        });
      }

      await Order.insertMany(ordersToInsert);
    }

    console.log("Seeding completed successfully.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
