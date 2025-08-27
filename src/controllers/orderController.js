import mongoose from "mongoose";
import { orderModel } from "../models/orderModel.js";
import { userModel } from "../models/userModel.js";
import { productModel } from "../models/productModel.js";

const allowedPayment = new Set(["cod", "card", "paypal"]);

const createOrderFromCart = async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body || {};
  try {
    if (!shippingAddress || !paymentMethod)
      return res
        .status(400)
        .json({ message: "shippingAddress and paymentMethod are required" });
    if (!allowedPayment.has(paymentMethod))
      return res.status(400).json({ message: "invalid paymentMethod" });

    const user = await userModel
      .findById(req.user._id)
      .populate({ path: "cart.product", select: "price stock name image" });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.cart || user.cart.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Build items and validate stock
    const items = [];
    for (const item of user.cart) {
      const p = item.product;
      if (!p)
        return res.status(400).json({ message: "invalid product in cart" });
      if (item.quantity > p.stock) {
        return res.status(400).json({
          message: "insufficient stock",
          product: p._id,
          available: p.stock,
        });
      }
      items.push({
        product: p._id,
        quantity: item.quantity,
        unitPrice: p.price,
      });
    }

    const session = await mongoose.startSession();
    let createdOrder;
    try {
      await session.withTransaction(async () => {
        // Decrement stock atomically per product
        for (const it of items) {
          const resUpd = await productModel.updateOne(
            { _id: it.product, stock: { $gte: it.quantity } },
            { $inc: { stock: -it.quantity } },
            { session }
          );
          if (resUpd.matchedCount === 0) {
            throw new Error("Insufficient stock during checkout");
          }
        }

        const [order] = await orderModel.create(
          [
            {
              user: user._id,
              items,
              shippingAddress,
              paymentMethod,
            },
          ],
          { session }
        );
        createdOrder = order;

        // Clear cart and attach order reference to user
        await userModel.updateOne(
          { _id: user._id },
          { $set: { cart: [] }, $push: { order: order._id } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      message: "Order created",
      orderId: createdOrder._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const listOrders = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin ? {} : { user: req.user._id };
    const orders = await orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "items.product", select: "name price image" })
      .lean();
    return res.status(200).json({ orders });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });
    const order = await orderModel
      .findById(id)
      .populate({ path: "items.product", select: "name price image" });
    if (!order) return res.status(404).json({ message: "Order not found" });
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Forbidden" });
    return res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createOrderFromCart, listOrders, getOrderById };
