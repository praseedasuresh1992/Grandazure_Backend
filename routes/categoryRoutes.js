import { Router } from "express";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from "../controllers/categoryController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getCategories);
router.post("/", protectAdmin, createCategory);
router.patch("/:id", protectAdmin, updateCategory);
router.delete("/:id", protectAdmin, deleteCategory);

export default router;
