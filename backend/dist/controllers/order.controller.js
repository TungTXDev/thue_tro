const { Order } = require("../models/order.model");
const { Room } = require("../models/room.model");
const { sendSuccess, sendError } = require("../utils/response");

const createOrder = async (req, res) => {
  try {
    const { roomId, roomName, originalPrice, discount = 0, couponCode, pricePaid, paymentMethod } = req.body;

    if (!paymentMethod) {
      return sendError(res, "paymentMethod is required", null, 400);
    }

    let room = null;
    if (roomId) room = await Room.findById(roomId);

    const resolvedRoomName = room ? room.title : roomName;
    const resolvedOriginalPrice = room ? room.price : originalPrice;
    const resolvedPricePaid = pricePaid ?? resolvedOriginalPrice;

    if (!resolvedRoomName || resolvedOriginalPrice === undefined || resolvedPricePaid === undefined) {
      return sendError(res, "Missing required order information", null, 400);
    }

    const order = await Order.create({
      userId: req.user ? req.user._id : undefined,
      userName: req.user ? req.user.name : "Guest",
      roomId: room ? room._id : roomId,
      roomName: resolvedRoomName,
      landlordId: room ? room.ownerId : undefined,
      originalPrice: resolvedOriginalPrice,
      discount,
      couponCode,
      pricePaid: resolvedPricePaid,
      paymentMethod,
      status: "success",
    });

    return sendSuccess(res, "Order created successfully", { order }, 201);
  } catch (error) {
    console.error("Create order error:", error);
    return sendError(res, "Server error while creating order", null, 500);
  }
};

const getOrders = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.role === "landlord") query.landlordId = req.user._id;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, "Orders fetched successfully", { orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return sendError(res, "Server error while fetching orders", null, 500);
  }
};

const clearOrders = async (req, res) => {
  try {
    await Order.deleteMany({});
    return sendSuccess(res, "Orders cleared successfully", null);
  } catch (error) {
    console.error("Clear orders error:", error);
    return sendError(res, "Server error while clearing orders", null, 500);
  }
};

module.exports = { createOrder, getOrders, clearOrders };
