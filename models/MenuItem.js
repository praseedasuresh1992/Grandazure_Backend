import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, trim: true, default: "" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  foodType: { type: String, enum: ["veg", "non-veg", "vegan"], default: "veg" },
}, { timestamps: true });

menuItemSchema.index({ name: "text", description: "text" });

export default mongoose.model("MenuItem", menuItemSchema);
