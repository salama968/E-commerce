import { productModel } from "../models/productModel.js";
import { userModel } from "../models/userModel.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildCartResponse = (userDoc) => {
  const items = (userDoc.cart || []).map((item) => ({
    product: item.product,
    quantity: item.quantity,
    lineTotal: Number(item.quantity) * Number(item.product?.price || 0),
  }));
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const itemsCount = items.reduce((s, i) => s + Number(i.quantity), 0);
  return { items, subtotal, itemsCount };
};

const getCart = async (req, res) => {
  try {
    const populated = await userModel
      .findById(req.user._id)
      .populate({
        path: "cart.product",
        select: "name price stock category image",
      })
      .lean();
    if (!populated) return res.status(404).json({ message: "User not found" });
    const cart = buildCartResponse(populated);
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

const addToCart = async (req, res) => {
  try {
    let { productID, quantity } = req.body;
    if (!productID)
      return res.status(400).json({ message: "productID is required" });
    if (!isValidObjectId(productID))
      return res.status(400).json({ message: "invalid productID" });
    quantity = Number(quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity <= 0)
      return res
        .status(400)
        .json({ message: "quantity must be a positive integer" });

    const [user, product] = await Promise.all([
      userModel.findById(req.user._id),
      productModel.findById(productID).select("price stock name"),
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!product) return res.status(404).json({ message: "product not found" });

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productID
    );

    if (itemIndex > -1) {
      const newQty = user.cart[itemIndex].quantity + quantity;
      if (newQty > product.stock)
        return res
          .status(400)
          .json({ message: "insufficient stock", available: product.stock });
      user.cart[itemIndex].quantity = newQty;
    } else {
      if (quantity > product.stock)
        return res
          .status(400)
          .json({ message: "insufficient stock", available: product.stock });
      user.cart.push({ product: productID, quantity });
    }
    await user.save();

    const populated = await userModel
      .findById(user._id)
      .populate({
        path: "cart.product",
        select: "name price stock category image",
      })
      .lean();
    return res.status(200).json(buildCartResponse(populated));
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    let { productID, quantity } = req.body;
    if (!productID)
      return res.status(400).json({ message: "productID is required" });
    if (!isValidObjectId(productID))
      return res.status(400).json({ message: "invalid productID" });
    quantity = Number(quantity);
    if (!Number.isInteger(quantity) || quantity < 0)
      return res
        .status(400)
        .json({ message: "quantity must be a non-negative integer" });

    const [user, product] = await Promise.all([
      userModel.findById(req.user._id),
      productModel.findById(productID).select("stock"),
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productID
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "product not in cart" });
    }
    if (quantity === 0) {
      user.cart.splice(itemIndex, 1);
    } else {
      if (!product)
        return res.status(404).json({ message: "product not found" });
      if (quantity > product.stock)
        return res
          .status(400)
          .json({ message: "insufficient stock", available: product.stock });
      user.cart[itemIndex].quantity = quantity;
    }
    await user.save();

    const populated = await userModel
      .findById(user._id)
      .populate({
        path: "cart.product",
        select: "name price stock category image",
      })
      .lean();
    return res.status(200).json(buildCartResponse(populated));
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productID } = req.body;
    if (!productID)
      return res.status(400).json({ message: "productID is required" });
    if (!isValidObjectId(productID))
      return res.status(400).json({ message: "invalid productID" });

    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const before = user.cart.length;
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productID
    );
    if (user.cart.length === before) {
      return res.status(404).json({ message: "product not in cart" });
    }
    await user.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};
const emptyCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.cart = [];
    await user.save();
    res.status(200).json({ message: "Cart is empty" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

export { addToCart, removeFromCart, getCart, emptyCart, updateQuantity };
