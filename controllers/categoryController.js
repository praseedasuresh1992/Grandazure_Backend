import Category from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const slugify = (value) => value.toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const getCategories = asyncHandler(async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ name: 1 });
  res.json({ success: true, count: categories.length, data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description = "", image = "", slug } = req.body;
  if (!name?.trim()) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const category = await Category.create({
    name: name.trim(),
    slug: slugify(slug || name),
    description,
    image,
  });
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const updates = {};
  for (const key of ["name", "description", "image", "isActive"]) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (req.body.slug !== undefined || req.body.name !== undefined) {
    updates.slug = slugify(req.body.slug || req.body.name);
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id, { isActive: false }, { new: true }
  );
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ success: true, message: "Category deactivated", data: category });
});
