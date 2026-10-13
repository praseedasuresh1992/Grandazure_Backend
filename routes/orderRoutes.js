import { Router } from "express";
import {
  createOrder, getOrders, getOrderById, updateOrder,
} from "../controllers/orderController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", createOrder);
router.get("/", protectAdmin, getOrders);
router.get("/:id", protectAdmin, getOrderById);
router.patch("/:id", protectAdmin, updateOrder);

export default router;
