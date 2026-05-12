import { Request, Response } from "express";
import { Room } from "../models/room.model";
import { sendSuccess, sendError } from "../utils/response";

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, minPrice, maxPrice, district } = req.query;

    const query: any = { status: "available" };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (district) {
      query.district = district;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 });
    sendSuccess(res, "Lấy danh sách phòng thành công", { rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    sendError(res, "Lỗi máy chủ khi lấy danh sách phòng", null, 500);
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room || room.status === "deleted") {
      sendError(res, "Không tìm thấy phòng", null, 404);
      return;
    }

    sendSuccess(res, "Lấy chi tiết phòng thành công", { room });
  } catch (error) {
    console.error("Get room by id error:", error);
    sendError(res, "Lỗi máy chủ khi lấy chi tiết phòng", null, 500);
  }
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, price, district, image, description, amenities } = req.body;

    if (!title || !category || !price || !district) {
      sendError(res, "Vui lòng nhập đầy đủ các trường bắt buộc (title, category, price, district)", null, 400);
      return;
    }

    const room = await Room.create({
      title,
      category,
      price,
      district,
      image,
      description,
      amenities,
      status: "available",
    });

    sendSuccess(res, "Tạo phòng thành công", { room }, 201);
  } catch (error) {
    console.error("Create room error:", error);
    sendError(res, "Lỗi máy chủ khi tạo phòng", null, 500);
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const room = await Room.findByIdAndUpdate(id, updates, { new: true });

    if (!room || room.status === "deleted") {
      sendError(res, "Không tìm thấy phòng", null, 404);
      return;
    }

    sendSuccess(res, "Cập nhật phòng thành công", { room });
  } catch (error) {
    console.error("Update room error:", error);
    sendError(res, "Lỗi máy chủ khi cập nhật phòng", null, 500);
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndUpdate(
      id,
      { status: "deleted" },
      { new: true }
    );

    if (!room) {
      sendError(res, "Không tìm thấy phòng", null, 404);
      return;
    }

    sendSuccess(res, "Đã xóa phòng (soft delete) thành công", { room });
  } catch (error) {
    console.error("Delete room error:", error);
    sendError(res, "Lỗi máy chủ khi xóa phòng", null, 500);
  }
};

export const seedRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Room.countDocuments();
    if (count > 0) {
      sendError(res, "Collections không rỗng, bỏ qua quá trình seed", null, 400);
      return;
    }

    const roomsToInsert = [];
    const categories = ["KTX", "Phòng trọ", "Chung cư mini", "Nhà nguyên căn"];
    const districts = ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Gò Vấp", "Thủ Đức"];
    const amenitiesList = ["Wifi", "Máy lạnh", "Tủ lạnh", "Máy giặt", "Chỗ để xe", "Bảo vệ 24/7"];

    for (let i = 1; i <= 40; i++) {
      const category = categories[i % categories.length];
      const district = districts[i % districts.length];
      const price = Math.floor(Math.random() * 3000000) + 1000000;
      const randomAmenities = [...amenitiesList].sort(() => 0.5 - Math.random()).slice(0, 3);

      roomsToInsert.push({
        title: `Phòng ${category} cao cấp ${i} tại ${district}`,
        category,
        price,
        district,
        image: `https://picsum.photos/seed/room${i}/800/600`,
        description: `Đây là một ${category} tuyệt vời tại ${district}. Căn phòng sạch sẽ, an ninh và đầy đủ tiện nghi cơ bản. Phù hợp cho sinh viên và người đi làm.`,
        amenities: randomAmenities,
        status: "available",
      });
    }

    const insertedRooms = await Room.insertMany(roomsToInsert);
    sendSuccess(res, "Seed phòng thành công", { count: insertedRooms.length }, 201);
  } catch (error) {
    console.error("Seed rooms error:", error);
    sendError(res, "Lỗi máy chủ khi seed phòng", null, 500);
  }
};
