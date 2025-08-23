import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "price must be positive"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (v) => Array.isArray(v) && v.length > 0,
        "order must have items",
      ],
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "paypal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("order", orderSchema);

export { orderModel };
