import mongoose from "mongoose";
import MenuItem from "../models/MenuItem.js";
import Category from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMenuItems = asyncHandler(async (req, res) => {
  const { category, search, featured, all } = req.query;
  const filter = {};
  if (all !== "true") filter.isAvailable = true;
  if (category) {
    if (!mongoose.isValidObjectId(category)) {
      res.status(400);
      throw new Error("Invalid category ID");
    }
    filter.category = category;
  }
  if (featured === "true") filter.isFeatured = true;
  if (search?.trim()) filter.$text = { $search: search.trim() };

  const items = await MenuItem.find(filter).populate("category", "name slug").sort({ createdAt: -1 });
  res.json({ success: true, count: items.length, data: items });
});

export const getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate("category", "name slug");
  if (!item || (!item.isAvailable && req.query.all !== "true")) {
    res.status(404);
    throw new Error("Menu item not found");
  }
  res.json({ success: true, data: item });
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const { name, price, category } = req.body;
  if (!name?.trim() || price === undefined || !category) {
    res.status(400);
    throw new Error("Name, price, and category are required");
  }
  if (!Number.isFinite(Number(price)) || Number(price) < 0) {
    res.status(400);
    throw new Error("Price must be a non-negative number");
  }
  const foundCategory = await Category.findOne({ _id: category, isActive: true });
  if (!foundCategory) {
    res.status(400);
    throw new Error("An active category is required");
  }

  const item = await MenuItem.create({
    name: name.trim(),
    description: req.body.description || "",
    price: Number(price),
    category,
    image: req.body.image || "",
    isAvailable: req.body.isAvailable ?? true,
    isFeatured: req.body.isFeatured ?? false,
    foodType: req.body.foodType || "veg",
  });
  const populated = await item.populate("category", "name slug");
  res.status(201).json({ success: true, data: populated });
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const updates = {};
  for (const key of ["name", "description", "price", "category", "image", "isAvailable", "isFeatured", "foodType"]) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.price !== undefined) {
    updates.price = Number(updates.price);
    if (!Number.isFinite(updates.price) || updates.price < 0) {
      res.status(400);
      throw new Error("Price must be a non-negative number");
    }
  }
  if (updates.category) {
    const foundCategory = await Category.findOne({ _id: updates.category, isActive: true });
    if (!foundCategory) {
      res.status(400);
      throw new Error("An active category is required");
    }
  }
  const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  }).populate("category", "name slug");
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }
  res.json({ success: true, data: item });
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id, { isAvailable: false }, { new: true }
  );
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }
  res.json({ success: true, message: "Menu item marked unavailable", data: item });
});
