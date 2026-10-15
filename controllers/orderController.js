import crypto from "node:crypto";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { orderType, tableNumber, items, customerPhone = "", notes = "" } = req.body;

  if (!["table", "takeaway"].includes(orderType)) {
    res.status(400);
    throw new Error('orderType must be "table" or "takeaway"');
  }
  if (orderType === "table" && (!Number.isInteger(Number(tableNumber)) || Number(tableNumber) < 1)) {
    res.status(400);
    throw new Error("A valid tableNumber is required for table orders");
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("At least one order item is required");
  }
  if (items.length > 30) {
    res.status(400);
    throw new Error("An order can contain at most 30 different items");
  }

  // Never trust prices sent by the frontend. Fetch current prices from MongoDB.
  const quantities = new Map();
  for (const entry of items) {
    if (!mongoose.isValidObjectId(entry.menuItem)) {
      res.status(400);
      throw new Error("An order item contains an invalid menu item ID");
    }
    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      res.status(400);
      throw new Error("Each item quantity must be an integer from 1 to 50");
    }
    const id = String(entry.menuItem);
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  const menuItems = await MenuItem.find({
    _id: { $in: [...quantities.keys()] },
    isAvailable: true,
  });
  if (menuItems.length !== quantities.size) {
    res.status(400);
    throw new Error("One or more menu items are unavailable or do not exist");
  }

  const orderItems = menuItems.map((item) => {
    const quantity = quantities.get(String(item._id));
    const unitPrice = item.price;
    return {
      menuItem: item._id,
      unitPrice,
      quantity,
      lineTotal: Number((unitPrice * quantity).toFixed(2)),
    };
  });

  const subtotal = Number(orderItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const order = await Order.create({
    orderNumber: `FO-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    orderType,
    ...(orderType === "table" ? { tableNumber: Number(tableNumber) } : {}),
    customerPhone: String(customerPhone).trim().slice(0, 25),
    notes: String(notes).trim().slice(0, 500),
    items: orderItems,
    subtotal,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const { status, orderType, page = "1", limit = "20" } = req.query;
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const filter = {};
  const allowedStatuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

  if (status) {
    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid order status");
    }
    filter.status = status;
  }
  if (orderType) {
    if (!["table", "takeaway"].includes(orderType)) {
      res.status(400);
      throw new Error("Invalid order type");
    }
    filter.orderType = orderType;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, data: order });
});

export const updateOrder = asyncHandler(async (req, res) => {
  const allowed = {};
  if (req.body.status !== undefined) {
    const statuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
    if (!statuses.includes(req.body.status)) {
      res.status(400);
      throw new Error("Invalid order status");
    }
    allowed.status = req.body.status;
  }
  if (req.body.paymentStatus !== undefined) {
    if (!["unpaid", "paid", "refunded"].includes(req.body.paymentStatus)) {
      res.status(400);
      throw new Error("Invalid payment status");
    }
    allowed.paymentStatus = req.body.paymentStatus;
  }
  if (!Object.keys(allowed).length) {
    res.status(400);
    throw new Error("Provide a valid status or paymentStatus");
  }

  const order = await Order.findByIdAndUpdate(req.params.id, allowed, {
    new: true, runValidators: true,
  });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, data: order });
});
