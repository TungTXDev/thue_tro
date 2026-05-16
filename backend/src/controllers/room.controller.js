const { Room } = require("../models/room.model");
const { RentalHistory } = require("../models/rentalHistory.model");
const { sendSuccess, sendError } = require("../utils/response");
const cloudinary = require("../config/cloudinary");

const canManageRoom = (user, room) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return room.ownerId && room.ownerId.toString() === user._id.toString();
};

const getRooms = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, district, ownerId } = req.query;
    const query = { status: { $ne: "deleted" } }; // Exclude deleted rooms

    // Only filter by status if NOT querying by ownerId (landlord view)
    // Public search should only show available rooms
    if (!ownerId) {
      query.status = "available";
    }

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
    const { title, category, price, district, description, amenities } = req.body;

    if (!title || !category || !price || !district) {
      return sendError(res, "title, category, price, and district are required", null, 400);
    }

    let imageUrls = [];

    // Upload multiple images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} images to Cloudinary...`);

      try {
        const uploadPromises = req.files.map((file, index) => {
          return new Promise((resolve, reject) => {
            console.log(`Uploading image ${index + 1}: ${file.originalname}, size: ${(file.size / 1024).toFixed(2)}KB`);

            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "rooms",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  console.error(`Upload error for image ${index + 1}:`, error);
                  reject(error);
                } else {
                  console.log(`Successfully uploaded image ${index + 1}: ${result.secure_url}`);
                  resolve(result.secure_url);
                }
              }
            );
            uploadStream.end(file.buffer);
          });
        });

        imageUrls = await Promise.all(uploadPromises);
        console.log(`All ${imageUrls.length} images uploaded successfully`);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return sendError(res, "Failed to upload images to Cloudinary", null, 500);
      }
    } else {
      console.log("No images provided in request");
    }

    const room = await Room.create({
      title,
      category,
      price: Number(price),
      district,
      image: imageUrls[0] || null, // First image as main image for backward compatibility
      images: imageUrls,
      description,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : [],
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

    const { title, category, price, district, description, amenities } = req.body;

    // Upload new images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      console.log(`Updating room with ${req.files.length} new images...`);

      try {
        // Delete old images from Cloudinary if exists
        if (room.images && room.images.length > 0) {
          console.log(`Deleting ${room.images.length} old images from Cloudinary...`);
          const deletePromises = room.images
            .filter(img => img && img.includes("cloudinary.com"))
            .map(img => {
              const publicId = img.split("/").slice(-2).join("/").split(".")[0];
              return cloudinary.uploader.destroy(publicId).catch(err => console.error("Delete error:", err));
            });
          await Promise.all(deletePromises);
        }

        // Upload new images
        const uploadPromises = req.files.map((file, index) => {
          return new Promise((resolve, reject) => {
            console.log(`Uploading new image ${index + 1}: ${file.originalname}, size: ${(file.size / 1024).toFixed(2)}KB`);

            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "rooms",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  console.error(`Upload error for image ${index + 1}:`, error);
                  reject(error);
                } else {
                  console.log(`Successfully uploaded image ${index + 1}: ${result.secure_url}`);
                  resolve(result.secure_url);
                }
              }
            );
            uploadStream.end(file.buffer);
          });
        });

        const imageUrls = await Promise.all(uploadPromises);
        console.log(`All ${imageUrls.length} new images uploaded successfully`);
        room.images = imageUrls;
        room.image = imageUrls[0] || room.image; // Update main image
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return sendError(res, "Failed to upload images to Cloudinary", null, 500);
      }
    }

    if (title) room.title = title;
    if (category) room.category = category;
    if (price) room.price = Number(price);
    if (district) room.district = district;
    if (description !== undefined) room.description = description;
    if (amenities) {
      room.amenities = Array.isArray(amenities) ? amenities : JSON.parse(amenities);
    }

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

const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return sendSuccess(res, "Query too short", { suggestions: [] });
    }

    const searchRegex = new RegExp(q, "i");

    // Get room titles
    const roomTitles = await Room.find({
      status: "available",
      title: searchRegex
    })
      .select("title district")
      .limit(3)
      .lean();

    // Get unique districts
    const districts = await Room.distinct("district", {
      status: "available",
      district: searchRegex
    });

    const suggestions = [];

    // Add room suggestions
    roomTitles.forEach(room => {
      suggestions.push({
        type: "room",
        text: room.title,
        subtitle: room.district,
        icon: "house-door"
      });
    });

    // Add district suggestions
    districts.slice(0, 2).forEach(district => {
      suggestions.push({
        type: "location",
        text: district,
        subtitle: "Khu vực",
        icon: "geo-alt"
      });
    });

    return sendSuccess(res, "Suggestions fetched successfully", {
      suggestions: suggestions.slice(0, 5)
    });
  } catch (error) {
    console.error("Get search suggestions error:", error);
    return sendError(res, "Server error while fetching suggestions", null, 500);
  }
};

// Add tenant to room
const addTenant = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.status === "deleted") {
      return sendError(res, "Room not found", null, 404);
    }

    if (!canManageRoom(req.user, room)) {
      return sendError(res, "You do not have permission to manage this room", null, 403);
    }

    const { name, email, phone, startDate, endDate, userId } = req.body;

    if (!name || !email || !phone) {
      return sendError(res, "Name, email, and phone are required", null, 400);
    }

    const tenantData = {
      name,
      email,
      phone,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
    };

    if (userId) {
      tenantData.userId = userId;
    }

    room.tenant = tenantData;
    room.status = "rented";

    await room.save();

    // Create rental history record
    await RentalHistory.create({
      roomId: room._id,
      roomTitle: room.title,
      landlordId: room.ownerId,
      tenantId: userId || null,
      tenantName: name,
      tenantEmail: email,
      tenantPhone: phone,
      startDate: tenantData.startDate,
      endDate: tenantData.endDate,
      price: room.price,
      status: "active",
    });

    return sendSuccess(res, "Tenant added successfully", { room });
  } catch (error) {
    console.error("Add tenant error:", error);
    return sendError(res, "Server error while adding tenant", null, 500);
  }
};

// Remove tenant from room
const removeTenant = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.status === "deleted") {
      return sendError(res, "Room not found", null, 404);
    }

    if (!canManageRoom(req.user, room)) {
      return sendError(res, "You do not have permission to manage this room", null, 403);
    }

    // Update rental history to completed
    await RentalHistory.findOneAndUpdate(
      {
        roomId: room._id,
        status: "active",
      },
      {
        status: "completed",
        actualEndDate: new Date(),
      }
    );

    room.tenant = undefined;
    room.status = "available";

    await room.save();

    return sendSuccess(res, "Tenant removed successfully", { room });
  } catch (error) {
    console.error("Remove tenant error:", error);
    return sendError(res, "Server error while removing tenant", null, 500);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  seedRooms,
  getSearchSuggestions,
  addTenant,
  removeTenant
};
