import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 50 },
  lineTotal: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  orderType: { type: String, enum: ["table", "takeaway"], required: true },
  tableNumber: {
    type: Number,
    min: 1,
    validate: {
      validator(value) { return this.orderType !== "table" || Number.isInteger(value); },
      message: "A valid table number is required for table orders",
    },
  },
  customerName: { type: String, trim: true, maxlength: 100, default: "" },
  customerPhone: { type: String, trim: true, maxlength: 25, default: "" },
  notes: { type: String, trim: true, maxlength: 500, default: "" },
  items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, "Order must contain at least one item"] },
  subtotal: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
