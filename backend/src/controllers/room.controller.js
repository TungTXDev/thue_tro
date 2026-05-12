const { Room } = require("../models/room.model");
const { sendSuccess, sendError } = require("../utils/response");

const canManageRoom = (user, room) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return room.ownerId && room.ownerId.toString() === user._id.toString();
};

const getRooms = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, district, ownerId } = req.query;
    const query = { status: "available" };

    if (search) query.title = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (district) query.district = district;
    if (ownerId) query.ownerId = ownerId;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, "Rooms fetched successfully", { rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return sendError(res, "Server error while fetching rooms", null, 500);
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.status === "deleted") {
      return sendError(res, "Room not found", null, 404);
    }

    return sendSuccess(res, "Room fetched successfully", { room });
  } catch (error) {
    console.error("Get room by id error:", error);
    return sendError(res, "Server error while fetching room", null, 500);
  }
};

const createRoom = async (req, res) => {
  try {
    const { title, category, price, district, image, description, amenities } = req.body;

    if (!title || !category || !price || !district) {
      return sendError(res, "title, category, price, and district are required", null, 400);
    }

    const room = await Room.create({
      title,
      category,
      price: Number(price),
      district,
      image,
      description,
      amenities,
      ownerId: req.user ? req.user._id : undefined,
      ownerName: req.user ? req.user.name : undefined,
      status: "available",
    });

    return sendSuccess(res, "Room created successfully", { room }, 201);
  } catch (error) {
    console.error("Create room error:", error);
    return sendError(res, "Server error while creating room", null, 500);
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.status === "deleted") {
      return sendError(res, "Room not found", null, 404);
    }

    if (!canManageRoom(req.user, room)) {
      return sendError(res, "You do not have permission to update this room", null, 403);
    }

    Object.assign(room, req.body);
    await room.save();

    return sendSuccess(res, "Room updated successfully", { room });
  } catch (error) {
    console.error("Update room error:", error);
    return sendError(res, "Server error while updating room", null, 500);
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return sendError(res, "Room not found", null, 404);
    }

    if (!canManageRoom(req.user, room)) {
      return sendError(res, "You do not have permission to delete this room", null, 403);
    }

    room.status = "deleted";
    await room.save();

    return sendSuccess(res, "Room deleted successfully", { room });
  } catch (error) {
    console.error("Delete room error:", error);
    return sendError(res, "Server error while deleting room", null, 500);
  }
};

const seedRooms = async (req, res) => {
  try {
    const count = await Room.countDocuments();
    if (count > 0) {
      return sendError(res, "Rooms collection is not empty", null, 400);
    }

    const categories = ["KTX", "Phòng trọ", "Chung cư mini", "Nhà nguyên căn"];
    const districts = ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Gò Vấp", "Thủ Đức"];
    const amenitiesList = ["Wifi", "Máy lạnh", "Tủ lạnh", "Máy giặt", "Chỗ để xe", "Bảo vệ 24/7"];
    const roomsToInsert = [];

    for (let i = 1; i <= 40; i++) {
      const category = categories[i % categories.length];
      const district = districts[i % districts.length];
      const randomAmenities = [...amenitiesList].sort(() => 0.5 - Math.random()).slice(0, 3);

      roomsToInsert.push({
        title: `Phòng ${category} cao cấp ${i} tại ${district}`,
        category,
        price: Math.floor(Math.random() * 3000000) + 1000000,
        district,
        image: `https://picsum.photos/seed/room${i}/800/600`,
        description: `Đây là một ${category} tuyệt vời tại ${district}.`,
        amenities: randomAmenities,
        ownerId: req.user ? req.user._id : undefined,
        ownerName: req.user ? req.user.name : undefined,
        status: "available",
      });
    }

    const insertedRooms = await Room.insertMany(roomsToInsert);
    return sendSuccess(res, "Rooms seeded successfully", { count: insertedRooms.length }, 201);
  } catch (error) {
    console.error("Seed rooms error:", error);
    return sendError(res, "Server error while seeding rooms", null, 500);
  }
};

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, seedRooms };
