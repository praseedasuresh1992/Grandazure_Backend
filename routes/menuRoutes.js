import { Router } from "express";
import {
  getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
} from "../controllers/menuController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getMenuItems);
router.get("/:id", getMenuItem);
router.post("/", protectAdmin, createMenuItem);
router.patch("/:id", protectAdmin, updateMenuItem);
router.delete("/:id", protectAdmin, deleteMenuItem);

export default router;
