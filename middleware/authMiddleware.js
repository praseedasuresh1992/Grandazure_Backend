import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protectAdmin = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Admin authentication required");
  }

  const token = header.slice(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const admin = await Admin.findById(decoded.id).select("-password");

  if (!admin || !admin.isActive) {
    res.status(401);
    throw new Error("Admin account is unavailable");
  }

  req.admin = admin;
  next();
});
