import { Router } from "express";
import { loginAdmin, getAdminProfile } from "../controllers/authController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", loginAdmin);
router.get("/adminProfile", protectAdmin, getAdminProfile);

export default router;
